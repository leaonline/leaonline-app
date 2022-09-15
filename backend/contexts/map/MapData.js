import { getCollection } from '../../api/utils/getCollection'
import { createLog } from '../../infrastructure/log/createLog'
import { countUnitCompetencies } from '../competencies/countUnitCompetencies'

export const MapData = {
  name: 'mapData',
  methods: {}
}

MapData.schema = {

  /**
   * Each map is unique for a given field.
   */
  field: {
    type: String
  },

  /**
   * To save bandwidth we save the _id values of dimension documents in this array and only assign
   * the index at the respective places.
   * At rendering time the client app should use this list to resolve the _id value.
   */

  dimensions: {
    type: Array
  },
  'dimensions.$': {
    type: String
  },

  /**
   * To save bandwidth we save the _id values of level documents in this array and only assign
   * the index at the respective places.
   * At rendering time the client app should use this list to resolve the _id value.
   */

  levels: {
    type: Array
  },
  'levels.$': {
    type: String
  },

  /**
   * This is the list of entries. An entry is either a "stage" or a "milestone".
   *
   * A "stage" is a certain step in the list of actionable tasks (represented by UnitSets).
   * It contains the following structure:
   *
   * ```js
   * {
   *   type: 'stage',
   *   level: 0,
   *   progress: 1,
   *
   * }
   * ```
   */

  entries: {
    type: Array
  },
  'entries.$': {
    type: Object
  },
  'entries.$.type': {
    type: String,
    allowedValues: ['stage', 'milestone']
  },

  /**
   * The level represents the level of the stage, which is an incremental counter.
   */
  'entries.$.level': {
    type: Number
  },

  /**
   * Summary of the progress of all unitsets that are related to this "stage" or "milestone"
   */
  'entries.$.progress': {
    type: Number
  },

  /**
   * Each "stage" contains a list of actionable UnitSets but there is always only one UnitSet per dimension.
   */
  'entries.$.unitSets': {
    type: Array,
    optional: true // TODO validate against type
  },
  'entries.$.unitSets.$': {
    type: Object
  },

  /**
   * The UnitSet _id is unique for each, so we store it as is
   */
  'entries.$.unitSets.$._id': {
    type: String
  },

  /**
   * The dimension _id however occurs so often, that we only store the index value
   * of the aforementioned dimensions array here.
   */
  'entries.$.unitSets.$.dimension': {
    type: Number
  },

  /**
   * The progress of the UnitSet is already computed on the content service side.
   */
  'entries.$.unitSets.$.progress': {
    type: Number
  },

  /**
   * We only store the number of achievable competencies here.
   */
  'entries.$.unitSets.$.competencies': {
    type: Number
  },

  // milestone entries

  /**
   * All competencies for a given milestone.
   */
  'entries.$.competencies': {
    type: Array,
    optional: true // TODO validate against type
  },
  'entries.$.competencies.$': {
    type: Object
  },
  'entries.$.competencies.$.dimension': {
    type: Number
  },
  'entries.$.competencies.$.max': {
    type: Number
  }
}

const log = createLog({ name: MapData.name })
const byLevel = (a, b) => a.level - b.level

/**
 * Creates read-optimized map data for every field. This is a very resource-
 * intensive method and should only be called when a new sync has been executed.
 *
 * Do not call from a regular method that could be invoked by clients.
 */
MapData.create = ({ field, dryRun }) => {
  const fieldDoc = getCollection('field').findOne(field)

  if (!fieldDoc) {
    throw new Error(`Field doc not found by _id "${field}"`)
  }

  log('create for field', fieldDoc.title)

  const dimensions = getCollection('dimension').find().fetch()
  const levels = getCollection('level').find().fetch().sort(byLevel)

  if (!dimensions.length) throw new Error('No Dimensions found')
  if (!levels.length) throw new Error('No Levels found')

  const TestCycleCollection = getCollection('testCycle')
  const UnitSetCollection = getCollection('unitSet')
  const mapData = {
    field,
    dimensions: dimensions.map(d => d._id),
    levels: levels.map(l => l._id),
    entries: []
  }

  // for each level
  levels.forEach((levelDoc, levelIndex) => {
    log('collect level (milestone)', levelDoc._id)

    // each level ends with a milestone
    const milestone = {
      type: 'milestone',
      level: levelIndex,
      progress: 0,
      competencies: []
    }

    // -------------------------------------------------------------------------
    // phase 1 - collecting
    // -------------------------------------------------------------------------

    // we first fill all stages into lists by dimension
    // which we later distribute into an entry-list
    // like so:
    //
    // r: [ = = = = = = ]
    // w: [ = = = ]
    // l: [ = = = = = = ]
    // m: [ = = = = = ]

    const stages = {}

    // for each dimension
    dimensions.forEach((dimensionDoc, dimensionIndex) => {
      log('collect dimension', dimensionDoc._id)
      const dimensionId = dimensionDoc._id
      const testCycleDoc = TestCycleCollection.findOne({
        field: field,
        level: levelDoc._id,
        dimension: dimensionDoc._id
      })

      if (!testCycleDoc) {
        // throw new Meteor.Error('mapData.createError', 'testCycleNotFound', {
        //   field: field,
        //   level: levelDoc._id,
        //   dimension: dimensionDoc._id
        // })
        // TODO throw err ?
        return log(' no TestCycle for ', levelDoc.title, dimensionDoc.title)
      }

      // once we know, if we have any unitSets,
      // we add a new stage for this dimension
      if (!stages[dimensionId]) stages[dimensionId] = []

      // this will be the count of all competencies for the current dimension
      // which
      let maxCompetencies = 0

      UnitSetCollection.find({ _id: { $in: testCycleDoc.unitSets } })
        .fetch()
        .forEach(unitSetDoc => {
          const competencies = countCompetencies(unitSetDoc, log)
          log('collect unit set', unitSetDoc.shortCode, 'with', competencies, 'competencies')
          // push new stage to the stage data

          if (!('progress' in unitSetDoc)) {
            console.warn('no progress in unitset', unitSetDoc.shortCode)
          }

          stages[dimensionId].push({
            dimension: dimensionIndex,
            _id: unitSetDoc._id,
            progress: unitSetDoc.progress || 0,
            competencies: competencies
          })

          maxCompetencies += competencies
        })

      // after we have counted all competencies for this milestone
      // we can add a new entry with the maximum obtainable competencies
      // for the current dimension to the milestone
      milestone.competencies.push({
        dimension: dimensionIndex,
        max: maxCompetencies
      })
    })

    // -------------------------------------------------------------------------
    // phase 2 - transposing
    // -------------------------------------------------------------------------

    // now we have to take the {stages} Object and transpose it into a single
    // dimensioned list that contains an equal distribution of unit sets:
    //
    // [
    //    [r,w,l,m],
    //    [r,w,l,m],
    //    [r,w,l,m],
    //    [r,l,m],
    //    [r,l,m],
    //    [r,l]
    // ]
    //
    // Note, how writing and math are only added as often they occur on their
    // lists.

    let maxLength = 0
    const stageEntries = Object.values(stages)

    // first, we estimate the largest list length, which will
    // determine the number of stages we will get for our map
    stageEntries.forEach(list => {
      if (list.length > maxLength) {
        maxLength = list.length
      }
    })

    // now we collect in each iteration one entry from every list
    for (let i = 0; i < maxLength; i++) {
      const stage = { type: 'stage', level: levelIndex, unitSets: [], progress: 0 }

      stageEntries.forEach(list => {
        // skip, if the list already does not have any entry
        // which can happen and must be supported
        if (i > list.length - 1) { return }

        const unitSet = list[i]
        if (!('progress' in unitSet)) {
          console.warn('no progress found on', unitSet.shortCode)
        }

        // we need to sum the progress of all unitSets
        // to be able to display progress for the full stage
        stage.progress += (unitSet.progress || 0)

        stage.unitSets.push(unitSet)
      })

      // sum up progress
      milestone.progress += stage.progress

      // then we add our stage to the entries list
      mapData.entries.push(stage)
    }

    // after all stages of one iteration have been added
    // we can finally add the milestone entry
    mapData.entries.push(milestone)
  })

  if (dryRun) { return }

  // update collections
  return getCollection(MapData.name).upsert({ field }, { $set: mapData })
}

const countCompetencies = (unitSet, log) => {
  const UnitCollection = getCollection('unit')
  let count = 0

  UnitCollection.find({ _id: { $in: unitSet.units } }).forEach(unitDoc => {
    count += countUnitCompetencies({ unitDoc, log })
  })

  if (!count) {
    log(unitSet.shortCode, 'has no competencies linked')
  }
  return count
}

MapData.get = ({ field }) => getCollection(MapData.name).findOne({ field })

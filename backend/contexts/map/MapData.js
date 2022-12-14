import { getCollection } from '../../api/utils/getCollection'
import { createLog } from '../../infrastructure/log/createLog'
import { countUnitCompetencies } from '../competencies/countUnitCompetencies'
import { cursorToMap } from '../../api/utils/cursorToMap'

/**
 * Represents the "map" overview for a given field, where users are able to select
 * "stages" and view "milestones".
 * Corresponds to a Mongo.Collection that stores the map as read-optimized data structure.
 *
 * @category contexts
 * @namespace
 */
export const MapData = {
  name: 'mapData',
  methods: {}
}

/**
 * The database schema.
 */
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
    type: Number,
    min: 1
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
    type: Number,
    min: 1
  },

  /**
   * The relates unit set short-code
   */
  'entries.$.unitSets.$.code': {
    type: String
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
const warn = createLog({ name: MapData.name, type: 'warn' })
const byLevel = (a, b) => a.level - b.level
const checkIntegrity = ({ condition, premise }) => {
  if (!condition) {
    throw new Error(
      `Integrity failed: ${premise}`
    )
  }
}

/**
 * Creates read-optimized map data for every field. This is a very resource-
 * intensive method and should only be called when a new sync has been executed.
 *
 * Do not call from a regular method that could be invoked by clients.
 * @method
 *
 * @param options {object}
 * @param options.field {string} the field id
 * @param options.dryRun {boolean} if false will not be saved to db
 * @param options.dimensionsOrder {[string]} array of short codes to sort dimensions
 */
MapData.create = (options) => {
  const { field, dryRun, dimensionsOrder } = options
  const fieldDoc = getCollection('field').findOne(field)
  checkIntegrity({
    condition: fieldDoc,
    premise: `Expect field doc by _id "${field}"`
  })

  log('create for field', fieldDoc.title)
  const dimensions = getCollection('dimension')
    .find()
    .fetch()
    .sort((a, b) => dimensionsOrder.indexOf(a.shortCode) - dimensionsOrder.indexOf(b.shortCode))
  const levels = getCollection('level')
    .find()
    .fetch()
    .sort(byLevel)

  checkIntegrity({
    condition: dimensions.length,
    premise: 'Expect at least one dimension doc'
  })
  checkIntegrity({
    condition: levels.length,
    premise: 'Expect at least one level doc'
  })

  const TestCycleCollection = getCollection('testCycle')
  const UnitSetCollection = getCollection('unitSet')
  const UnitCollection = getCollection('unit')
  const mapData = {
    field,
    dimensions: dimensions.map(d => d._id),
    levels: levels.map(l => l._id),
    entries: []
  }

  // for each level
  levels.forEach((levelDoc, levelIndex) => {
    log('collect level (milestone)', levelDoc.title)

    // each level ends with a milestone
    const milestone = {
      type: 'milestone',
      level: levelIndex,
      progress: 0,
      competencies: []
    }

    // used to determine, whether to add a milestone at the end
    // of a level or not
    let hasAtLeastOneStage = false

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
      log('collect dimension', dimensionDoc.shortCode, dimensionDoc.title)
      const dimensionId = dimensionDoc._id
      const testCycleDoc = TestCycleCollection.findOne({
        field: field,
        level: levelDoc._id,
        dimension: dimensionDoc._id
      })

      // if we found no test cycle for this given combination we need to
      // make sure there is no further map building for this test cycle.
      if (!testCycleDoc) {
        return warn(fieldDoc.title, 'has no TestCycle for ', dimensionDoc.title, `(${dimensionDoc._id})`, levelDoc.title, `(${levelDoc._id})`)
      }

      // get unit sets with fallback in case they are undefined on some
      // test cycle docs and to prevent followup errors
      const unitSets = testCycleDoc.unitSets || []

      checkIntegrity({
        condition: unitSets.length,
        premise: `Expect at least one unit set for test cycle ${testCycleDoc.shortCode}`
      })

      // once we know, if we have any unitSets,
      // we add a new stage for this dimension
      if (!stages[dimensionId]) stages[dimensionId] = []

      // this will be the count of all competencies for the current dimension
      // which
      let maxCompetencies = 0

      const unitSetCursor = UnitSetCollection.find({ _id: { $in: unitSets } })
      const expectedUnitSets = unitSets.length
      const actualUnitSets = unitSetCursor.count()

      // If there is a mismatch between unit sets, as defined in the test cycle doc,
      // we have an integrity issue and need to throw this as error
      checkIntegrity({
        condition: actualUnitSets === expectedUnitSets,
        premise: `Expect ${expectedUnitSets} unit sets for test cycle ${testCycleDoc._id}, got ${actualUnitSets}`
      })

      const unitSetMap = cursorToMap(unitSetCursor)

      unitSets
        .forEach(unitSetId => {
          const unitSetDoc = unitSetMap.get(unitSetId)

          checkIntegrity({
            condition: unitSetDoc,
            premise: `Expect unit set doc by _id ${unitSetId}`
          })

          const competencies = countCompetencies(unitSetDoc, log)
          log(testCycleDoc.shortCode, 'collect unit set', unitSetDoc.shortCode, 'with', competencies, 'competencies')

          const units = unitSetDoc.units || []
          const unitCursor = UnitCollection.find({ _id: { $in: units } })
          const expectedUnits = units.length
          const actualUnits = unitCursor.count()

          checkIntegrity({
            condition: expectedUnits > 0,
            premise: `Expect units for unit set ${unitSetDoc.shortCode} to be above 0 (${JSON.stringify(unitSetDoc)})`
          })

          // We also require strict integrity of units in a unit set
          checkIntegrity({
            condition: expectedUnits === actualUnits,
            premise: `Expect ${expectedUnits} units for unit set ${unitSetDoc.shortCode}, got ${actualUnits} / ${unitSetDoc.units.toString()}`
          })

          // push new stage to the stage data
          stages[dimensionId].push({
            dimension: dimensionIndex,
            _id: unitSetDoc._id,
            progress: unitSetDoc.progress,
            code: unitSetDoc.shortCode,
            competencies: competencies
          })

          // At this point we know for sure, that there is
          hasAtLeastOneStage = true
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
    stageEntries.forEach((list = []) => {
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

        // we need to sum the progress of all unitSets
        // to be able to display progress for the full stage
        stage.progress += unitSet.progress
        stage.unitSets.push(unitSet)
      })

      // sum up progress
      milestone.progress += stage.progress

      // then we add our stage to the entries list
      mapData.entries.push(stage)
    }

    // After all stages of one iteration have been added we can finally add the milestone entry.
    // However, this is only to be added, in case there is an actual map created.
    // This is only the case, if we have added at least one stage.
    // There is a real case, where no test cycle is defined for a given combination
    // of field/dimension/level and we need to be aware of that.
    if (hasAtLeastOneStage) {
      mapData.entries.push(milestone)
    }
  })

  // At this point we skip on dryRun but also if we
  // found no way to build a map for a given field.
  // This is also important to determine, whether a field
  // should even be listed in the overview.
  if (dryRun || mapData.entries.length === 0) { return }

  // Otherwise, we can safely update the collection.
  return getCollection(MapData.name).upsert({ field }, { $set: mapData })
}

/**
 * Counts competencies of a given unitSet.
 * @private
 * @param unitSet
 * @param log
 * @return {number}
 */
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

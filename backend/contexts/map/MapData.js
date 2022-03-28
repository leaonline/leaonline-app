import { getCollection } from '../../api/utils/getCollection'
import { createLog } from '../../infrastructure/log/createLog'

export const MapData = {
  name: 'mapData',
  methods: {}
}


MapData.schema = {
  field: {
    type: String
  },

  // lookup list for the ids to save space and bandwidth

  dimensions: {
    type: Array
  },
  'dimensions.$': {
    type: String
  },

  // lookup list for the ids to save space and bandwidth

  levels: {
    type: Array
  },
  'levels.$': {
    type: String
  },


  // entries

  entries: {
    type: Array,
  },
  'entries.$': {
    type: Object
  },

  // entry-object

  'entries.$.type': {
    type: String,
    allowedValues: ['stage', 'milestone']
  },
  'entries.$.level': {
    type: Number
  },


  // stage entries

  'entries.$.progress': { // summary of the progress of all unitsets
    type: Number,
    optional: true, // TODO validate against type
  },
  'entries.$.unitSets': {
    type: Array,
    optional: true, // TODO validate against type
  },
  'entries.$.unitSets.$': {
    type: Object,
  },
  'entries.$.unitSets.$._id': {
    type: String,
  },
  'entries.$.unitSets.$.dimension': {
    type: Number,
  },
  'entries.$.unitSets.$.progress': {
    type: Number,
  },
  'entries.$.unitSets.$.competencies': {
    type: Number,
  },

  // milestone entries

  'entries.$.competencies': {
    type: Array,
    optional: true, // TODO validate against type
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


/**
 * Creates read-optimized map data for every field. This is a very resource-
 * intensive method and should only be called when a new sync has been executed.
 *
 * Do not call from a regular method that could be invoked by clients.
 */
MapData.create = ({ field, dryRun }) => {
  const fieldDoc = getCollection('field').findOne(field)
  log('create for field', fieldDoc.title)

  const dimensions = getCollection('dimension').find().fetch()
  const levels = getCollection('level').find().fetch().sort((a, b) => a.level - b.level)
  const TestCycleCollection = getCollection('testCycle')
  const UnitSetCollection = getCollection('unitSet')

  if (!dimensions.length) throw new Error()
  if (!levels.length) throw new Error()

  const mapData = {
    field,
    dimensions: dimensions.map(d => d._id),
    levels: levels.map(l => l._id),
    entries: []
  }


  // for each level
  levels.forEach((levelDoc, levelIndex) => {
    // each level ends with a milestone
    const milestone = {
      type: 'milestone',
      level: levelIndex,
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

      UnitSetCollection.find({ _id: { $in: testCycleDoc.unitSets }})
        .fetch()
        .forEach(unitSetDoc => {
          let competencies = countCompetencies(unitSetDoc, log)
          // push new stage to the stage data
          stages[dimensionId].push({
            dimension: dimensionIndex,
            _id: unitSetDoc._id,
            progress: unitSetDoc.progress,
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
      const stage = { type: 'stage', level: levelIndex, unitSets: [], progress: 0  }

      stageEntries.forEach(list => {
        // skip, if the list already does not have any entry
        // which can happen and must be supported
        if (i > list.length - 1) { return }

        const unitSet = list[i]

        // we need to sum the progress of all unitSets
        // to be able to display progress for the full stage
        stage.progress += (unitSet.progress || 0)

        stage.unitSets.push(unitSet)
      })

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

  UnitCollection.find({ _id: { $in: unitSet.units }}).forEach(unitDoc => {
    if (!unitDoc.pages?.length) {
      return log('Skip unit', unitDoc.shortCode, ': no pages')
    }
    unitDoc.pages.forEach((page, pageIndex) => {
      if (!page.content?.length) {
        return log('Skip unit', unitDoc.shortCode, 'page', pageIndex, ': no content')
      }

      page.content.forEach(entry => {
        if (entry.type !== 'item') return
        const scoring = entry.value?.scoring

        if (!scoring?.length) {
          return log('Skip unit', unitDoc.shortCode, 'page', pageIndex, ': item is no scoring')
        }

        scoring.forEach(score => {
          if (!score.competency) {
            return log('Skip unit', unitDoc.shortCode, 'page', pageIndex, ': item scoring has no competencies')
          }

          // competency can either be a string (single) or an array of strings
          // (multiple) so we need to count them correctly here:
          count += Array.isArray(score.competency)
            ? score.competency.length
            : 1
        })
      })
    })
  })

  if (!count) log(unitSet.shortCode, 'has no competencies linked')
  return count
}


MapData.get = ({ field }) => getCollection(MapData.name).findOne({ field })

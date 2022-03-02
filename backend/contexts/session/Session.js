import { getCollection } from '../../api/utils/getCollection'
import { UnitSet } from '../content/UnitSet'
import { Unit } from '../content/Unit'


/**
 * A session represents a user's current state of work on a specific {UnitSet}.
 */
export const Session = {
  name: 'session'
}

Session.schema = {
  unitSet: String,
  progress: {
    type: Number,
    defaultValue: 0
  },
  competencies: {
    type: Number,
    defaultValue: 0
  },
  unit: {
    type: String,
    optional: true
  },
  nextUnit: {
    type: String,
    optional: true
  },
  startedAt: {
    type: Date,
    optional: true
  },
  completedAt: {
    type: Date,
    optional: true
  },
  updatedAt: {
    type: Date,
    optional: true
  },
  cancelledAt: {
    type: Date,
    optional: true
  },
  continuedAt: {
    type: Date,
    optional: true
  },
}

Session.create = ({ userId, unitSetDoc }) => {
  const insertDoc = { userId, startedAt: new Date(), unitSet: unitSetDoc._id }
  const hasStory = unitSetDoc.story.length > 0
  const unitId = unitSetDoc.units[0]

  if (hasStory) {
    insertDoc.nextUnit = unitId
  }

  else {
    insertDoc.unit = unitId
  }

  const SessionCollection = getCollection(Session.name)
  const sessionId = SessionCollection.insert(insertDoc)
  return SessionCollection.findOne(sessionId)
}

Session.get = ({ unitSet, userId }) => {
  const unitSetDoc = getCollection(UnitSet.name).findOne(unitSet)
  const sessionQuery = { unitSet, userId, completedAt: { $exists: false } }

  let sessionDoc = getCollection(Session.name).findOne(sessionQuery)

    // if we have no sessionDoc we need to create a new session!
  if (!sessionDoc) {
    sessionDoc = Session.create({ userId, unitSetDoc })
  }

  let unitDoc

  if (sessionDoc.unit) {
    unitDoc = getCollection(Unit.name).findOne(sessionDoc.unit)
  }

  return { sessionDoc, unitSetDoc, unitDoc }
}

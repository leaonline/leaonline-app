import { Meteor } from 'meteor/meteor'
import { getCollection } from '../../api/utils/getCollection'
import { UnitSet } from '../content/UnitSet'
import { Unit } from '../content/Unit'
import { onServerExec } from '../../infrastructure/arch/onServerExec'
import { createLog } from '../../infrastructure/log/createLog'

/**
 * A session represents a user's current state of work on a specific {UnitSet}.
 */
export const Session = {
  name: 'session'
}

const log = createLog({ name: Session.name })

Session.schema = {
  userId: String,
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
  }
}

Session.create = ({ userId, unitSetDoc }) => {
  log('create', { userId, unitSetId: unitSetDoc._id })
  const insertDoc = { userId, startedAt: new Date(), unitSet: unitSetDoc._id }
  const hasStory = unitSetDoc.story.length > 0
  const unitId = unitSetDoc.units[0]

  if (hasStory) {
    insertDoc.nextUnit = unitId
  }

  else {
    insertDoc.unit = unitId
    insertDoc.nextUnit = getNextUnitId({ unitId, units: unitSetDoc.units })
  }

  const SessionCollection = getCollection(Session.name)
  const sessionId = SessionCollection.insert(insertDoc)
  return SessionCollection.findOne(sessionId)
}

const getNextUnitId = ({ unitId, units = [] }) => {
  if (!unitId) return units[0]

  const index = units.indexOf(unitId)

  if (index === -1) {
    log('unitId', unitId, 'not in units', units.toString())
    return undefined
  }

  // last unit
  if (index > units.length - 1) {
    return undefined
  }

  // get next
  return units[index + 1]
}

Session.get = ({ unitSet, userId }) => {
  log('get', { unitSet, userId })
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

Session.update = ({ sessionId, userId }) => {
  log('update', { sessionId, userId })
  const SessionCollection = getCollection(Session.name)
  const sessionDoc = SessionCollection.findOne({ _id: sessionId, userId })

  if (!sessionDoc) {
    throw new Meteor.Error('session.updateFailed', 'docNotFound', { sessionId, userId })
  }

  log({ sessionDoc })

  const unitDoc = sessionDoc.unit && SessionCollection.findOne(sessionDoc.unit)
  const timestamp = new Date()

  // ---------------------------------------------------------------------------
  // IF COMPLETE
  // ---------------------------------------------------------------------------
  // complete session, if this is the last unit (no next unit)

  if (!sessionDoc.nextUnit) {
    log('complete', sessionId)
    SessionCollection.update(sessionId, {
      $inc: {
        progress: unitDoc?.progress || 0,
        competencies: unitDoc?.competencies || 0
      },
      $unset: { unit: 1, nextUnit: 1 },
      $set: { completedAt: timestamp }
    })
    return null
  }

  // ---------------------------------------------------------------------------
  // NEXT ITERATION
  // ---------------------------------------------------------------------------
  log('get next unit', sessionId)
  const updateDoc = { $set: { updatedAt: timestamp } }

  // we can only update the progress if there is a unitDoc
  // on the contrary - if there is no unitDoc  then we are still in the story
  if (unitDoc) {
    updateDoc.$inc = {
      progress: unitDoc.progress || 0,
      competencies: unitDoc.competencies || 0
    }
  }

  updateDoc.$set = {
    unit: sessionDoc.nextUnit // must exist at this point
  }

  const unitSetDoc = getCollection(UnitSet.name).findOne(sessionDoc.unitSet)
  const nextUnitId = getNextUnitId({
    unitId: sessionDoc.nextUnit,
    units: unitSetDoc.units
  })

  if (nextUnitId) {
    updateDoc.$set.nextUnit = nextUnitId
  }

  else {
    updateDoc.$unset = { nextUnit: 1 }
  }

  log({ sessionId, updateDoc })

  SessionCollection.update(sessionId, updateDoc)
  return nextUnitId
}

Session.methods = {}

Session.methods.update = {
  name: 'session.methods.update',
  schema: {
    sessionId: String
  },
  run: onServerExec(function () {
    return function ({ sessionId }) {
      const { userId } = this
      return Session.update({ sessionId, userId })
    }
  })
}

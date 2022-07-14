import { Meteor } from 'meteor/meteor'
import { getCollection } from '../../api/utils/getCollection'
import { UnitSet } from '../content/UnitSet'
import { Unit } from '../content/Unit'
import { onServerExec } from '../../infrastructure/arch/onServerExec'
import { createLog } from '../../infrastructure/log/createLog'
import { Response } from '../response/Response'
import { Progress } from '../progress/Progress'

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
  fieldId: String,
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
  const insertDoc = {
    userId: userId,
    startedAt: new Date(),
    unitSet: unitSetDoc._id,
    fieldId: unitSetDoc.field
  }
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

/**
 * Updates the current session according to the following algorithm:
 *
 * 1 get sessionDoc by sessionId+userId
 * 2 get the current unitDoc by sessionDoc.unit
 *
 * 3 if session has no next unit
 *    - update progress from current unit and complete session
 *    - return null (= no next unit)
 *
 * 4
 *
 * @param sessionId
 * @param userId
 * @return {*}
 */
Session.update = ({ sessionId, userId }) => {
  log('update', { sessionId, userId })
  const SessionCollection = getCollection(Session.name)
  const UnitCollection = getCollection(Unit.name)
  const sessionDoc = SessionCollection.findOne({ _id: sessionId, userId })

  if (!sessionDoc) {
    throw new Meteor.Error('session.updateFailed', 'docNotFound', { sessionId, userId })
  }

  const unitSetDoc = getCollection(UnitSet.name).findOne(sessionDoc.unitSet)
  const unitDoc = sessionDoc.unit && UnitCollection.findOne(sessionDoc.unit)
  const timestamp = new Date()
  log({ timestamp, sessionDoc, unitDoc })

  // ---------------------------------------------------------------------------
  // IF COMPLETE
  // ---------------------------------------------------------------------------
  // complete session, if this is the last unit (no next unit)

  if (!sessionDoc.nextUnit) {
    log('complete', sessionId)
    SessionCollection.update(sessionId, {
      $inc: {
        progress: unitDoc.pages.length,
        competencies: Response.countAccomplishedAnswers({ userId, unitId: unitDoc._id, sessionId })
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
  const updateDoc = {
    $set: {
      updatedAt: timestamp,
      unit: sessionDoc.nextUnit // must exist at this point
    }
  }

  // we can only update the progress if there is a unitDoc
  // on the contrary - if there is no unitDoc  then we are still in the story
  if (unitDoc) {
    updateDoc.$inc = {
      progress: unitDoc.pages.length,
      competencies: Response.countAccomplishedAnswers({ userId, unitId: unitDoc._id, sessionId })
    }
  }

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

  log('update doc:', { sessionId, updateDoc })

  SessionCollection.update(sessionId, updateDoc)
  return sessionDoc.nextUnit
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
      const nextUnitId = Session.update({ sessionId, userId })

      Meteor.defer(() => {
        // get the updated session doc and update the user progress
        const sessionDoc = getCollection(Session.name).findOne({ _id: sessionId })
        Progress.update({
          userId: userId,
          unitSetId: sessionDoc.unitSet,
          fieldId: sessionDoc.fieldId,
          progress: sessionDoc.progress,
          competencies: sessionDoc.competencies,
          complete: !!sessionDoc.completedAt
        })
      })

      return nextUnitId
    }
  })
}

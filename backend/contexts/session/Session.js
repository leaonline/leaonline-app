import { Meteor } from 'meteor/meteor'
import { getCollection } from '../../api/utils/getCollection'
import { UnitSet } from '../content/UnitSet'
import { Unit } from '../content/Unit'
import { onServerExec } from '../../infrastructure/arch/onServerExec'
import { createLog } from '../../infrastructure/log/createLog'
import { Response } from '../response/Response'
import { Progress } from '../progress/Progress'
import { Field } from '../content/Field'
import { Dimension } from '../content/Dimension'

/**
 * A session represents a user's current state of work on a specific {Field} and {UnitSet}.
 *
 * @category contexts
 * @namespace
 */
export const Session = {
  name: 'session',
  label: 'session.title',
  icon: 'edit',
  representative: 'userId'
}

const log = createLog({ name: Session.name })

/**
 * Database schema definitions
 * @namespace
 * @memberOf Session
 */
Session.schema = {
  userId: {
    type: String
  },
  unitSet: {
    type: String
  },
  fieldId: {
    type: String,
    dependency: {
      collection: Field.name,
      field: Field.representative
    }
  },
  dimensionId: {
    type: String,
    dependency: {
      collection: Dimension.name,
      field: Dimension.representative
    }
  },
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

/**
 * Creates a new Session.
 * @param userId {string} associated user's _id
 * @param unitSetDoc {string} associated unitSet _id
 * @return {object} the new created session document
 */
Session.create = ({ userId, unitSetDoc }) => {
  log('create', { userId, unitSetId: unitSetDoc._id })
  const insertDoc = {
    userId: userId,
    startedAt: new Date(),
    unitSet: unitSetDoc._id,
    fieldId: unitSetDoc.field,
    dimensionId: unitSetDoc.dimension
  }
  const hasStory = unitSetDoc.story?.length
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

/**
 * Get the next unit of a given list of units
 * @private
 * @param unitId {string} the current unit id
 * @param units {Array<String>} list of unit ids
 * @return {undefined|string} next unit id or undefined if not found
 */
const getNextUnitId = ({ unitId, units = [] }) => {
  const index = units.indexOf(unitId)

  if (index === -1) {
    log('unitId', unitId, 'not in units', units.toString())
    return undefined
  }

  // last unit
  if (index === units.length - 1) {
    return undefined
  }

  // get next
  return units[index + 1]
}

/**
 * Gets the current session doc and unitset doc for a given unit set id and user id
 * @param unitSet {string} the _id of the associated unitset
 * @param userId {string} the _id of the associated user
 * @return {{unitSetDoc: any, sessionDoc: any, unitDoc}}
 */
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
 *
 * 2 get the current unitDoc by sessionDoc.unit
 *
 * 3 if session has no next unit
 *    - update progress / competencies from current unit and complete session
 *    - return null (= no next unit)
 *
 * 4 if session has a next unit
 *    - update progress / competencies
 *    - set next unit as new "current" unit
 *    - prefetch successor of next unit id and set this as new "next" unit
 *    - return next unit id
 *
 * @param sessionId {string} _id of the session
 * @param userId {string} _id of the user
 * @return {null|string} null if no next unit is found por a unitId if next unit is found
 */
Session.update = ({ sessionId, userId }) => {
  log('update', { sessionId, userId })
  const SessionCollection = getCollection(Session.name)
  const UnitCollection = getCollection(Unit.name)

  // 1 get sessionDoc by sessionId+userId
  const sessionDoc = SessionCollection.findOne({ _id: sessionId, userId })
  if (!sessionDoc) {
    throw new Meteor.Error('session.updateFailed', 'docNotFound', { sessionId, userId })
  }

  // 2 get the current unitDoc by sessionDoc.unit
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

/**
 * Meteor method definitions
 * @namespace
 * @memberOf Session
 * @type {object}
 */
Session.methods = {}

/**
 * Updates the session. Automatically increments to the next unit
 * or completes if no next unit exists.
 *
 * Also updates progress but as deferred (background) task.
 *
 * @memberOf Session.methods
 * @method
 * @param {string} sessionId the _id of the assiciated session
 */
Session.methods.update = {
  name: 'session.methods.update',
  schema: {
    sessionId: {
      type: String
    }
  },
  run: onServerExec(function () {
    return function ({ sessionId }) {
      const { userId } = this
      const nextUnitId = Session.update({ sessionId, userId })

      // get the updated session doc and update the user progress
      const sessionDoc = getCollection(Session.name).findOne({ _id: sessionId })

      Progress.update({
        userId: userId,
        unitSetId: sessionDoc.unitSet,
        fieldId: sessionDoc.fieldId,
        progress: sessionDoc.progress,
        dimensionId: sessionDoc.dimensionId,
        competencies: sessionDoc.competencies,
        complete: !!sessionDoc.completedAt
      })

      return nextUnitId
    }
  })
}

Session.methods.getAll = {
  name: 'session.methods.getAll',
  schema: {
    dependencies: {
      type: Array,
      optional: true
    },
    'dependencies.$': {
      type: Object,
      blackbox: true,
      optional: true
    }
  },
  backend: true,
  run: function ({ dependencies }) {
    const docs = getCollection(Session.name).find({}, {
      hint: {
        $natural: -1
      }
    }).fetch()

    const data = { [Session.name]: docs }

    if (dependencies) {
      Object.values(dependencies).forEach(dep => {
        console.debug(dep)
        const { name } = dep
        const collection = getCollection(name)
        data[name] = collection.find().fetch()
      })
    }

    return data
  }
}

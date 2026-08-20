import { createLog } from '../../infrastructure/log/createLog'
import { onServerExec } from '../../infrastructure/arch/onServerExec'
import { getCollection } from '../../api/utils/getCollection'
import { Integer, oneOf } from '../../infrastructure/factories/createSchema'

/**
 * Represents a db collection that stores a (scored) response to an item on a
 * page of a given unit.
 *
 * It is design to allow the complete association between a user's response
 * (`scores.$.value`), a given unit and the related competencies.
 *
 * @category contexts
 * @namespace
 */
export const Response = {
  name: 'response'
}

const log = createLog({ name: Response.name })

/**
 * The database schema
 */
Response.schema = {
  userId: String,
  sessionId: String,
  unitSetId: String,
  unitId: String,
  dimensionId: String,
  timeStamp: Date,
  page: Number,
  itemId: String,
  itemType: String,
  responses: {
    type: Array,
    optional: true
  },
  'responses.$': {
    type: String
  },
  scores: Array,
  'scores.$': Object,
  'scores.$.target': {
    type: Number,
    optional: true
  },
  'scores.$.competency': Array,
  'scores.$.competency.$': String,
  'scores.$.correctResponse': Array,
  'scores.$.correctResponse.$': {
    type: oneOf(String, Integer, RegExp)
  },
  'scores.$.isUndefined': Boolean,
  'scores.$.score': Boolean,
  'scores.$.value': Array,
  'scores.$.value.$': {
    type: oneOf(String, Integer)
  }
}

/**
 * Counts all answer scores of a given unit that were scored as true
 * (accomplished).
 *
 * @async
 * @param userId {string} the _id of the associated user
 * @param sessionId {string} the _id of the associated session
 * @param unitId {string} the _id of the associated unit
 * @return {number} the overall count of accomplished answers
 */
Response.countAccomplishedAnswers = async ({ userId, sessionId, unitId }) => {
  log('count accomplished answers', { userId, sessionId, unitId })
  const allDocsByUnit = getCollection(Response.name).find({ userId, sessionId, unitId })

  let count = 0

  await allDocsByUnit.forEachAsync(responseDoc => {
    responseDoc.scores.forEach(entry => {
      if (entry.score) {
        const competency = Array.isArray(entry.competency)
          ? entry.competency
          : entry.competency
            ? [entry.competency]
            : []
        // since there are more than once competencies
        // available for a single score entry, we need
        // to count them all!
        count += competency.length
      }
    })
  })

  return count
}

/**
 * Meteor Method endpoints.
 */
Response.methods = {}

const { timeStamp, userId, ...submitSchema } = Response.schema

/**
 * Inserts or updates a given user response in relation to the current session, unit and page.
 */
Response.methods.submit = {
  name: 'response.methods.submit',
  schema: submitSchema,
  run: onServerExec(function () {
    import { Progress } from '../progress/Progress'
    import { Session } from '../session/Session'
    import { Unit } from '../content/Unit'
    return async function (responseDoc) {
      const { userId } = this
      responseDoc.timeStamp = new Date()
      responseDoc.userId = userId

      const modifier = { $set: responseDoc }
      const selector = {
        sessionId: responseDoc.sessionId,
        unitId: responseDoc.unit,
        page: responseDoc.page,
        userId,
      }

      const updated = await getCollection(Response.name).upsertAsync(selector, modifier)

      // optionally update progress
      try {
        const sessionDoc = await getCollection(Session.name).findOneAsync({ _id: responseDoc.sessionId, userId })
        const unitDoc = await getCollection(Unit.name).findOneAsync({ _id: sessionDoc?.unit })
        if (sessionDoc && unitDoc?.pages?.length) {
          await Progress.update({
            userId: userId,
            unitSetId: sessionDoc.unitSet,
            fieldId: sessionDoc.fieldId,
            progress: unitDoc.pages.length,
            dimensionId: sessionDoc.dimensionId,
            competencies: sessionDoc.competencies,
            complete: false
          })
        }
      } catch (e) {
        // log error
        console.debug(e)
      }

      return updated
    }
  })
}

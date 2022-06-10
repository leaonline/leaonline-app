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
 */
export const Response = {
  name: 'response'
}

const log = createLog({ name: Response.name })

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
  scores: Array,
  'scores.$': Object,
  'scores.$.competency': String,
  'scores.$.correctResponse': Array,
  'scores.$.correctResponse.$': {
    type: oneOf(String, Integer)
  },
  'scores.$.isUndefined': Boolean,
  'scores.$.score': Boolean,
  'scores.$.value': Array,
  'scores.$.value.$': {
    type: oneOf(String, Integer)
  },
}

/**
 * Counts all answer scores of a given unit that were scored as true
 * (accomplished).
 *
 * @param userId {string}
 * @param sessionId {string}
 * @param unitId {string}
 * @return {number} the overall count of accomplished answers
 */
Response.countAccomplishedAnswers = ({ userId, sessionId, unitId }) => {
  const allDocsByUnit = getCollection(Response.name).find({ userId, sessionId, unitId })
  let count = 0


  allDocsByUnit.forEach(responseDoc => {
    responseDoc.scores.forEach(entry => {
      if (entry.score) {
        count++
      }
    })
  })

  return count
}

Response.methods = {}

const { timeStamp, userId, ...submitSchema } = Response.schema

Response.methods.submit = {
  name: 'response.methods.submit',
  schema: submitSchema,
  run: onServerExec(function () {
    return function (responseDoc) {
      responseDoc.timeStamp = new Date()
      responseDoc.userId = this.userId

      getCollection(Response.name).upsert({
        userId: this.userId,
        sessionId: responseDoc.sessionId,
        unitId: responseDoc.unit,
        page: responseDoc.page
      }, {
        $set: responseDoc
      })
    }
  })
}

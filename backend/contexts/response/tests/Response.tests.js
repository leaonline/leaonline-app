/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { Response } from '../Response'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'
import {
  restoreCollections,
  stubCollection
} from '../../../tests/helpers/stubCollection'
import { createMethod } from '../../../infrastructure/factories/createMethod'

const ResponseCollection = initTestCollection(Response)

describe('Response', function () {
  before(function () {
    stubCollection([ResponseCollection])
  })

  after(function () {
    restoreCollections()
  })

  beforeEach(function () {
    ResponseCollection.remove({})
  })

  describe(Response.countAccomplishedAnswers.name, function () {
    it('Counts all answer scores of a given unit that were scored as true', function () {
      const userId = Random.id()
      const sessionId = Random.id()
      const unitId = Random.id()
      const insertDoc1 = {
        userId,
        sessionId,
        unitId,
        scores: [{ score: true }, { score: false }]
      }
      const insertDoc2 = {
        userId,
        sessionId,
        unitId,
        scores: [{}, { score: true }]
      }
      ResponseCollection.insert(insertDoc1)
      ResponseCollection.insert(insertDoc2)
      expect(Response.countAccomplishedAnswers({ userId, sessionId, unitId }))
        .to.equal(2)
    })
  })

  describe(Response.methods.submit.name, function () {
    const method = createMethod(Response.methods.submit)

    it('saves a response', function () {
      const responseDoc = {
        sessionId: Random.id(),
        unitId: Random.id(),
        unitSetId: Random.id(),
        dimensionId: Random.id(),
        itemId: Random.id(),
        itemType: Random.id(),
        page: 1,
        scores: [{
          competency: [Random.id()],
          correctResponse: ['foo', 1, /foo/g],
          isUndefined: false,
          score: true,
          value: ['foo', 1]
        }]
      }
      const userId = Random.id()
      method._execute({ userId }, { ...responseDoc })
      const { _id, timeStamp, ...doc } = ResponseCollection.findOne()
      expect(doc).to.deep.equal({
        userId,
        ...responseDoc
      })
    })
  })
})

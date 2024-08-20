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
import { setupAndTeardown } from '../../../tests/helpers/setupAndTeardown'

const ResponseCollection = initTestCollection(Response)

describe('Response', function () {
  setupAndTeardown([ResponseCollection])

  describe(Response.countAccomplishedAnswers.name, function () {
    it('Counts all answer scores of a given unit that were scored as true', async () => {
      const userId = Random.id()
      const sessionId = Random.id()
      const unitId = Random.id()
      const insertDoc1 = {
        userId,
        sessionId,
        unitId,
        scores: [{ score: true, competency: [1, 2] }, { score: false, competency: [1] }]
      }
      const insertDoc2 = {
        userId,
        sessionId,
        unitId,
        scores: [{}, { score: true, competency: [4, 5, 6] }, { score: true, competency: 1 }, { score: true }]
      }
      await ResponseCollection.insertAsync(insertDoc1)
      await ResponseCollection.insertAsync(insertDoc2)
      expect(await Response.countAccomplishedAnswers({ userId, sessionId, unitId }))
        .to.equal(6)
    })
  })

  describe(Response.methods.submit.name, function () {
    const method = createMethod(Response.methods.submit)

    it('saves a response', async () => {
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
      await method._execute({ userId }, { ...responseDoc })
      const { _id, timeStamp, ...doc } = await ResponseCollection.findOneAsync()
      expect(doc).to.deep.equal({
        userId,
        ...responseDoc
      })
    })
  })
})

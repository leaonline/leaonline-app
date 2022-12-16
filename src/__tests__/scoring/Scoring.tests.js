import { Scoring } from '../../scoring/Scoring'
import { simpleRandom } from '../../__testHelpers__/simpleRandom'
import { expectThrowAsync } from '../../__testHelpers__/expectThrowAsync'

describe(Scoring.name, function () {
  describe(Scoring.score.name, () => {
    it('throws if there is no scoring handler found by options', async () => {
      const type = simpleRandom()
      const subtype = simpleRandom()
      const options = { type, subtype }

      await expectThrowAsync({
        fn: () => Scoring.score(options),
        message: `Expected scoring fn by ${type} / ${subtype}`
      })
    })
    it('executes the respective registered scoring handler', async () => {
      const type = simpleRandom()
      const subtype = simpleRandom()
      const expectedResult = simpleRandom()
      const scoreFn = () => expectedResult
      const options = { type, subtype, scoreFn }
      Scoring.register(options)
      const result = await Scoring.score(options)
      expect(result).toEqual(expectedResult)
    })
  })
  describe(Scoring.validateItemDoc.name, () => {
    it('throws if a given document is no valid itemDoc', () => {
      expect(() => Scoring.validateItemDoc())
        .toThrow('Expected itemDoc, got undefined')
      expect(() => Scoring.validateItemDoc({}))
        .toThrow('Expected itemDoc to have property "scoring"')
    })
    it('silently passes o a valid item doc', () => {
      const itemDoc = { scoring: [{}] }
      Scoring.validateItemDoc(itemDoc)
    })
  })
})

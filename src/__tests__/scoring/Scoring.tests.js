import { Scoring } from '../../lib/scoring/Scoring'
import { simpleRandom } from '../../__testHelpers__/simpleRandom'
import { expectThrowAsync } from '../../__testHelpers__/expectThrowAsync'

describe(Scoring.name, function () {
  describe(Scoring.score.name, () => {
    it('throws if an invalid itemDoc is given', () => {
      expectThrowAsync({
        fn: () => Scoring.score(),
        message: 'Expected itemDoc, got undefined'
      })
      expectThrowAsync({
        fn: () => Scoring.score({}),
        message: 'Expected itemDoc to have property "scoring"'
      })
    })
    it('throws if an invalid responseDoc is given', () => {
      expectThrowAsync({
        fn: () => Scoring.score({ scoring: [{}] }),
        message: 'Expected responseDoc, got undefined'
      })
      expectThrowAsync({
        fn: () => Scoring.score({ scoring: [{}] }, {}),
        message: 'Expected responseDoc to have Array-like property "responses"'
      })
    })
    it('throws if there is no scoring handler found by options', async () => {
      const type = simpleRandom()
      const subtype = simpleRandom()
      const options = { type, subtype, scoring: [{}] }

      await expectThrowAsync({
        fn: () => Scoring.score(options, { responses: [''] }),
        message: `Expected scoring fn by ${type} / ${subtype}`
      })
    })
    it('executes the respective registered scoring handler', async () => {
      const type = simpleRandom()
      const subtype = simpleRandom()
      const expectedResult = simpleRandom()
      const scoreFn = () => expectedResult
      const options = { type, subtype, scoring: [{}] }
      Scoring.register({ type, subtype, scoreFn })
      const result = await Scoring.score(options, { responses: [] })
      expect(result).toEqual(expectedResult)
    })
  })
})

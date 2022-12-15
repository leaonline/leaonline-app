import { Choice } from '../../../items/choice/Choice'
import { scoreChoice } from '../../../items/choice/scoring'
import { simpleRandom } from '../../../__testHelpers__/simpleRandom'
import { Scoring } from '../../../scoring/Scoring'
import { toInteger } from '../../../utils/toInteger'
import { isUndefinedResponse } from '../../../scoring/isUndefinedResponse'

const createItemDoc = ({ flavor, competency, correctResponse, requires } = {}) => {
  return {
    flavor: flavor ?? Choice.flavors.single.value,
    scoring: [{
      competency: competency ?? simpleRandom(),
      correctResponse: correctResponse ?? Math.round(Math.random() * 100).toString(10),
      requires: requires ?? simpleRandom()
    }]
  }
}

describe(Choice.name, () => {
  describe(scoreChoice.name, () => {
    it('throws when there is an unknown flavor', () => {
      [
        { scoring: [{}] },
        { scoring: [{}], flavor: -99 }
      ].forEach(value => {
        expect(() => scoreChoice(value))
          .toThrow(`Unexpected choice flavor: ${value.flavor}`)
      })
    })

    describe(Choice.flavors.single.name, () => {
      it('scores an undefined single choice response', () => {
        const itemDoc = createItemDoc()

        ;['', null, undefined, Scoring.UNDEFINED].forEach(value => {
          const responseDoc = { responses: [value] }
          expect(scoreChoice(itemDoc, responseDoc)).toEqual([{
            competency: itemDoc.scoring[0].competency,
            correctResponse: itemDoc.scoring[0].correctResponse,
            value,
            score: false,
            isUndefined: true
          }])
        })

      })
      it('scores a truthy single choice response', () => {
        const itemDoc = createItemDoc()
        const responseDoc = { responses: [itemDoc.scoring[0].correctResponse] }
        const result = scoreChoice(itemDoc, responseDoc)
        expect(result).toEqual([{
          competency: itemDoc.scoring[0].competency,
          correctResponse: itemDoc.scoring[0].correctResponse,
          value: Number.parseInt(itemDoc.scoring[0].correctResponse),
          score: true,
          isUndefined: false
        }])
      })
      it('scores a falsy single choice response', () => {
        const itemDoc = createItemDoc()
        const responseDoc = { responses: ['-99'] }
        const result = scoreChoice(itemDoc, responseDoc)
        expect(result).toEqual([{
          competency: itemDoc.scoring[0].competency,
          correctResponse: itemDoc.scoring[0].correctResponse,
          value: -99,
          score: false,
          isUndefined: false
        }])
      })
    })

    describe(Choice.flavors.multiple.name, () => {
      it('scores undefined multiple choice response', () => {
        const itemDoc = createItemDoc({
            flavor: Choice.flavors.multiple.value,
            correctResponse: [3, 18],
            requires: Scoring.types.all.value
          })

        ;[[], [''], [null], [Scoring.UNDEFINED], undefined, null, '', Scoring.UNDEFINED]
          .forEach(responses => {
            const responseDoc = { responses }
            const result = scoreChoice(itemDoc, responseDoc)
            expect(result).toEqual([{
              competency: itemDoc.scoring[0].competency,
              correctResponse: itemDoc.scoring[0].correctResponse,
              value: responses === undefined ? [] : responses,
              score: false,
              isUndefined: true
            }])
          })
      })
      it('throws when there is an unknown scoring type', () => {
        const itemDoc = createItemDoc({
          flavor: Choice.flavors.multiple.value,
          correctResponse: [3, 18],
          requires: -99
        })
        const reponseDoc = { responses: ['3', '18' ]}
        expect(() => scoreChoice(itemDoc, reponseDoc))
          .toThrow(`Unexpected scoring type: -99`)
      })

      describe(Scoring.types.all.name, () => {
        it('scores a truthy multiple choice response (requires all)', () => {
          const itemDoc = createItemDoc({
            flavor: Choice.flavors.multiple.value,
            correctResponse: ['3', '18'],
            requires: Scoring.types.all.value
          })
          const responseDoc = { responses: ['3', '18'] }
          const result = scoreChoice(itemDoc, responseDoc)
          expect(result).toEqual([{
            competency: itemDoc.scoring[0].competency,
            correctResponse: itemDoc.scoring[0].correctResponse,
            value: [3, 18].sort(),
            score: true,
            isUndefined: false
          }])
        })
        it('scores a falsy multiple choice response (requires all)', () => {
          const itemDoc = createItemDoc({
              flavor: Choice.flavors.multiple.value,
              correctResponse: ['3', '18'],
              requires: Scoring.types.all.value
            })

          ;[['3'], ['18'], ['3', '18', '24'], ['2'], ['2', '20'], ['2', '20', '30']]
            .forEach(responses => {
              const responseDoc = { responses }
              const result = scoreChoice(itemDoc, responseDoc)
              expect(result).toEqual([{
                competency: itemDoc.scoring[0].competency,
                correctResponse: itemDoc.scoring[0].correctResponse,
                value: responses.map(toInteger).sort(),
                score: false,
                isUndefined: false
              }])
            })
        })
      })
      
      describe(Scoring.types.any.name, () => {
        it('scores a truthy multiple choice response (requires any)', () => {
          const itemDoc = createItemDoc({
            flavor: Choice.flavors.multiple.value,
            correctResponse: [3, 18],
            requires: Scoring.types.any.value
          })

          ;[['3'], ['18'], ['3', '15'], [Scoring.UNDEFINED, '3'], ['1', '18', '20']]
            .forEach(responses => {
              const responseDoc = { responses }
              const result = scoreChoice(itemDoc, responseDoc)
              expect(result).toEqual([{
                competency: itemDoc.scoring[0].competency,
                correctResponse: itemDoc.scoring[0].correctResponse,
                value: responses.map(value => {
                  if (isUndefinedResponse(value)) return undefined
                  return toInteger(value)
                }),
                score: true,
                isUndefined: false
              }])
            })
        })
        it('scores a falsy multiple choice response (requires any)', () => {
          const itemDoc = createItemDoc({
              flavor: Choice.flavors.multiple.value,
              correctResponse: [3, 18],
              requires: Scoring.types.any.value
            })

          ;[['1'], ['20', '23']]
            .forEach(responses => {
              const responseDoc = { responses }
              const result = scoreChoice(itemDoc, responseDoc)
              expect(result).toEqual([{
                competency: itemDoc.scoring[0].competency,
                correctResponse: itemDoc.scoring[0].correctResponse,
                value: responses.map(toInteger).sort(),
                score: false,
                isUndefined: false
              }])
            })
        })

      })
    })
  })
})

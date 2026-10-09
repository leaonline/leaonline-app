import { scoreCloze } from '../../../lib/items/cloze/scoring'
import { Scoring } from '../../../lib/scoring/Scoring'
import { simpleRandom } from '../../../__testHelpers__/simpleRandom'

const createItemDoc = ({ competency, correctResponse } = {}) => {
  return {
    scoring: [{
      target: 0,
      competency: competency ?? [simpleRandom(), simpleRandom()],
      correctResponse: correctResponse ?? /.*/
    }, {
      target: 1,
      competency: competency ?? [simpleRandom(), simpleRandom()],
      correctResponse: correctResponse ?? /.*/
    }]
  }
}

describe(scoreCloze.name, function () {
  it('detects if all responses are undefined', () => {
    const itemDoc = createItemDoc()
    const allResponses = [
      [], ['', ''], [undefined, undefined], [null, null], [Scoring.UNDEFINED, Scoring.UNDEFINED]
    ]
    allResponses.forEach(responses => {
      const responseDoc = { responses }
      expect(scoreCloze(itemDoc, responseDoc))
        .toEqual([
          {
            competency: itemDoc.scoring[0].competency,
            correctResponse: itemDoc.scoring[0].correctResponse,
            value: responseDoc.responses[0],
            score: false,
            target: 0,
            isUndefined: true
          },
          {
            competency: itemDoc.scoring[1].competency,
            correctResponse: itemDoc.scoring[1].correctResponse,
            value: responseDoc.responses[1],
            score: false,
            target: 1,
            isUndefined: true
          }
        ])
    })
  })
  it('scores correct responses with ture scores', () => {
    const itemDoc = createItemDoc({
      correctResponse: /\w+/i
    })
    const allResponses = [
      ['foo', 'bar'], ['     bar', '\nbaz'], ['lol', 'mooooo#!']
    ]
    allResponses.forEach(responses => {
      const responseDoc = { responses }
      expect(scoreCloze(itemDoc, responseDoc))
        .toEqual([
          {
            competency: itemDoc.scoring[0].competency,
            correctResponse: itemDoc.scoring[0].correctResponse,
            value: responseDoc.responses[0],
            score: true,
            target: 0,
            isUndefined: false
          },
          {
            competency: itemDoc.scoring[1].competency,
            correctResponse: itemDoc.scoring[1].correctResponse,
            value: responseDoc.responses[1],
            score: true,
            target: 1,
            isUndefined: false
          }
        ])
    })
  })
  it('scores mixed true/false responses with respective scores', () => {
    const itemDoc = {
      scoring: [{
        target: 0,
        competency: [simpleRandom(), simpleRandom()],
        correctResponse: /^F.*$/
      }, {
        target: 0,
        competency: [simpleRandom(), simpleRandom()],
        correctResponse: /foo/
      }, {
        target: 1,
        competency: [simpleRandom(), simpleRandom()],
        correctResponse: /^bar$/
      }]
    }
    expect(scoreCloze(itemDoc, { responses: ['foo', 'bar'] }))
      .toEqual([{
        competency: itemDoc.scoring[0].competency,
        correctResponse: itemDoc.scoring[0].correctResponse,
        value: 'foo',
        score: false,
        target: 0,
        isUndefined: false
      }, {
        competency: itemDoc.scoring[1].competency,
        correctResponse: itemDoc.scoring[1].correctResponse,
        value: 'foo',
        score: true,
        target: 0,
        isUndefined: false
      }, {
        competency: itemDoc.scoring[2].competency,
        correctResponse: itemDoc.scoring[2].correctResponse,
        value: 'bar',
        score: true,
        target: 1,
        isUndefined: false
      }])
  })
  it('scores true/undefined responses with respective score', () => {
    const itemDoc = createItemDoc()
    const allResponses = [
      ['a'], ['foo', ''], ['moo', undefined], ['bar', null], ['baz', Scoring.UNDEFINED]
    ]
    allResponses.forEach((responses) => {
      const responseDoc = { responses }
      expect(scoreCloze(itemDoc, responseDoc))
        .toEqual([
          {
            competency: itemDoc.scoring[0].competency,
            correctResponse: itemDoc.scoring[0].correctResponse,
            value: responseDoc.responses[0],
            score: true,
            target: 0,
            isUndefined: false
          },
          {
            competency: itemDoc.scoring[1].competency,
            correctResponse: itemDoc.scoring[1].correctResponse,
            value: responseDoc.responses[1],
            score: false,
            target: 1,
            isUndefined: true
          }
        ])
    })
  })
})

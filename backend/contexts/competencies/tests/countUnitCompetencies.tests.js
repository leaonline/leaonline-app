/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { countUnitCompetencies } from '../countUnitCompetencies'

describe(countUnitCompetencies.name, function () {
  it('it aborts if unit doc has no pages', function () {
    const unitDoc = { _id: Random.id() }
    expect(countUnitCompetencies({ unitDoc })).to.equal(0)
  })
  it('skips pages if it has no content', function () {
    const unitDocs = [
      { _id: Random.id(), pages: [] },
      { _id: Random.id(), pages: [{ content: [] }] }
    ]
    unitDocs.forEach(unitDoc => expect(countUnitCompetencies({ unitDoc })).to.equal(0))
  })
  it('correctly counts competencies', function () {
    const unitDoc = {
      _id: Random.id(),
      shortCode: '123',
      pages: [
        // ('skips content if it is no item')
        { content: [{}] },
        // ('skips content if it has no scoring')
        { content: [{ type: 'item' }] },
        // ('skips scoring if it has no competency')
        { content: [{ type: 'item', value: { scoring: [{}] } }] },
        // count
        { content: [{ type: 'item', value: { scoring: [{ competency: 'foo' }] } }] },
        // count array
        { content: [{ type: 'item', value: { scoring: [{ competency: ['foo', 'bar'] }] } }] }
      ]
    }
    expect(countUnitCompetencies({ unitDoc })).to.equal(3)

    // use cache
    expect(countUnitCompetencies({ unitDoc })).to.equal(3)
  })
})

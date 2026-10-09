import { expect } from 'chai'
import { resolvePosition, sessionSelection } from '../navigation.js'

describe('learner map navigation', function () {
  const model = { anchorId: 'a', stages: [{ id: 'a', choices: [{ _id: 'u' }] }, { id: 'b', choices: [{ _id: 'v' }] }] }
  it('resolves URL stage then UnitSet, return position, automatic anchor', function () {
    expect(resolvePosition(model, { stage: 'a', unitSet: 'v' }, 'b')).to.deep.equal({ currentId: 'a', selectedId: 'a' })
    expect(resolvePosition(model, { unitSet: 'v' }, 'a').selectedId).to.equal('b')
    expect(resolvePosition(model, { stage: 'invalid' }, 'b')).to.deep.equal({ currentId: 'b', selectedId: null })
    expect(resolvePosition(model, {}, 'invalid').currentId).to.equal('a')
  })
  it('starts story only when present, otherwise enters the first unit', async function () {
    const calls = []
    const result = await sessionSelection({
      unitSetId: 'u',
      lookup: async () => ({ sessionDoc: { _id: 's', unitSet: 'u', unit: 'first' }, unitSetDoc: { _id: 'u', units: ['first'] } }),
      decide: async () => { calls.push('decision') },
      start: () => calls.push('start'),
      active: () => true
    })
    expect(result).to.deep.equal({ sessionId: 's', unitSetId: 'u', unitId: 'first', showStory: false })
    expect(calls).to.deep.equal(['start'])
  })
  it('continues existing work and honors cancellation', async function () {
    const docs = { sessionDoc: { _id: 's', unitSet: 'u', unit: 'second', progress: 2 }, unitSetDoc: { _id: 'u', units: ['first', 'second'] } }
    const options = { unitSetId: 'u', lookup: async () => docs, active: () => true, start: () => {} }
    expect(await sessionSelection({ ...options, decide: async () => 'continue' })).to.include({ unitId: 'second', showStory: false })
    expect(await sessionSelection({ ...options, decide: async () => 'cancel' })).to.equal(null)
  })
  it('advances a restarted storyless Session once before navigating', async function () {
    let advances = 0
    let lookups = 0
    const docs = { sessionDoc: { _id: 's', unitSet: 'u', unit: 'second' }, unitSetDoc: { _id: 'u', units: ['first', 'second'] } }
    const result = await sessionSelection({
      unitSetId: 'u',
      lookup: async () => ++lookups === 1 ? docs : { ...docs, sessionDoc: { _id: 's', unitSet: 'u', unit: 'first' } },
      active: () => true,
      start: () => {},
      decide: async () => 'restart',
      restart: async () => ({ ...docs, sessionDoc: { _id: 's', unitSet: 'u', nextUnit: 'first' } }),
      advance: async () => { advances++; return 'first' }
    })
    expect(result.unitId).to.equal('first')
    expect(advances).to.equal(1)
    expect(lookups).to.equal(2)
  })
  it('rejects missing documents and discards a lookup completed after leaving', async function () {
    let error
    try { await sessionSelection({ unitSetId: 'u', lookup: async () => ({}), active: () => true }) }
    catch (e) { error = e }
    expect(error).to.be.instanceOf(Error)
    expect(await sessionSelection({ unitSetId: 'u', lookup: async () => ({}), active: () => false })).to.equal(null)
  })
  it('shows a story only before the first unit and does not prompt or advance it', async function () {
    let starts = 0
    const result = await sessionSelection({
      unitSetId: 'u',
      active: () => true,
      lookup: async () => ({ sessionDoc: { _id: 's', unitSet: 'u', nextUnit: 'first' }, unitSetDoc: { _id: 'u', story: ['story'], units: ['first'] } }),
      start: () => starts++
    })
    expect(result).to.include({ sessionId: 's', unitSetId: 'u', showStory: true })
    expect(starts).to.equal(1)
  })
  it('does not install a Session if storyless advancement fails or navigation becomes stale', async function () {
    let starts = 0
    let active = true
    const options = {
      unitSetId: 'u',
      active: () => active,
      lookup: async () => ({ sessionDoc: { _id: 's', unitSet: 'u', nextUnit: 'first' }, unitSetDoc: { _id: 'u', units: ['first'] } }),
      start: () => starts++
    }
    let error
    try { await sessionSelection({ ...options, advance: async () => { throw new Error('rejected') } }) }
    catch (e) { error = e }
    expect(error.message).to.equal('rejected')
    expect(starts).to.equal(0)
    expect(await sessionSelection({ ...options, advance: async () => { active = false; return 'first' } })).to.equal(null)
    expect(starts).to.equal(0)
  })
  it('stops after a cancelled decision and rejects a mismatched restart result', async function () {
    let active = true
    let starts = 0
    const docs = { sessionDoc: { _id: 's', unitSet: 'u', unit: 'second' }, unitSetDoc: { _id: 'u', units: ['first', 'second'] } }
    const options = { unitSetId: 'u', lookup: async () => docs, active: () => active, start: () => starts++ }
    expect(await sessionSelection({ ...options, decide: async () => { active = false; return 'restart' } })).to.equal(null)
    active = true
    let error
    try {
      await sessionSelection({ ...options, decide: async () => 'restart', restart: async () => ({ ...docs, sessionDoc: { _id: 'other', unitSet: 'u', unit: 'first' } }) })
    }
    catch (e) { error = e }
    expect(error).to.be.instanceOf(Error)
    expect(starts).to.equal(0)
  })
})

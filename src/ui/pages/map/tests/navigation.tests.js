import { expect } from 'chai'
import { resolvePosition, sessionSelection } from '../navigation.js'

describe('learner map navigation', function () {
  const documents = () => ({
    sessionDoc: { _id: 's', userId: 'user', fieldId: 'field', unitSet: 'u', unit: 'second' },
    unitSetDoc: { _id: 'u', field: 'field', units: ['first', 'second'] }
  })
  for (const [name, change] of [
    ['user', docs => { docs.sessionDoc.userId = 'other' }],
    ['Session field', docs => { docs.sessionDoc.fieldId = 'other' }],
    ['UnitSet field', docs => { docs.unitSetDoc.field = 'other' }],
    ['Session UnitSet', docs => { docs.sessionDoc.unitSet = 'other' }],
    ['UnitSet identity', docs => { docs.unitSetDoc._id = 'other' }],
    ['current unit', docs => { docs.sessionDoc.unit = 'other' }],
    ['completed Session', docs => { docs.sessionDoc.completedAt = new Date() }]
  ]) {
    it(`rejects ${name} mismatch before asking or installing`, async function () {
      const docs = documents()
      change(docs)
      const calls = []
      let error
      try {
        await sessionSelection({
          unitSetId: 'u',
          userId: 'user',
          fieldId: 'field',
          active: () => true,
          lookup: async () => docs,
          decide: async () => { calls.push('decide'); return 'continue' },
          start: () => calls.push('start')
        })
      }
      catch (e) { error = e }
      expect(error?.message).to.equal('map.sessionFailed')
      expect(calls).to.deep.equal([])
    })
  }
  for (const boundary of ['lookup', 'decision', 'restart', 'advance', 'reload']) {
    it(`discards cancellation while awaiting ${boundary}`, async function () {
      let release
      let entered
      let active = true
      let reads = 0
      let starts = 0
      const reached = new Promise(resolve => { entered = resolve })
      const pending = new Promise(resolve => { release = resolve })
      const pause = async (name, value) => {
        if (name === boundary) { entered(); await pending }
        return value
      }
      const docs = documents()
      const reset = { ...docs, sessionDoc: { ...docs.sessionDoc, unit: null } }
      const loaded = { ...docs, sessionDoc: { ...docs.sessionDoc, unit: 'first' } }
      const result = sessionSelection({
        unitSetId: 'u',
        userId: 'user',
        fieldId: 'field',
        active: () => active,
        lookup: () => ++reads === 1 ? pause('lookup', docs) : pause('reload', loaded),
        decide: () => pause('decision', 'restart'),
        restart: () => pause('restart', reset),
        advance: () => pause('advance', 'first'),
        start: () => starts++
      })
      await reached
      active = false
      release()
      expect(await result).to.equal(null)
      expect(starts).to.equal(0)
    })
  }
  for (const failure of ['empty advance', 'failed reload', 'wrong Session', 'wrong unit']) {
    it(`does not install after ${failure}`, async function () {
      const docs = documents()
      docs.sessionDoc.unit = null
      let reads = 0
      let starts = 0
      let error
      try {
        await sessionSelection({
          unitSetId: 'u',
          active: () => true,
          lookup: async () => {
            if (++reads === 1) return docs
            if (failure === 'failed reload') throw new Error('reload failed')
            return { ...docs, sessionDoc: { ...docs.sessionDoc, _id: failure === 'wrong Session' ? 'other' : 's', unit: failure === 'wrong unit' ? 'second' : 'first' } }
          },
          advance: async () => failure === 'empty advance' ? null : 'first',
          start: () => starts++
        })
      }
      catch (e) { error = e }
      expect(error).to.be.instanceOf(Error)
      expect(starts).to.equal(0)
    })
  }
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

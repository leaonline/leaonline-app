import { expect } from 'chai'
import { buildMapModel, percentage, diamondFraction, layoutMap } from '../model.js'
import realTopology from './fixtures/map.json'
import realProgress from './fixtures/progress.json'

export const topology = {
  field: 'field',
  dimensions: [{ _id: 'unused' }, { _id: 'reading' }, { _id: 'math' }],
  levels: ['level'],
  entries: [
    { type: 'stage', level: 0, progress: 8, unitSets: [{ _id: 'a', dimension: 1, progress: 4, competencies: 10 }, { _id: 'b', dimension: 2, progress: 4, competencies: 8 }] },
    { type: 'stage', level: 0, progress: 4, unitSets: [{ _id: 'c', dimension: 2, progress: 4, competencies: 8 }] },
    { type: 'stage', level: 0, progress: 4, unitSets: [{ _id: 'd', dimension: 1, progress: 4, competencies: 8 }] },
    { type: 'milestone', level: 0 }
  ]
}
export const inputs = {
  topology,
  dimensions: [{ _id: 'reading', title: 'Reading', icon: 'book', color: 'primary' }, { _id: 'math', title: 'Math', icon: 'calculator', color: 'success' }],
  levels: [{ _id: 'level', title: 'Level 1' }],
  icons: ['book']
}
const model = (unitSets = [], options = {}) => buildMapModel({ ...inputs, progress: { unitSets }, ...options })
const complete = _id => ({ _id, complete: true, progress: 4, competencies: 2 })

const coordinates = connector => connector.path.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi).map(Number)
const shape = (connector, width) => {
  const [x, y, x1, y1, x2, y2, endX, endY] = coordinates(connector)
  const span = endY - y
  const bend = Math.min(24, width * 0.06)
  return [(x1 - x) / bend, (y1 - y) / span, (x2 - endX) / bend, (y2 - y) / span].map(n => n.toFixed(6)).join(',')
}

describe('learner map model', function () {
  for (const width of [240, 320, 768, 1320, undefined, NaN, Infinity, -1]) {
    for (const [name, source] of [
      ['empty', { ...topology, entries: [] }],
      ['single stage', { ...topology, entries: [topology.entries[0]] }],
      ['long fixture', realTopology]
    ]) {
      it(`lays out ${name} with bounded downward curves at width ${width}`, function () {
        const result = buildMapModel({ ...inputs, topology: source })
        const scene = layoutMap(result, width)
        expect(scene.width).to.equal(Number.isFinite(width) ? Math.max(240, width) : 320)
        expect(scene.entries.map(e => e.id)).to.deep.equal(result.entries.map(e => e.id))
        expect(scene.connectors).to.have.length(Math.max(0, scene.entries.length - 1))
        scene.connectors.forEach((connector, index) => {
          const from = scene.entries[index]
          const to = scene.entries[index + 1]
          const points = coordinates(connector)
          expect(points).to.have.length(8)
          expect(points.every(Number.isFinite)).to.equal(true)
          expect(points.slice(0, 2)).to.deep.equal([from.x, from.y])
          expect(points.slice(6)).to.deep.equal([to.x, to.y])
          expect(to.y).to.be.above(from.y)
          expect(points[2]).to.be.within(0, scene.width)
          expect(points[4]).to.be.within(0, scene.width)
          expect(points[3]).to.be.within(from.y, to.y)
          expect(points[5]).to.be.within(points[3], to.y)
        })
      })
    }
  }
  it('varies long-map curves deterministically across visits, progress and resizing', function () {
    const options = { ...inputs, topology: realTopology }
    const result = buildMapModel(options)
    const original = layoutMap(result, 320)
    const shapes = original.connectors.map(connector => shape(connector, 320))
    expect(new Set(shapes).size).to.be.above(5)
    expect(layoutMap(result, 320)).to.deep.equal(original)
    expect(layoutMap(buildMapModel({ ...options, progress: realProgress }), 320).connectors).to.deep.equal(original.connectors)
    for (const width of [240, 768, 1320]) {
      expect(layoutMap(result, width).connectors.map(connector => shape(connector, width))).to.deep.equal(shapes)
    }
    const final = coordinates(original.connectors.at(-1))
    expect(final[0]).to.equal(final[6])
    expect(final[2]).not.to.equal(final[0])
    expect(final[4]).not.to.equal(final[6])
  })
  it('preserves the supplied 39 stages/five milestones and anchors zero-progress stage two', function () {
    const result = buildMapModel({
      topology: realTopology,
      progress: realProgress,
      dimensions: realTopology.dimensions.map(d => ({ ...d, title: d._id, icon: 'book', color: 'primary' })),
      levels: realTopology.levels.map(_id => ({ _id, title: _id })),
      icons: ['book']
    })
    expect(result.stages).to.have.length(39)
    expect(result.entries.filter(e => e.type === 'milestone')).to.have.length(5)
    expect(result.slotIds).to.have.length(4)
    expect(result.anchorId).to.equal(result.stages[1].id)
    expect(result.stages[0].complete).to.equal(true)
    expect(result.entries.at(-1).type).to.equal('finish')
  })
  it('does not carry old results into a replacement attempt', function () {
    const completed = model([complete('a'), complete('b')])
    const replacement = model([{ _id: 'a', progress: 0, competencies: 0, complete: false }])
    expect(completed.stages[0].complete).to.equal(true)
    expect(replacement.stages[0].complete).to.equal(false)
    expect(replacement.stages[0].progress.percent).to.equal(0)
    expect(replacement.stages[0].choices[0].competencies.current).to.equal(0)
  })
  it('keeps stable Blaze keys and identical sparse diamond positions on resize', function () {
    const result = model()
    const mobile = layoutMap(result, 320)
    const desktop = layoutMap(result, 1280)
    expect(mobile.entries.map(e => e._id)).to.deep.equal(desktop.entries.map(e => e.id))
    const stages = mobile.entries.filter(e => e.isStage)
    expect(stages[0].choices[1].dx).to.equal(stages[1].choices[0].dx)
    expect(stages[0].choices[1].dy).to.equal(stages[1].choices[0].dy)
    expect(desktop.entries[1].x - desktop.entries[2].x).to.be.above(mobile.entries[1].x - mobile.entries[2].x)
  })
  it('converts and bounds percentages without inventing unavailable values', function () {
    expect(percentage(1, 4)).to.equal(25)
    expect(percentage(8, 4)).to.equal(100)
    expect(percentage(-1, 4)).to.equal(0)
    for (const value of [0, NaN, Infinity]) expect(percentage(1, value)).to.equal(null)
    expect(percentage(NaN, 4)).to.equal(null)
  })
  it('applies mobile diamond correction at exact boundaries', function () {
    expect([0, 0.01, 0.3, 0.75, 0.76, 0.89, 0.9, 1].map(diamondFraction))
      .to.deep.equal([0, 0.3, 0.3, 0.75, 0.75, 0.75, 1, 1])
  })
  it('keeps fixed offered slots, stage numbering, milestones and separate markers', function () {
    const result = model()
    expect(result.slotIds).to.deep.equal(['reading', 'math'])
    expect(result.stages[1].choices[0].slot).to.equal(1)
    expect(result.stages.map(s => s.number)).to.deep.equal([1, 2, 3])
    expect(result.entries.map(e => e.type)).to.deep.equal(['start', 'stage', 'stage', 'stage', 'milestone', 'finish'])
  })
  it('pins zero-progress incomplete work and gives a current Session precedence', function () {
    const progress = [complete('a'), complete('b'), { _id: 'c', complete: false, progress: 0 }]
    expect(model(progress).anchorId).to.equal(model().stages[1].id)
    expect(model(progress, { currentSession: { unitSet: 'd', startedAt: new Date(), fieldId: 'field' } }).anchorId).to.equal(model().stages[2].id)
  })
  it('uses next stage, then backward search; all-complete and no work use stage one', function () {
    expect(model([complete('a'), complete('b')]).anchorId).to.equal(model().stages[1].id)
    expect(model([complete('c'), complete('d')]).anchorId).to.equal(model().stages[0].id)
    expect(model(['a', 'b', 'c', 'd'].map(complete)).anchorId).to.equal(model().stages[0].id)
    expect(model().anchorId).to.equal(model().stages[0].id)
  })
  it('uses real activity dates when present, array order otherwise', function () {
    const result = model([{ _id: 'c', complete: false, updatedAt: new Date(20) }, { _id: 'd', complete: false, updatedAt: new Date(10) }])
    expect(result.anchorId).to.equal(result.stages[1].id)
  })
  it('separates page counts, competencies and authoritative completion', function () {
    const result = model([{ _id: 'a', progress: 4, competencies: 1, complete: false }])
    expect(result.stages[0].complete).to.equal(false)
    expect(result.stages[0].progress.percent).to.equal(50)
    expect(result.stages[0].choices[0].competencies.percent).to.equal(10)
    expect(result.stages[0].choices[0].diamondFill).to.equal(0.3)
    expect(model([{ _id: 'a', progress: 0, competencies: 0 }]).stages[0].progress.percent).to.equal(0)
  })
  it('distinguishes failed Progress from missing Progress', function () {
    expect(model([], { progressAvailable: false }).stages[0].progress.percent).to.equal(null)
    expect(model().stages[0].progress.percent).to.equal(0)
  })
  it('does not mutate frozen inputs and keeps IDs independent of progress and layout', function () {
    const frozen = JSON.parse(JSON.stringify(inputs))
    const freeze = value => { Object.values(value).filter(v => v && typeof v === 'object').forEach(freeze); Object.freeze(value) }
    freeze(frozen)
    const a = buildMapModel(frozen)
    expect(a.stages.map(s => s.id)).to.deep.equal(model([complete('a')]).stages.map(s => s.id))
    expect(Object.isFrozen(a.stages[0])).to.equal(true)
  })
  it('reports malformed topology and configuration without losing valid choices', function () {
    expect(buildMapModel({ topology: { entries: [] } }).anchorId).to.equal(null)
    expect(() => buildMapModel({ topology: {} })).to.throw()
    const result = model([], { icons: [] })
    expect(result.sceneAvailable).to.equal(false)
    expect(result.stages).to.have.length(3)
  })
  it('ignores completed, cancelled and wrong-field Sessions when anchoring', function () {
    for (const extra of [{ completedAt: new Date() }, { cancelledAt: new Date() }, { fieldId: 'other' }]) {
      const result = model([{ _id: 'c', complete: false }], {
        currentSession: { unitSet: 'd', startedAt: new Date(), fieldId: 'field', ...extra }
      })
      expect(result.anchorId).to.equal(result.stages[1].id)
    }
  })
  it('uses array order for mixed or invalid activity dates', function () {
    for (const updatedAt of [undefined, 'invalid']) {
      const result = model([{ _id: 'c', complete: false, updatedAt: new Date(100) }, { _id: 'd', complete: false, updatedAt }])
      expect(result.anchorId).to.equal(result.stages[2].id)
    }
  })
  it('rejects duplicate topology and retains choices when metadata is missing', function () {
    expect(() => model([], { topology: { ...topology, entries: [topology.entries[0], topology.entries[0]] } })).to.throw('map.invalidTopology')
    const result = model([], { dimensions: [], levels: [] })
    expect(result.sceneAvailable).to.equal(false)
    expect(result.stages[0].choices.map(c => c._id)).to.deep.equal(['a', 'b'])
    expect(result.issues).to.include('map.metadataUnavailable')
  })
  for (const width of [240, 320, 768, 1320]) {
    it(`connects the entire top-to-bottom journey at width ${width}`, function () {
      const scene = layoutMap(model(), width)
      expect(scene.entries[1].x).to.be.above(width / 2)
      expect(scene.entries[2].x).to.be.below(width / 2)
      expect(scene.entries[1].y).to.be.below(scene.entries[2].y)
      expect(scene.connectors).to.have.length(scene.entries.length - 1)
      scene.connectors.forEach((c, i) => {
        expect(c.from).to.deep.equal({ x: scene.entries[i].x, y: scene.entries[i].y })
        expect(c.to).to.deep.equal({ x: scene.entries[i + 1].x, y: scene.entries[i + 1].y })
      })
    })
  }
})

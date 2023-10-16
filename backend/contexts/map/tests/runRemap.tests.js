/* eslint-env mocha */
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { runRemap } from '../remap'
import { restoreAll, stub } from '../../../tests/helpers/stubUtils'
import { Field } from '../../content/Field'
import { restoreCollections, stubCollection } from '../../../tests/helpers/stubCollection'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'
import { MapData } from '../MapData'
import { SyncState } from '../../sync/SyncState'
import { Achievements } from '../../achievements/Achievements'

const FieldCollection = initTestCollection(Field)

describe(runRemap.name, function () {
  before(() => {
    stubCollection([FieldCollection])
  })

  after(() => {
    restoreCollections()
  })

  afterEach(() => {
    FieldCollection.remove({})
    restoreAll()
  })

  it('skips if active is not explicitly true', () => {
    ;[undefined, {}, { active: undefined}, { active: null }, { active: false}, { active: 1}]
      .forEach(options => {
        expect(runRemap(options)).to.equal(false)
      })
  })
  it('skips if no fields are found', () => {
    const options = { active: true }
    expect(runRemap(options)).to.equal(false)
  })
  it('creates a map data for each field', () => {
    const dimensionDocs = [
      { _id: Random.id(), maxProgress: 0, maxCompetencies: 0 },
      { _id: Random.id(), maxProgress: 0, maxCompetencies: 0 },
    ]
    const mapDocs = [{}, {}, {}].map(doc => {
      const fieldId = FieldCollection.insert(doc)
       return {
        _id: Random.id(),
        field: fieldId,
        dimensions: dimensionDocs,
        levels: [],
        maxProgress: 0,
        maxCompetencies: 0,
        entries: []
      }
    })
    const dimensions = { order: [] }
    const options = { active: true, dimensions }

    stub(MapData, 'create', () => true)
    stub(MapData, 'get', ({ field }) => mapDocs.find(d => d.field === field))
    stub(Achievements, 'update', expect.fail)
    stub(SyncState, 'update', expect.fail)
    expect(runRemap(options)).to.equal(true)
  })
  it('creates/updates achievements for each dimension of a given map after it is created', () => {
    const dimensionDocs = [
      { _id: Random.id(), maxProgress: 10, maxCompetencies: 10 },
    ]
    const fieldId = FieldCollection.insert({})
    const mapDoc = {
      _id: Random.id(),
      field: fieldId,
      dimensions: dimensionDocs,
      levels: [],
      maxProgress: 20,
      maxCompetencies: 10,
      entries: []
    }
    const dimensions = { order: [] }
    const options = { active: true, dimensions }
    let updateCalled = false

    stub(MapData, 'create', () => true)
    stub(MapData, 'get', () => mapDoc)
    stub(Achievements, 'update', () => updateCalled = true)
    stub(SyncState, 'update', expect.fail)
    expect(runRemap(options)).to.equal(true)
    expect(updateCalled).to.equal(true)
  })
  it('syncs if dryRun is explicitly false', () => {
    const dimensionDocs = [
      { _id: Random.id(), maxProgress: 10, maxCompetencies: 10 },
    ]
    const fieldId = FieldCollection.insert({})
    const mapDoc = {
      _id: Random.id(),
      field: fieldId,
      dimensions: dimensionDocs,
      levels: [],
      maxProgress: 20,
      maxCompetencies: 10,
      entries: []
    }
    const dimensions = { order: [] }
    const options = { active: true, dimensions, dryRun: false }
    let updateCalled = false

    stub(MapData, 'create', () => true)
    stub(MapData, 'get', () => mapDoc)
    stub(Achievements, 'update', () => true)
    stub(SyncState, 'update', (name) => {
      expect(name).to.equal(MapData.name)
      updateCalled = true
    })
    expect(runRemap(options)).to.equal(true)
    expect(updateCalled).to.equal(true)
  })
})

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
import { forEachAsync } from '../../../infrastructure/async/forEachAsync'
import { mapAsync } from '../../../infrastructure/async/mapAsync'

const FieldCollection = initTestCollection(Field)

describe(runRemap.name, function () {
  before(() => {
    stubCollection([FieldCollection])
  })

  after(() => {
    restoreCollections()
  })

  afterEach(async () => {
    await FieldCollection.removeAsync({})
    restoreAll()
  })

  it('skips if active is not explicitly true', async () => {
    const allOptions = [undefined, {}, { active: undefined }, { active: null }, { active: false }, { active: 1 }]
    await forEachAsync(allOptions, async options => {
        expect(await runRemap(options)).to.equal(false)
      })
  })
  it('skips if no fields are found', async () => {
    const options = { active: true }
    expect(await runRemap(options)).to.equal(false)
  })
  it('creates a map data for each field', async () => {
    const dimensionDocs = [
      { _id: Random.id(), maxProgress: 0, maxCompetencies: 0 },
      { _id: Random.id(), maxProgress: 0, maxCompetencies: 0 }
    ]
    const mapDocs = await mapAsync([{}, {}, {}], async doc => {
      const fieldId = await FieldCollection.insertAsync(doc)
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

    stub(MapData, 'create', async () => true)
    stub(MapData, 'get', async ({ field }) => mapDocs.find(d => d.field === field))
    stub(Achievements, 'update', expect.fail)
    stub(SyncState, 'update', expect.fail)
    expect(await runRemap(options)).to.equal(true)
  })
  it('creates/updates achievements for each dimension of a given map after it is created', async () => {
    const dimensionDocs = [
      { _id: Random.id(), maxProgress: 10, maxCompetencies: 10 }
    ]
    const fieldId = await FieldCollection.insertAsync({})
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

    const updateCalled = stub(Achievements, 'update', async () => {})
    stub(MapData, 'create', async () => true)
    stub(MapData, 'get', async () => mapDoc)
    stub(SyncState, 'update', expect.fail)
    expect(await runRemap(options)).to.equal(true)
    expect(updateCalled.called).to.equal(true)
  })
  it('syncs if dryRun is explicitly false', async () => {
    const dimensionDocs = [
      { _id: Random.id(), maxProgress: 10, maxCompetencies: 10 }
    ]
    const fieldId = await FieldCollection.insertAsync({})
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

    stub(MapData, 'create', async () => true)
    stub(MapData, 'get', async () => mapDoc)
    stub(Achievements, 'update', async () => true)
    const updateCalled = stub(SyncState, 'update', async  (name) => {
      expect(name).to.equal(MapData.name)
    })
    expect(await runRemap(options)).to.equal(true)
    expect(updateCalled.calledOnce).to.equal(true)
  })
})

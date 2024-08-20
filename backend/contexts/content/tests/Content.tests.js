/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { Content } from '../Content'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'
import { Field } from '../Field'
import { Dimension } from '../Dimension'
import { Level } from '../Level'
import { MapData } from '../../map/MapData'
import { Session } from '../../session/Session'
import {
  restoreCollections,
  stubCollection
} from '../../../tests/helpers/stubCollection'
import { Unit } from '../Unit'

const FieldCollection = initTestCollection(Field)
const DimensionCollection = initTestCollection(Dimension)
const LevelCollection = initTestCollection(Level)
const MapCollection = initTestCollection(MapData)
const SessionCollection = initTestCollection(Session)
const UnitCollection = initTestCollection(Unit)
const allCollections = [
  FieldCollection,
  DimensionCollection,
  LevelCollection,
  MapCollection,
  SessionCollection,
  UnitCollection
]
describe('Content', function () {
  before(function () {
    stubCollection(allCollections)
  })
  after(function () {
    restoreCollections()
  })

  beforeEach(async () => {
    for (const c of allCollections) {
      await c.removeAsync({})
    }
  })

  describe(Content.methods.home.name, function () {
    const home = Content.methods.home.run

    it('returns nothing if no flag is true', async function () {
      const data = await home({})
      expect(data).to.deep.equal({
        field: [],
        dimension: [],
        level: []
      })
    })
    it('returns docs if true',async function () {
      await FieldCollection.insertAsync ({ title: 'foo' })
      await DimensionCollection.insertAsync ({ title: 'foo' })
      await LevelCollection.insertAsync ({ title: 'foo' })

      const data = await home.call({}, { field: true, dimension: true, level: true })
      expect(data).to.deep.equal({
        field: [await FieldCollection.findOneAsync()],
        dimension: [await DimensionCollection.findOneAsync()],
        level: [await LevelCollection.findOneAsync()]
      })
    })
  })
  describe(Content.methods.map.name, function () {
    const map = Content.methods.map.run

    it('returns the current map data for a given field', async function () {
      const fieldId = await FieldCollection.insertAsync ({ title: 'foo' })
      const mapId = await MapCollection.insertAsync({ field: fieldId, foo: 'bar' })
      const mapData = await map.call({}, { fieldId })
      expect(mapData).to.deep.equal({
        _id: mapId,
        field: fieldId,
        foo: 'bar'
      })
    })
  })
  describe(Content.methods.session.name, function () {
    const run = Content.methods.session.run

    it('returns the current session screen data', async function () {
      const unitSetId = Random.id()
      const userId = Random.id()
      const sessionId = await SessionCollection.insertAsync({ userId, unitSet: unitSetId })
      const { sessionDoc, unitDoc, unitSetDoc } = await run.call({ userId }, { unitSetId })
      expect(sessionDoc).to.deep.equal({
        _id: sessionId,
        userId,
        unitSet: unitSetId
      })
      expect(unitDoc).to.equal(undefined)
      expect(unitSetDoc).to.equal(undefined)
    })
  })
  describe(Content.methods.unit.name, function () {
    const run = Content.methods.unit.run

    it('returns a specific unit doc', async function () {
      const unitId = await UnitCollection.insertAsync({ title: Random.id() })
      const doc = await UnitCollection.findOneAsync(unitId)
      expect(doc).to.not.equal(undefined)
      expect(await run.call({}, { unitId })).to.deep.equal(doc)
    })
  })
})

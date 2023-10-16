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

  beforeEach(function () {
    allCollections.forEach(c => c.remove({}))
  })

  describe(Content.methods.home.name, function () {
    const home = Content.methods.home.run

    it('returns nothing if no flag is true', function () {
      const data = home({})
      expect(data).to.deep.equal({
        field: [],
        dimension: [],
        level: []
      })
    })
    it('returns docs if true', function () {
      FieldCollection.insert({ title: 'foo' })
      DimensionCollection.insert({ title: 'foo' })
      LevelCollection.insert({ title: 'foo' })

      const data = home({ field: true, dimension: true, level: true })
      expect(data).to.deep.equal({
        field: [FieldCollection.findOne()],
        dimension: [DimensionCollection.findOne()],
        level: [LevelCollection.findOne()]
      })
    })
  })
  describe(Content.methods.map.name, function () {
    const map = Content.methods.map.run

    it('returns the current map data for a given field', function () {
      const fieldId = FieldCollection.insert({ title: 'foo' })
      const mapId = MapCollection.insert({ field: fieldId, foo: 'bar' })
      const mapData = map({ fieldId })
      expect(mapData).to.deep.equal({
        _id: mapId,
        field: fieldId,
        foo: 'bar'
      })
    })
  })
  describe(Content.methods.session.name, function () {
    const run = Content.methods.session.run

    it('returns the current session screen data', function () {
      const unitSetId = Random.id()
      const userId = Random.id()
      const sessionId = SessionCollection.insert({ userId, unitSet: unitSetId })
      const { sessionDoc, unitDoc, unitSetDoc } = run.call({ userId }, { unitSetId })
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

    it('returns a specific unit doc', function () {
      const unitId = UnitCollection.insert({ title: Random.id() })
      const doc = UnitCollection.findOne(unitId)
      expect(doc).to.not.equal(undefined)
      expect(run({ unitId })).to.deep.equal(doc)
    })
  })
})

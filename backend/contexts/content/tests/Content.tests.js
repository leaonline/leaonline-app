/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { Content } from '../Content'
import { createMethod } from '../../../infrastructure/factories/createMethod'
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

const FieldCollection = initTestCollection(Field)
const DimensionCollection = initTestCollection(Dimension)
const LevelCollection = initTestCollection(Level)
const MapCollection = initTestCollection(MapData)
const SessionCollection = initTestCollection(Session)
const allCollections = [
  FieldCollection,
  DimensionCollection,
  LevelCollection,
  MapCollection,
  SessionCollection
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
    const home = createMethod(Content.methods.home)
    it('returns nothing if no flag is true', function () {
      const data = home.call({})
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

      const data = home.call({ field: true, dimension: true, level: true })
      expect(data).to.deep.equal({
        field: [FieldCollection.findOne()],
        dimension: [DimensionCollection.findOne()],
        level: [LevelCollection.findOne()]
      })
    })
  })
  describe(Content.methods.map.name, function () {
    const map = createMethod(Content.methods.map)

    it('returns the current map data for a given field', function () {
      const fieldId = FieldCollection.insert({ title: 'foo' })
      const mapId = MapCollection.insert({ field: fieldId, foo: 'bar' })
      const mapData = map.call({ fieldId })
      expect(mapData).to.deep.equal({
        _id: mapId,
        field: fieldId,
        foo: 'bar'
      })
    })
  })
  describe(Content.methods.unit.name, function () {
    const unit = createMethod(Content.methods.unit)

    it('returns the current unit screen data', function () {
      const unitSetId = Random.id()
      const userId = Random.id()
      const sessionId = SessionCollection.insert({ userId, unitSet: unitSetId })
      expect(unit._execute({ userId }, { unitSetId })).to.deep.equal({
        sessionDoc: {
          _id: sessionId,
          userId,
          unitSet: unitSetId
        },
        unitDoc: undefined,
        unitSetDoc: undefined
      })
    })
  })
})

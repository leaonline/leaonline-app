/* eslint-env mocha */
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { MapData } from '../MapData'
import { Field } from '../../content/Field'
import { Dimension } from '../../content/Dimension'
import { TestCycle } from '../../content/TestCycle'
import { UnitSet } from '../../content/UnitSet'
import { Level } from '../../content/Level'
import { Unit } from '../../content/Unit'
import {
  restoreCollections,
  stubCollection
} from '../../../tests/helpers/stubCollection'
import mapFixtures from './fixtures'
import { getCollection } from '../../../api/utils/getCollection'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'

const MapCollection = initTestCollection(MapData)
const FieldCollection = initTestCollection(Field)
const DimensionCollection = initTestCollection(Dimension)
const TestCycleCollection = initTestCollection(TestCycle)
const LevelCollection = initTestCollection(Level)
const UnitSetCollection = initTestCollection(UnitSet)
const UnitCollection = initTestCollection(Unit)
const allCollections = [
  MapCollection,
  FieldCollection,
  DimensionCollection,
  TestCycleCollection,
  LevelCollection,
  UnitSetCollection,
  UnitCollection
]
describe('MapData', function () {
  before(function () {
    stubCollection(allCollections)
  })
  after(function () {
    restoreCollections()
  })
  describe(MapData.create.name, function () {
    it('throws if there is no field doc', function () {
      const field = Random.id()
      expect(() => MapData.create({ field }))
        .to.throw(`Field doc not found by _id "${field}"`)
    })
    it('throws if there are no dimensions', function () {
      const field = Random.id()
      FieldCollection.insert({ _id: field })
      expect(() => MapData.create({ field }))
        .to.throw('No Dimensions found')
    })
    it('throws if there are no levels', function () {
      const field = Random.id()
      FieldCollection.insert({ _id: field })
      DimensionCollection.insert({})
      expect(() => MapData.create({ field }))
        .to.throw('No Levels found')
    })
    it('creates a new Map from the data', function () {
      allCollections.forEach(c => c.remove({}))
      Object.entries(mapFixtures).forEach(([name, docs]) => {
        const collection = getCollection(name)
        docs.forEach(doc => collection.insert(doc))
        console.debug('fixures', name, collection.find().count())
      })

      const fieldDoc = FieldCollection.findOne()
      MapData.create({ field: fieldDoc._id })

      const toId = doc => doc._id
      const { dimensions, entries, field, levels } = MapData.get({ field: fieldDoc._id })

      expect(field).to.equal(fieldDoc._id)
      expect(levels).to.deep.equal(LevelCollection.find().fetch().map(toId))
      expect(dimensions).to.deep.equal(DimensionCollection.find().fetch().map(toId))

      expect(entries.length).to.equal(UnitSetCollection.find().count() + 1)

      const milestone = entries.pop()
      expect(milestone.type).to.equal('milestone')
      expect(milestone.level).to.equal(0)

      const competenciesByDimension = [0, 0, 0, 0, 0]
      let maxProgress = 0

      entries.forEach(entry => {
        expect(entry.type).to.equal('stage')
        expect(entry.level).to.equal(0)

        // progress sums up correctly
        let entryProgress = 0
        entry.unitSets.forEach(unitSet => {
          entryProgress += unitSet.progress
          competenciesByDimension[unitSet.dimension] += unitSet.competencies
        })

        expect(entry.progress).to.equal(entryProgress)
        maxProgress += entryProgress
      })

      // ensure the milestone competency count it the correct sum
      // of the stage's unitSet competencies per dimension
      milestone.competencies.forEach(entry => {
        expect(entry.max).to.equal(competenciesByDimension[entry.dimension])
      })

      // check testcycles overall progress
      const testCycleDoc = TestCycleCollection.findOne({ field: fieldDoc._id })
      expect(testCycleDoc.progress).to.equal(maxProgress)
      expect(milestone.progress).to.equal(maxProgress)
    })
  })
})

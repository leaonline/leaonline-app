/* eslint-env mocha */
import {Random} from 'meteor/random'
import {expect} from 'chai'
import {MapData} from '../MapData'
import {Field} from '../../content/Field'
import {Dimension} from '../../content/Dimension'
import {TestCycle} from '../../content/TestCycle'
import {UnitSet} from '../../content/UnitSet'
import {Level} from '../../content/Level'
import {Unit} from '../../content/Unit'
import {
  restoreCollections,
  stubCollection
} from '../../../tests/helpers/stubCollection'
import mapFixtures from './fixtures'
import {getCollection} from '../../../api/utils/getCollection'
import {initTestCollection} from '../../../tests/helpers/initTestCollection'

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

const mockDocuments = () => {
  allCollections.forEach(c => c.remove({}))
  Object.entries(mapFixtures).forEach(([name, docs]) => {
    const collection = getCollection(name)
    docs.forEach(doc => collection.insert(doc))
    // console.debug('fixures', name, collection.find().count())
  })
}

describe('MapData', function () {
  before(function () {
    stubCollection(allCollections)
  })
  after(function () {
    restoreCollections()
  })
  describe(MapData.create.name, function () {

    // throws errors; this is the case when crucial
    // or fundmental data is not avialable.
    // such data is:
    // - field
    // - dimension(s)
    // - level(s)

    it('throws if there is no field doc', function () {
      const field = Random.id()
      expect(() => MapData.create({ field }))
        .to.throw(`Expect field doc by _id "${field}"`)
    })
    it('throws if there are no dimensions', function () {
      const field = Random.id()
      FieldCollection.insert({ _id: field })
      expect(() => MapData.create({ field }))
        .to.throw('Expect at least one dimension doc')
    })
    it('throws if there are no levels', function () {
      const field = Random.id()
      FieldCollection.insert({ _id: field })
      DimensionCollection.insert({})
      expect(() => MapData.create({ field }))
        .to.throw('Expect at least one level doc')
    })


    it('throws if there are no unit sets for the testcycle', function () {
      mockDocuments()
      const testCycleDoc = TestCycleCollection.findOne()
      expect(testCycleDoc.unitSets.length).to.be.above(0)
      TestCycleCollection.update(testCycleDoc._id, { $set: { unitSets: [] } })

      const fieldDoc = FieldCollection.findOne()
      expect(() => MapData.create({ field: fieldDoc._id }))
        .to.throw(`Expect at least one unit set for test cycle ${testCycleDoc._id}`)
    })

    it('throws if there is a mismatch between expected and actual unit', function () {
      mockDocuments()
      UnitSetCollection.remove({})
      const testCycleDoc = TestCycleCollection.findOne()
      const expected = testCycleDoc.unitSets.length
      const fieldDoc = FieldCollection.findOne()
      expect(() => MapData.create({ field: fieldDoc._id }))
        .to.throw(`Expect ${expected} unit sets for test cycle ${testCycleDoc._id}, got 0`)
    })

    it ('throws if there are no units for a unit set', function () {
      mockDocuments()
      const testCycleDoc = TestCycleCollection.findOne()
      const unitSetId = testCycleDoc.unitSets[0]
      UnitSetCollection.update(unitSetId, { $set: { units: [] }})

      const fieldDoc = FieldCollection.findOne()
      expect(() => MapData.create({ field: fieldDoc._id }))
        .to.throw(`Expect units for unit set ${unitSetId} to be above 0`)
    })

    it ('throws if there is a mismatch between expected and actual units', function () {
      mockDocuments()
      const testCycleDoc = TestCycleCollection.findOne()
      const unitSetId = testCycleDoc.unitSets[0]
      const unitSetDoc = UnitSetCollection.findOne(unitSetId)
      const expectedUnits = unitSetDoc.units.length
      UnitCollection.remove({})

      const fieldDoc = FieldCollection.findOne()
      expect(() => MapData.create({ field: fieldDoc._id }))
        .to.throw(`Expect ${expectedUnits} units for unit set ${unitSetDoc._id}, got 0`)
    })

    it('does not create a map if no test cycle at all is found for given field/level/dimension', function () {
      mockDocuments()
      TestCycleCollection.remove(TestCycleCollection.findOne()._id)

      const fieldDoc = FieldCollection.findOne()
      const data = MapData.create({ field: fieldDoc._id })
      const mapDoc = MapData.get({ field: fieldDoc._id })

      expect(data).to.equal(undefined)
      expect(mapDoc).to.equal(undefined)
    })

    it('creates a new Map from the data', function () {
      mockDocuments()

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

/* eslint-env mocha */
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { Meteor } from 'meteor/meteor'
import { MapData } from '../MapData'
import { Field } from '../../content/Field'
import { Dimension } from '../../content/Dimension'
import { TestCycle } from '../../content/TestCycle'
import { UnitSet } from '../../content/UnitSet'
import { Level } from '../../content/Level'
import { Unit } from '../../content/Unit'
import mapFixtures from './fixtures'
import { getCollection } from '../../../api/utils/getCollection'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'
import { testGetAllMethod } from '../../../tests/helpers/backendMethods'
import { setupAndTeardown } from '../../../tests/helpers/setupAndTeardown'
import { expectThrown } from '../../../tests/helpers/expectThrown'
import { forEachAsync } from '../../../infrastructure/async/forEachAsync'

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

const dimensionsOrder = Meteor.settings.remotes.content.remap.dimensions.order

const mockDocuments = () => {
  return forEachAsync(Object.entries(mapFixtures), async ([name, docs]) => {
    const collection = getCollection(name)
    await forEachAsync(docs, doc => collection.insertAsync(doc))
  })
}

describe('MapData', function () {
  setupAndTeardown(allCollections)

  describe(MapData.create.name, function () {
    // throws errors; this is the case when crucial
    // or fundamental data is not available.
    // such data is:
    // - field
    // - dimension(s)
    // - level(s)

    it('throws if there is no field doc', async () => {
      const field = Random.id()
      await expectThrown({
        fn: () => MapData.create({ field, dimensionsOrder }),
        message: `Expect field doc by _id "${field}"`
      })
    })
    it('throws if there are no dimensions', async () => {
      const field = Random.id()
      await FieldCollection.insertAsync({ _id: field })
      await expectThrown({
        fn: () => MapData.create({ field, dimensionsOrder }),
        message: 'Expect at least one dimension doc'
      })
    })
    it('throws if there are no levels', async () => {
      const field = Random.id()
      await FieldCollection.insertAsync({ _id: field })
      await DimensionCollection.insertAsync({})
      await expectThrown({
        fn: () => MapData.create({ field, dimensionsOrder }),
        message: 'Expect at least one level doc'
      })
    })

    it('throws if there are no unit sets for the testcycle', async () => {
      await mockDocuments()
      const testCycleDoc = await TestCycleCollection.findOneAsync()
      expect(testCycleDoc.unitSets.length).to.be.above(0)
      TestCycleCollection.update(testCycleDoc._id, { $set: { unitSets: [] } })

      const fieldDoc = await FieldCollection.findOneAsync()
      await expectThrown({
        fn: () => MapData.create({ field: fieldDoc._id, dimensionsOrder }),
        message: `Integrity failed: Expect at least one unit set for test cycle ${testCycleDoc.shortCode}`
      })
    })

    it('throws if there is a mismatch between expected and actual unit', async () => {
      await mockDocuments()
      await UnitSetCollection.removeAsync({})
      const testCycleDoc = await TestCycleCollection.findOneAsync()
      const expected = testCycleDoc.unitSets.length
      const fieldDoc = await FieldCollection.findOneAsync()
      await expectThrown({
        fn: () => MapData.create({ field: fieldDoc._id, dimensionsOrder }),
        message: `Expect ${expected} unit sets for test cycle ${testCycleDoc._id}, got 0`
      })
    })

    it('throws if there are no units for a unit set', async () => {
      await mockDocuments()
      const testCycleDoc = await TestCycleCollection.findOneAsync()
      const unitSetId = testCycleDoc.unitSets[0]
      await UnitSetCollection.updateAsync(unitSetId, { $set: { units: [] } })

      const fieldDoc = await FieldCollection.findOneAsync()
      const unitSetDoc = await UnitSetCollection.findOneAsync(unitSetId)
      await expectThrown({
        fn: () => MapData.create({ field: fieldDoc._id, dimensionsOrder }),
        message: `Expect units for unit set ${unitSetDoc.shortCode} to be above 0`
      })
    })

    it('throws if there is a mismatch between expected and actual units', async () => {
      await mockDocuments()
      const testCycleDoc = await TestCycleCollection.findOneAsync()
      const unitSetId = testCycleDoc.unitSets[0]
      const unitSetDoc = await UnitSetCollection.findOneAsync(unitSetId)
      const expectedUnits = unitSetDoc.units.length
      await UnitCollection.removeAsync({})

      const fieldDoc = await FieldCollection.findOneAsync()
      await expectThrown({
        fn: () => MapData.create({ field: fieldDoc._id, dimensionsOrder }),
        message: `Expect ${expectedUnits} units for unit set ${unitSetDoc.shortCode}, got 0`
      })
    })

    it('does not create a map if no test cycle at all is found for given field/level/dimension', async () => {
      await mockDocuments()
      const removed = await TestCycleCollection.removeAsync({
        _id: (await TestCycleCollection.findOneAsync())._id
      })
      expect(removed).to.equal(1)

      const fieldDoc = await FieldCollection.findOneAsync()
      const data = await MapData.create({ field: fieldDoc._id, dimensionsOrder })
      const mapDoc = await MapData.get({ field: fieldDoc._id, dimensionsOrder })

      expect(data).to.equal(undefined)
      expect(mapDoc).to.equal(undefined)
    })

    it('creates a new Map from the data', async () => {
      await mockDocuments()

      const fieldDoc = await FieldCollection.findOneAsync()
      await MapData.create({ field: fieldDoc._id, dimensionsOrder })

      const toId = doc => doc._id
      const { dimensions, entries, field, levels, maxProgress } = await MapData.get({ field: fieldDoc._id, dimensionsOrder })

      expect(field).to.equal(fieldDoc._id)


      expect(levels).to.deep.equal((await LevelCollection.find().fetchAsync()).map(toId))
      expect(dimensions.map(entry => entry._id))
        .to.deep.equal((await DimensionCollection.find().fetchAsync()).map(toId))
      expect(entries.length).to.equal(await UnitSetCollection.countDocuments({}) + 1)

      const milestone = entries.pop()
      expect(milestone.type).to.equal('milestone')
      expect(milestone.level).to.equal(0)

      const competenciesByDimension = [0, 0, 0, 0, 0]
      let countedMaxProgress = 0

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
        countedMaxProgress += entryProgress

        // unit sets are sorted by correct dimensions
      })

      expect(countedMaxProgress).to.equal(maxProgress)

      // ensure the milestone competency count it the correct sum
      // of the stage's unitSet competencies per dimension
      milestone.competencies.forEach(entry => {
        expect(entry.max).to.equal(competenciesByDimension[entry.dimension])
      })

      // check testcycles overall progress
      const testCycleDoc = await TestCycleCollection.findOneAsync({ field: fieldDoc._id })
      expect(testCycleDoc.progress).to.equal(countedMaxProgress)
      expect(milestone.progress).to.equal(countedMaxProgress)
    })
  })

  describe('methods', function () {
    testGetAllMethod(MapData, {
      factory: () => ({ field: Random.id(), levels: [Random.id()], dimensions: [{ _id: Random.id() }] })
    })
  })
})

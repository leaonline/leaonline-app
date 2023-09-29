/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { Achievements } from '../Achievements'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'
import { stubCollection, restoreCollections } from '../../../tests/helpers/stubCollection'
import { restoreAll, stub } from '../../../tests/helpers/stubUtils'
import { SyncState } from '../../sync/SyncState'
import { Field } from '../../content/Field'
import { Dimension } from '../../content/Dimension'

const AchievementsCollection = initTestCollection(Achievements)
const FieldsCollection = initTestCollection(Field)
const DimensionCollection = initTestCollection(Dimension)

describe(Achievements.name, function () {
  before(() => {
    stubCollection([
      AchievementsCollection,
      FieldsCollection,
      DimensionCollection
    ])
  })
  after(() => {
    restoreCollections()
  })
  afterEach(() => {
    restoreAll()
    FieldsCollection.remove({})
    DimensionCollection.remove({})
    AchievementsCollection.remove({})
  })
  describe(Achievements.create.name, function () {
    it('it creates a new empty achievements doc', () => {
      const dimensionId = Random.id()
      const fieldId = Random.id()
      const expected = { fieldId, dimensionId, maxProgress: 0, maxCompetencies: 0 }
      const { _id, ...doc } = Achievements.create({ dimensionId, fieldId })
      expect(_id).to.be.a('string')
      expect(doc).to.deep.equal(expected)
    })
  })

  describe(Achievements.update.name, function () {
    it('creates a new doc and updates it, if it does not exist yet', () => {
      const dimensionId = Random.id()
      const fieldId = Random.id()
      const maxCompetencies = 100
      const maxProgress = 100

      stub(SyncState, 'update', (name) => {
        expect(name).to.equal(Achievements.name)
      })

      const updated = Achievements.update({ dimensionId, fieldId, maxCompetencies, maxProgress })
      expect(updated).to.equal(1)
      const { _id, ...doc } = AchievementsCollection.findOne()
      expect(_id).to.be.a('string')
      expect(doc).to.deep.equal({ dimensionId, fieldId, maxCompetencies, maxProgress })
    })
  })

  describe('methods', function () {
    describe(Achievements.methods.getAll.name, function () {
      const getAll = Achievements.methods.getAll.run
      it('returns all achievements without dependencies', () => {
        const dimensionId = DimensionCollection.insert({ title: 'foo' })
        const fieldId = FieldsCollection.insert({ title: 'foo' })
        const achievementsDoc = Achievements.create({ dimensionId, fieldId })
        const docs = getAll()
        expect(docs).to.deep.equal({
          [Achievements.name]: [achievementsDoc]
        })
      })
      it('returns all achivements including dependencies', () => {
        const dimensionId = DimensionCollection.insert({ title: 'foo' })
        const dimensionDoc = DimensionCollection.findOne(dimensionId)
        const fieldId = FieldsCollection.insert({ title: 'foo' })

        // should not be in there
        FieldsCollection.insert({ title: 'bar' })

        const fieldDoc = FieldsCollection.findOne(fieldId)
        const achievementsDoc = Achievements.create({ dimensionId, fieldId })
        const dependencies = { [Field.name]: 1, [Dimension.name]: 1 }
        const docs = getAll({ dependencies })
        expect(docs).to.deep.equal({
          [Achievements.name]: [achievementsDoc],
          [Field.name]: [fieldDoc],
          [Dimension.name]: [dimensionDoc]
        })
      })
    })
  })
})

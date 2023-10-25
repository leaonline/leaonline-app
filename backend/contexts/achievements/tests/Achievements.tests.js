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
import { testGetAllMethod } from '../../../tests/helpers/backendMethods'
import { createIdSet } from '../../../api/utils/createIdSet'

const AchievementsCollection = initTestCollection(Achievements)
const FieldsCollection = initTestCollection(Field)
const DimensionCollection = initTestCollection(Dimension)

const createDoc = (options = {}) => {
  return {
    fieldId: options.fieldId ?? Random.id(),
    dimensionId: options.dimensionId ?? Random.id(),
    maxProgress: options.maxProgress ?? 0,
    maxCompetencies: options.maxCompetencies ?? 0
  }
}

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
    testGetAllMethod(Achievements, {
      factory: withDeps => {
        const fieldId = withDeps
          ? FieldsCollection.findOne()._id
          : Random.id()
        const dimensionId = withDeps
          ? DimensionCollection.findOne()._id
          : Random.id()
        return createDoc({ fieldId, dimensionId })
      },
      dependencies: {
        [Field.name]: {
          factory: () => ({ title: Random.id(), shortCode: 'hi' }),
          selector: ({ docs }) => {
            const ids = [...createIdSet(docs, 'fieldId')]
            return { _id: { $in: ids } }
          }
        },
        [Dimension.name]: {
          factory: () => ({ title: Random.id() }),
          selector: ({ docs }) => {
            const ids = [...createIdSet(docs, 'dimensionId')]
            return { _id: { $in: ids } }
          }
        }
      }
    })
  })
})

/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { Progress } from '../Progress'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'
import {
  restoreCollections,
  stubCollection
} from '../../../tests/helpers/stubCollection'
import { testGetAllMethod, testGetMethod } from '../../../tests/helpers/backendMethods'
import { Field } from '../../content/Field'
import { createTestDocs } from '../../../tests/helpers/createTestDocs'
import { DocumentFactories, SelectorFactories } from '../../../tests/helpers/Factories'

const ProgressCollection = initTestCollection(Progress)
const FieldCollection = initTestCollection(Field)

const createDoc = (options = {}) => {
  return {
    userId: options.userId ?? Random.id(),
    fieldId: options.fieldId ?? Random.id(),
    unitSets: [
      {
        _id: options.unitSetId ?? Random.id(),
        dimensionId: options.dimensionId ?? Random.id(),
        progress: options.progress ?? 123,
        competencies: options.competencies ?? 456,
        complete: options.complete ?? false
      }
    ]
  }
}

describe('Progress', function () {
  before(function () {
    stubCollection([
      ProgressCollection,
      FieldCollection
    ])
  })
  after(function () {
    restoreCollections()
  })
  beforeEach(async () => {
    await ProgressCollection.removeAsync({})
    await FieldCollection.removeAsync({})
  })

  describe(Progress.create.name, function () {
    it('creates a new progress doc', async () => {
      const insertDoc = createDoc()
      const progressId = await Progress.create(insertDoc)
      expect(await ProgressCollection.findOneAsync(progressId)).to.deep.equal({
        _id: progressId,
        userId: insertDoc.userId,
        fieldId: insertDoc.fieldId,
        unitSets: [
          {
            _id: insertDoc.unitSetId,
            dimensionId: insertDoc.dimensionId,
            progress: insertDoc.progress,
            competencies: insertDoc.competencies,
            complete: insertDoc.complete
          }
        ]
      })
    })
  })
  describe(Progress.update.name, function () {
    it('creates a new Progress doc if non exists', async () => {
      const updateDoc = createDoc()
      const progressId = await Progress.update(updateDoc)
      expect(await ProgressCollection.findOneAsync(progressId)).to.deep.equal({
        _id: progressId,
        userId: updateDoc.userId,
        fieldId: updateDoc.fieldId,
        unitSets: [
          {
            _id: updateDoc.unitSetId,
            dimensionId: updateDoc.dimensionId,
            progress: updateDoc.progress,
            competencies: updateDoc.competencies,
            complete: updateDoc.complete
          }
        ]
      })
    })
    it('updates an existing Progress doc', async () => {
      const insertDoc = createDoc()
      const progressId = await Progress.create(insertDoc)

      // update existing unit set
      await Progress.update({
        userId: insertDoc.userId,
        fieldId: insertDoc.fieldId,
        unitSetId: insertDoc.unitSetId,
        dimensionId: insertDoc.dimensionId,
        progress: 256,
        competencies: 512,
        complete: true
      })

      expect(await ProgressCollection.findOneAsync(progressId)).to.deep.equal({
        _id: progressId,
        userId: insertDoc.userId,
        fieldId: insertDoc.fieldId,
        unitSets: [
          {
            _id: insertDoc.unitSetId,
            dimensionId: insertDoc.dimensionId,
            progress: 256,
            competencies: 512,
            complete: true
          }
        ]
      })

      // add new unit set
      const newUnitSetId = Random.id()
      await Progress.update({
        userId: insertDoc.userId,
        fieldId: insertDoc.fieldId,
        unitSetId: newUnitSetId,
        dimensionId: insertDoc.dimensionId,
        progress: 16,
        competencies: 32,
        complete: false
      })

      expect(await ProgressCollection.findOneAsync(progressId)).to.deep.equal({
        _id: progressId,
        userId: insertDoc.userId,
        fieldId: insertDoc.fieldId,
        unitSets: [
          {
            _id: insertDoc.unitSetId,
            dimensionId: insertDoc.dimensionId,
            progress: 256,
            competencies: 512,
            complete: true
          },
          {
            _id: newUnitSetId,
            dimensionId: insertDoc.dimensionId,
            progress: 16,
            competencies: 32,
            complete: false
          }
        ]
      })
    })
  })
  testGetMethod(Progress)
  testGetAllMethod(Progress, {
    factory: async (withDeps) => {
      const fieldDoc = withDeps && await FieldCollection.findOneAsync()
      const fieldId = withDeps ? fieldDoc._id : Random.id()
      return createDoc({ fieldId })
    },
    dependencies: {
      [Field.name]: {
        selector: SelectorFactories.idSelector('fieldId'),
        factory: DocumentFactories.get(Field.name)
      }
    }
  })
  describe(Progress.methods.my.name, function () {
    const run = Progress.methods.my.run

    it('returns only the user\'s docs', async () => {
      const userId = Random.id()
      const docs = await createTestDocs({
        factory: () => createDoc({ userId }),
        collection: ProgressCollection
      })

      const others = await createTestDocs({
        factory: () => createDoc({ userId: Random.id() }),
        collection: ProgressCollection
      })
      const all = docs.length + others.length
      expect(await ProgressCollection.countDocuments({})).to.equal(all)
      const my = await run.call({ userId })
      expect(my.length).to.equal(docs.length)
      expect(my.length).to.be.lessThan(all)
      expect(my).to.deep.equal(docs)
    })
  })
})

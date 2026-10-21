/* eslint-env mocha */
import { expect } from 'chai'
import sinon from 'sinon'
import { Random } from 'meteor/random'
import { Progress } from '../Progress'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'
import {
  restoreCollections,
  stubCollection,
} from '../../../tests/helpers/stubCollection'
import {
  testGetAllMethod,
  testGetMethod,
} from '../../../tests/helpers/backendMethods'
import { Field } from '../../content/Field'
import { createTestDocs } from '../../../tests/helpers/createTestDocs'
import {
  DocumentFactories,
  SelectorFactories,
} from '../../../tests/helpers/Factories'

const ProgressCollection = initTestCollection(Progress)
const FieldCollection = initTestCollection(Field)

const createDoc = (options = {}) => {
  const progressDoc = {
    userId: options.userId ?? Random.id(),
    fieldId: options.fieldId ?? Random.id(),
    unitSetId: options.unitSetId ?? Random.id(),
    dimensionId: options.dimensionId ?? Random.id(),
    progress: options.progress ?? 123,
    competencies: options.competencies ?? 456,
    complete: options.complete ?? false,
  }
  Object.freeze(progressDoc)
  return progressDoc
}

describe('Progress', () => {
  let clock
  before(() => {
    stubCollection([ProgressCollection, FieldCollection])
  })
  after(() => {
    restoreCollections()
  })
  beforeEach(async () => {
    clock = sinon.useFakeTimers()
    await ProgressCollection.removeAsync({})
    await FieldCollection.removeAsync({})
  })

  afterEach(() => {
    clock.restore()
  })

  describe(Progress.create.name, () => {
    it('creates a new progress doc', async () => {
      const now = new Date()
      clock.setSystemTime(now)
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
            complete: insertDoc.complete,
            createdAt: now,
          },
        ],
      })
    })
  })
  describe(Progress.update.name, () => {
    it('creates a new Progress doc if none exists', async () => {
      const now = new Date()
      clock.setSystemTime(now)
      const updateDoc = createDoc()
      const progressId = await Progress.update(updateDoc)
      expect(await ProgressCollection.findOneAsync(progressId)).to.deep.equal({
        _id: progressId,
        userId: updateDoc.userId,
        fieldId: updateDoc.fieldId,
        unitSets: [
          {
            _id: updateDoc.unitSetId,
            competencies: updateDoc.competencies,
            complete: false,
            dimensionId: updateDoc.dimensionId,
            progress: updateDoc.progress,
            createdAt: now,
          },
        ],
      })
    })
    it('updates an existing Progress doc', async () => {
      const now = new Date()
      clock.setSystemTime(now)
      const insertDoc = createDoc({
        progress: 256,
        competencies: 512,
      })
      const progressId = await Progress.create(insertDoc)

      // update existing unit set
      await Progress.update({
        userId: insertDoc.userId,
        fieldId: insertDoc.fieldId,
        unitSetId: insertDoc.unitSetId,
        dimensionId: insertDoc.dimensionId,
        progress: 256,
        competencies: 512,
        complete: true,
      })

      expect(await ProgressCollection.findOneAsync(progressId)).to.deep.equal({
        _id: progressId,
        userId: insertDoc.userId,
        fieldId: insertDoc.fieldId,
        unitSets: [
          {
            _id: insertDoc.unitSetId,
            dimensionId: insertDoc.dimensionId,
            progress: 512,
            competencies: 1024,
            complete: true,
            createdAt: now,
            completedAt: now,
            updatedAt: now,
          },
        ],
      })

      // add new unit set
      const newUnitSetId = Random.id()
      await Progress.update({
        userId: insertDoc.userId,
        fieldId: insertDoc.fieldId,
        unitSetId: newUnitSetId,
        dimensionId: insertDoc.dimensionId,
        progress: 128,
        competencies: 256,
        complete: false,
      })

      expect(await ProgressCollection.findOneAsync(progressId)).to.deep.equal({
        _id: progressId,
        userId: insertDoc.userId,
        fieldId: insertDoc.fieldId,
        unitSets: [
          {
            _id: insertDoc.unitSetId,
            dimensionId: insertDoc.dimensionId,
            progress: 512,
            competencies: 1024,
            complete: true,
            createdAt: now,
            completedAt: now,
            updatedAt: now,
          },
          {
            _id: newUnitSetId,
            dimensionId: insertDoc.dimensionId,
            progress: 128,
            competencies: 256,
            complete: false,
            createdAt: now,
          },
        ],
      })
    })
  })
  testGetMethod(Progress)
  testGetAllMethod(Progress, {
    factory: async (withDeps) => {
      const fieldDoc = withDeps && (await FieldCollection.findOneAsync())
      const fieldId = withDeps ? fieldDoc._id : Random.id()
      return createDoc({ fieldId })
    },
    dependencies: {
      [Field.name]: {
        selector: SelectorFactories.idSelector('fieldId'),
        factory: DocumentFactories.get(Field.name),
      },
    },
  })
  describe(Progress.methods.my.name, () => {
    const run = Progress.methods.my.run

    it("returns only the user's docs", async () => {
      const userId = Random.id()
      const docs = await createTestDocs({
        factory: () => createDoc({ userId }),
        collection: ProgressCollection,
      })

      const others = await createTestDocs({
        factory: () => createDoc({ userId: Random.id() }),
        collection: ProgressCollection,
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

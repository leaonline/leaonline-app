/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { Progress } from '../Progress'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'
import {
  restoreCollections,
  stubCollection
} from '../../../tests/helpers/stubCollection'
import { createMethod } from '../../../infrastructure/factories/createMethod'

const ProgressCollection = initTestCollection(Progress)

describe('Progress', function () {
  before(function () {
    stubCollection([ProgressCollection])
  })
  after(function () {
    restoreCollections()
  })
  beforeEach(function () {
    ProgressCollection.remove({})
  })

  describe(Progress.create.name, function () {
    it('creates a new progress doc', function () {
      const insertDoc = {
        userId: Random.id(),
        fieldId: Random.id(),
        unitSetId: Random.id(),
        dimensionId: Random.id(),
        progress: 123,
        competencies: 456,
        complete: false
      }
      const progressId = Progress.create(insertDoc)
      expect(ProgressCollection.findOne(progressId)).to.deep.equal({
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
    it('creates a new Progress doc if non exists', function () {
      const updateDoc = {
        userId: Random.id(),
        fieldId: Random.id(),
        unitSetId: Random.id(),
        dimensionId: Random.id(),
        progress: 123,
        competencies: 456,
        complete: false
      }
      const progressId = Progress.update(updateDoc)
      expect(ProgressCollection.findOne(progressId)).to.deep.equal({
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
    it('updates an existing Progress doc', function () {
      const insertDoc = {
        userId: Random.id(),
        fieldId: Random.id(),
        unitSetId: Random.id(),
        dimensionId: Random.id(),
        progress: 123,
        competencies: 456,
        complete: false
      }
      const progressId = Progress.create(insertDoc)

      // update existing unit set
      Progress.update({
        userId: insertDoc.userId,
        fieldId: insertDoc.fieldId,
        unitSetId: insertDoc.unitSetId,
        dimensionId: insertDoc.dimensionId,
        progress: 256,
        competencies: 512,
        complete: true
      })

      expect(ProgressCollection.findOne(progressId)).to.deep.equal({
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
      Progress.update({
        userId: insertDoc.userId,
        fieldId: insertDoc.fieldId,
        unitSetId: newUnitSetId,
        dimensionId: insertDoc.dimensionId,
        progress: 16,
        competencies: 32,
        complete: false
      })

      expect(ProgressCollection.findOne(progressId)).to.deep.equal({
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
  describe(Progress.methods.get.name, function () {
    const method = createMethod(Progress.methods.get)

    it('returns the progress doc by current user and given field', function () {
      const userId = Random.id()
      const fieldId = Random.id()
      const progressId = ProgressCollection.insert({ userId, fieldId })
      expect(method._execute({ userId }, { fieldId })).to.deep.equal({
        _id: progressId,
        userId,
        fieldId
      })
    })
  })
})

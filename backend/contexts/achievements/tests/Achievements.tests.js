/* eslint-env mocha */
import { Achievements } from '../Achievements'
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'
import { restoreCollections, stubCollection } from '../../../tests/helpers/stubCollection'
import { restoreAll, stub } from '../../../tests/helpers/stubUtils'
import { MapData } from '../../map/MapData'

const AchievementsCollection = initTestCollection(Achievements)
const allCollections = [AchievementsCollection]

describe(Achievements.name, function () {
  before(function () {
    stubCollection(allCollections)
  })
  after(function () {
    restoreCollections()
  })
  beforeEach(function () {
    allCollections.forEach(c => c.remove({}))
  })
  afterEach(function () {
    restoreAll()
  })
  describe(Achievements.create.name, function () {
    it('creates a new achievements doc', function () {
      const userId = Random.id()
      const dimensionId = Random.id()
      const fieldId = Random.id()
      const doc = Achievements.create({ userId, fieldId, dimensionId })
      const { _id, ...rest } = doc
      expect(rest).to.deep.equal({
        userId, dimensionId, fieldId, fields: []
      })
    })
  })
  describe(Achievements.getFieldData.name, function () {
    it('creates field data for a given field', function () {
      const fieldId = Random.id()

      stub(MapData, 'get', () => ({ maxProgress: 123, maxCompetencies: 456 }))
      const fieldData = Achievements.getFieldData({ fieldId })
      expect(fieldData).to.deep.equal({
        fieldId,
        maxProgress: 123,
        maxCompetencies: 456,
        progress: 0,
        competencies: 0
      })
    })
  })
  describe(Achievements.update.name, function () {
    it('creates and updates if not found before', function () {
      stub(MapData, 'get', () => ({ maxProgress: 123, maxCompetencies: 456 }))
      const userId = Random.id()
      const dimensionId = Random.id()
      const fieldId = Random.id()
      const progress = 11
      const competencies = 21

      Achievements.update({ userId, fieldId, dimensionId, progress, competencies })
      const doc = AchievementsCollection.findOne()
      const { _id, ...data } = doc
      const fields = [
        {
          fieldId,
          maxCompetencies: 456,
          maxProgress: 123,
          progress,
          competencies
        }
      ]

      expect(data).to.deep.equal({ userId, fieldId, dimensionId, fields })
    })
    it('updates and adds a field, if the field is new', function () {
      stub(MapData, 'get', () => ({ maxProgress: 123, maxCompetencies: 456 }))
      const userId = Random.id()
      const dimensionId = Random.id()
      const fieldId = Random.id()
      const progress = 11
      const competencies = 21
      const existingField = {
        fieldId: Random.id(),
        progress: 12,
        maxProgress: 99999,
        competencies: 10,
        maxCompetencies: 100000
      }
      AchievementsCollection.insert({ userId, dimensionId, fieldId, fields: [existingField] })
      Achievements.update({ userId, fieldId, dimensionId, progress, competencies })
      const doc = AchievementsCollection.findOne()
      const { _id, ...data } = doc
      const fields = [
        existingField,
        {
          fieldId,
          maxCompetencies: 456,
          maxProgress: 123,
          progress,
          competencies
        }
      ]

      expect(data).to.deep.equal({ userId, fieldId, dimensionId, fields })
    })
    it('just updates if found and field exists', function () {
      stub(MapData, 'get', () => ({ maxProgress: 123, maxCompetencies: 456 }))
      const userId = Random.id()
      const dimensionId = Random.id()
      const fieldId = Random.id()
      const progress = 11
      const competencies = 21
      const existingField = {
        fieldId,
        progress: 12,
        maxProgress: 99999,
        competencies: 10,
        maxCompetencies: 100000
      }
      AchievementsCollection.insert({ userId, dimensionId, fieldId, fields: [existingField] })
      Achievements.update({ userId, fieldId, dimensionId, progress, competencies })
      const doc = AchievementsCollection.findOne()
      const { _id, ...data } = doc
      const fields = [
        {
          fieldId,
          progress: 23,
          maxProgress: 99999,
          competencies: 31,
          maxCompetencies: 100000
        }
      ]

      expect(data).to.deep.equal({ userId, fieldId, dimensionId, fields })
    })
  })
})

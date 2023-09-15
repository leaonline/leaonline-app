/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { Session } from '../Session'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'
import {
  restoreCollections,
  stubCollection
} from '../../../tests/helpers/stubCollection'
import { Unit } from '../../content/Unit'
import { UnitSet } from '../../content/UnitSet'
import { Progress } from '../../progress/Progress'
import { createMethod } from '../../../infrastructure/factories/createMethod'

const SessionCollection = initTestCollection(Session)
const ProgressCollection = initTestCollection(Progress)
const UnitCollection = initTestCollection(Unit)
const UnitSetCollection = initTestCollection(UnitSet)
const allCollections = [
  UnitCollection,
  ProgressCollection,
  UnitSetCollection,
  SessionCollection
]
describe('Session', function () {
  before(function () {
    stubCollection(allCollections)
  })
  after(function () {
    restoreCollections()
  })
  beforeEach(function () {
    allCollections.forEach(c => c.remove({}))
  })

  describe(Session.create.name, function () {
    it('creates a new entry for a given unitSet doc with story', function () {
      const userId = Random.id()
      const unitSetDoc = {
        _id: Random.id(),
        field: Random.id(),
        story: [{}],
        units: [Random.id(), Random.id()],
        dimension: Random.id()
      }
      const { _id, startedAt, ...sessionDoc } = Session.create({ userId, unitSetDoc })

      expect(sessionDoc).to.deep.equal({
        userId: userId,
        unitSet: unitSetDoc._id,
        fieldId: unitSetDoc.field,
        dimensionId: unitSetDoc.dimension,
        nextUnit: unitSetDoc.units[0]
      })
      expect(_id).to.be.a('string')
      expect(startedAt).to.be.instanceOf(Date)
    })
    it('creates a new entry for a given unitSet doc without story', function () {
      const userId = Random.id()
      const unitSetDoc = {
        _id: Random.id(),
        field: Random.id(),
        dimension: Random.id(),
        units: [Random.id(), Random.id()]
      }
      const { _id, startedAt, ...sessionDoc } = Session.create({ userId, unitSetDoc })

      expect(sessionDoc).to.deep.equal({
        userId: userId,
        unitSet: unitSetDoc._id,
        fieldId: unitSetDoc.field,
        unit: unitSetDoc.units[0],
        dimensionId: unitSetDoc.dimension,
        nextUnit: unitSetDoc.units[1]
      })
      expect(_id).to.be.a('string')
      expect(startedAt).to.be.instanceOf(Date)
    })
  })
  describe(Session.get.name, function () {
    it('returns the session doc if found', function () {
      const fieldId = Random.id()
      const userId = Random.id()
      const unitId = Random.id()
      const unitSet = Random.id()
      const dimensionId = Random.id()

      UnitCollection.insert({ _id: unitId, shortCode: 'foo' })
      UnitSetCollection.insert({
        _id: unitSet,
        field: Random.id(),
        dimension: dimensionId,
        units: [unitId, Random.id()]
      })
      SessionCollection.insert({
        _id: Random.id(),
        userId,
        unitSet,
        fieldId,
        unit: unitId,
        dimensionId,
        nextUnit: undefined,
        competencies: 0,
        progress: 0
      })
      const { sessionDoc, unitSetDoc, unitDoc } = Session.get({ userId, unitSet })
      expect(sessionDoc).to.deep.equal(SessionCollection.findOne())
      expect(unitDoc).to.deep.equal(UnitCollection.findOne())
      expect(unitSetDoc).to.deep.equal(UnitSetCollection.findOne())
    })
    it('creates a new session if not found', function () {
      const userId = Random.id()
      const unitId = Random.id()
      const unitSet = Random.id()

      UnitCollection.insert({ _id: unitId, shortCode: 'foo' })
      UnitSetCollection.insert({
        _id: unitSet,
        field: Random.id(),
        units: [unitId, Random.id()]
      })
      const { sessionDoc, unitSetDoc, unitDoc } = Session.get({ userId, unitSet })
      expect(sessionDoc).to.deep.equal(SessionCollection.findOne())
      expect(unitDoc).to.deep.equal(UnitCollection.findOne())
      expect(unitSetDoc).to.deep.equal(UnitSetCollection.findOne())
    })
  })
  describe(Session.update.name, function () {
    it('throws if no session doc has been found', function () {
      expect(() => Session.update({})).to.throw('errors.docNotFound')
    })
    it('completes a session if no next unit is found', function () {
      const userId = Random.id()
      const unitSet = Random.id()
      const unitId = Random.id()
      const fieldId = Random.id()

      UnitCollection.insert({
        _id: unitId,
        pages: [{}, {}]
      })

      UnitSetCollection.insert({ _id: unitSet, units: [unitId] })
      const sessionId = SessionCollection.insert({
        userId,
        unitSet,
        fieldId,
        unit: unitId,
        nextUnit: undefined,
        competencies: 1,
        progress: 2
      })

      const nextUnitId = Session.update({ userId, sessionId })
      expect(nextUnitId).to.equal(null)

      const { completedAt, ...sessionDoc } = SessionCollection.findOne()
      expect(completedAt).to.be.instanceOf(Date)
      expect(sessionDoc).to.deep.equal({
        _id: sessionId,
        userId,
        unitSet,
        fieldId,
        competencies: 1,
        progress: 4
      })
    })
    it('sets the next unit and increases progress', function () {
      const userId = Random.id()
      const nextUnitId = Random.id()
      const nextNextUnitId = Random.id()
      const unitSet = Random.id()
      const unitId = Random.id()
      const fieldId = Random.id()

      UnitCollection.insert({
        _id: unitId,
        pages: [{}, {}]
      })
      UnitSetCollection.insert({
        _id: unitSet,
        units: [unitId, nextUnitId, nextNextUnitId]
      })

      const sessionId = SessionCollection.insert({
        userId,
        unitSet,
        fieldId,
        unit: unitId,
        nextUnit: nextUnitId,
        competencies: 1,
        progress: 2
      })

      const nextUnit = Session.update({ userId, sessionId })
      expect(nextUnit).to.equal(nextUnitId)

      const { updatedAt, completedAt, ...sessionDoc } = SessionCollection.findOne()
      expect(updatedAt).to.be.instanceOf(Date)
      expect(completedAt).to.equal(undefined)
      expect(sessionDoc).to.deep.equal({
        _id: sessionId,
        userId,
        unitSet,
        fieldId,
        unit: nextUnitId,
        nextUnit: nextNextUnitId,
        competencies: 1,
        progress: 4
      })
    })
    it('unsets next unit if this is the last unit', function () {
      const userId = Random.id()
      const nextUnitId = Random.id()
      const unitSet = Random.id()
      const unitId = Random.id()
      const fieldId = Random.id()

      UnitCollection.insert({
        _id: unitId,
        pages: [{}, {}]
      })
      UnitCollection.insert({
        _id: nextUnitId,
        pages: [{}, {}]
      })
      UnitSetCollection.insert({
        _id: unitSet,
        units: [unitId]
      })

      const sessionId = SessionCollection.insert({
        userId,
        unitSet,
        fieldId,
        unit: unitId,
        nextUnit: nextUnitId,
        competencies: 1,
        progress: 2
      })

      let nextUnit = Session.update({ userId, sessionId })
      expect(nextUnit).to.equal(nextUnitId)
      nextUnit = Session.update({ userId, sessionId })
      expect(nextUnit).to.equal(null)

      const { updatedAt, completedAt, ...sessionDoc } = SessionCollection.findOne()
      expect(updatedAt).to.be.instanceOf(Date)
      expect(completedAt).to.be.instanceOf(Date)
      expect(sessionDoc).to.deep.equal({
        _id: sessionId,
        userId,
        unitSet,
        fieldId,
        competencies: 1,
        progress: 6
      })
    })
  })
  describe(Session.methods.update.name, function () {
    const method = createMethod(Session.methods.update)

    it('it updates progress', function () {
      const userId = Random.id()
      const nextUnitId = Random.id()
      const nextNextUnitId = Random.id()
      const unitSet = Random.id()
      const unitId = Random.id()
      const fieldId = Random.id()
      const dimensionId = Random.id()

      UnitCollection.insert({
        _id: unitId,
        pages: [{}, {}],
        dimension: dimensionId
      })
      UnitSetCollection.insert({
        _id: unitSet,
        dimension: dimensionId,
        units: [unitId, nextUnitId, nextNextUnitId]
      })

      const sessionId = SessionCollection.insert({
        userId,
        unitSet,
        fieldId,
        dimensionId,
        unit: unitId,
        nextUnit: nextUnitId,
        competencies: 1,
        progress: 2
      })

      const next = method._execute({ userId }, { sessionId })
      expect(next).to.equal(nextUnitId)

      const { _id, ...progress } = ProgressCollection.findOne()
      expect(progress).to.deep.equal({
        userId,
        fieldId,
        unitSets: [
          {
            _id: unitSet,
            dimensionId,
            competencies: 1,
            complete: false,
            progress: 4
          }
        ]
      })
    })
  })

  describe(Session.methods.getAll.name, function () {
    it('is not impl')
  })
})

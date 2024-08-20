/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { Session } from '../Session'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'
import { Unit } from '../../content/Unit'
import { UnitSet } from '../../content/UnitSet'
import { Progress } from '../../progress/Progress'
import { createMethod } from '../../../infrastructure/factories/createMethod'
import { setupAndTeardown } from '../../../tests/helpers/setupAndTeardown'
import { testGetAllMethod } from '../../../tests/helpers/backendMethods'
import { Field } from '../../content/Field'
import { Dimension } from '../../content/Dimension'
import { SelectorFactories, DocumentFactories } from '../../../tests/helpers/Factories'
import { coin } from '../../../tests/helpers/coin'
import { expectThrown } from '../../../tests/helpers/expectThrown'

const SessionCollection = initTestCollection(Session)
const DimensionCollection = initTestCollection(Dimension)
const FieldCollection = initTestCollection(Field)
const ProgressCollection = initTestCollection(Progress)
const UnitCollection = initTestCollection(Unit)
const UnitSetCollection = initTestCollection(UnitSet)
const allCollections = [
  ProgressCollection,
  UnitCollection,
  UnitSetCollection,
  SessionCollection,
  DimensionCollection,
  FieldCollection
]

const createSessionMockDoc = ({ unitSet, fieldId, dimensionId, unit, nextUnit } = {}) => {
  const userId = Random.id()
  return {
    userId: userId,
    startedAt: new Date(),
    unitSet: unitSet ?? Random.id(),
    fieldId: fieldId ?? Random.id(),
    dimensionId: dimensionId ?? Random.id(),
    nextUnit: nextUnit ?? null,
    unit: unit ?? Random.id()
  }
}

describe('Session', function () {
  setupAndTeardown(allCollections)

  describe(Session.create.name, function () {
    it('creates a new entry for a given unitSet doc with story', async () => {
      const userId = Random.id()
      const unitSetDoc = {
        _id: Random.id(),
        field: Random.id(),
        story: [{}],
        units: [Random.id(), Random.id()],
        dimension: Random.id()
      }
      const { _id, startedAt, ...sessionDoc } = await Session.create({ userId, unitSetDoc })

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
    it('creates a new entry for a given unitSet doc without story', async () => {
      const userId = Random.id()
      const unitSetDoc = {
        _id: Random.id(),
        field: Random.id(),
        dimension: Random.id(),
        units: [Random.id(), Random.id()]
      }
      const { _id, startedAt, ...sessionDoc } = await Session.create({ userId, unitSetDoc })

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
    it('returns the session doc if found', async () => {
      const fieldId = Random.id()
      const userId = Random.id()
      const unitId = Random.id()
      const unitSet = Random.id()
      const dimensionId = Random.id()

      await UnitCollection.insertAsync({ _id: unitId, shortCode: 'foo' })
      await UnitSetCollection.insertAsync({
        _id: unitSet,
        field: Random.id(),
        dimension: dimensionId,
        units: [unitId, Random.id()]
      })
      await SessionCollection.insertAsync({
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
      const { sessionDoc, unitSetDoc, unitDoc } = await Session.get({ userId, unitSet })
      expect(sessionDoc).to.deep.equal(await SessionCollection.findOneAsync())
      expect(unitDoc).to.deep.equal(await UnitCollection.findOneAsync())
      expect(unitSetDoc).to.deep.equal(await UnitSetCollection.findOneAsync())
    })
    it('creates a new session if not found', async () => {
      const userId = Random.id()
      const unitId = Random.id()
      const unitSet = Random.id()

      UnitCollection.insert({ _id: unitId, shortCode: 'foo' })
      await UnitSetCollection.insertAsync({
        _id: unitSet,
        field: Random.id(),
        units: [unitId, Random.id()]
      })
      const { sessionDoc, unitSetDoc, unitDoc } = await Session.get({ userId, unitSet })
      expect(sessionDoc).to.deep.equal(await SessionCollection.findOneAsync())
      expect(unitDoc).to.deep.equal(await UnitCollection.findOneAsync())
      expect(unitSetDoc).to.deep.equal(await UnitSetCollection.findOneAsync())
    })
  })
  describe(Session.update.name, function () {
    it('throws if no session doc has been found', async () => {
      await expectThrown({
        fn: () => Session.update({}),
        message: 'errors.docNotFound'
      })
    })
    it('completes a session if no next unit is found', async () => {
      const userId = Random.id()
      const unitSet = Random.id()
      const unitId = Random.id()
      const fieldId = Random.id()

      await UnitCollection.insertAsync({
        _id: unitId,
        pages: [{}, {}]
      })

      await UnitSetCollection.insertAsync({ _id: unitSet, units: [unitId] })
      const sessionId = await SessionCollection.insertAsync({
        userId,
        unitSet,
        fieldId,
        unit: unitId,
        nextUnit: undefined,
        competencies: 1,
        progress: 2
      })

      const nextUnitId = await Session.update({ userId, sessionId })
      expect(nextUnitId).to.equal(null)

      const { completedAt, ...sessionDoc } = await SessionCollection.findOneAsync()
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
    it('sets the next unit and increases progress', async () => {
      const userId = Random.id()
      const nextUnitId = Random.id()
      const nextNextUnitId = Random.id()
      const unitSet = Random.id()
      const unitId = Random.id()
      const fieldId = Random.id()

      await UnitCollection.insertAsync({
        _id: unitId,
        pages: [{}, {}]
      })
      await UnitSetCollection.insertAsync({
        _id: unitSet,
        units: [unitId, nextUnitId, nextNextUnitId]
      })

      const sessionId = await SessionCollection.insertAsync({
        userId,
        unitSet,
        fieldId,
        unit: unitId,
        nextUnit: nextUnitId,
        competencies: 1,
        progress: 2
      })

      const nextUnit = await Session.update({ userId, sessionId })
      expect(nextUnit).to.equal(nextUnitId)

      const { updatedAt, completedAt, ...sessionDoc } = await SessionCollection.findOneAsync()
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
    it('unsets next unit if this is the last unit', async () => {
      const userId = Random.id()
      const nextUnitId = Random.id()
      const unitSet = Random.id()
      const unitId = Random.id()
      const fieldId = Random.id()

      await UnitCollection.insertAsync({
        _id: unitId,
        pages: [{}, {}]
      })
      await UnitCollection.insertAsync({
        _id: nextUnitId,
        pages: [{}, {}]
      })
      await UnitSetCollection.insertAsync({
        _id: unitSet,
        units: [unitId]
      })

      const sessionId = await SessionCollection.insertAsync({
        userId,
        unitSet,
        fieldId,
        unit: unitId,
        nextUnit: nextUnitId,
        competencies: 1,
        progress: 2
      })

      let nextUnit = await Session.update({ userId, sessionId })
      expect(nextUnit).to.equal(nextUnitId)
      nextUnit = await Session.update({ userId, sessionId })
      expect(nextUnit).to.equal(null)

      const { updatedAt, completedAt, ...sessionDoc } = await SessionCollection.findOneAsync()
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

  describe('methods', () => {
    describe(Session.methods.update.name, function () {
      const method = createMethod(Session.methods.update)

      it('it updates progress', async () => {
        const userId = Random.id()
        const nextUnitId = Random.id()
        const nextNextUnitId = Random.id()
        const unitSet = Random.id()
        const unitId = Random.id()
        const fieldId = Random.id()
        const dimensionId = Random.id()

        await UnitCollection.insertAsync({
          _id: unitId,
          pages: [{}, {}],
          dimension: dimensionId
        })
        await UnitSetCollection.insertAsync({
          _id: unitSet,
          dimension: dimensionId,
          units: [unitId, nextUnitId, nextNextUnitId]
        })

        const sessionId = await SessionCollection.insertAsync({
          userId,
          unitSet,
          fieldId,
          dimensionId,
          unit: unitId,
          nextUnit: nextUnitId,
          competencies: 1,
          progress: 2
        })

        const next = await method._execute({ userId }, { sessionId })
        expect(next).to.equal(nextUnitId)

        const { _id, ...progress } = await ProgressCollection.findOneAsync()
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

    testGetAllMethod(Session, {
      factory: async withDeps => {
        const unit = withDeps ? (await UnitCollection.findOneAsync())._id : Random.id()
        const unitSet = withDeps ? (await UnitSetCollection.findOneAsync())._id : Random.id()
        const dimensionId = withDeps ? (await DimensionCollection.findOneAsync())._id : Random.id()
        const fieldId = withDeps ? (await FieldCollection.findOneAsync())._id : Random.id()
        const doc = {
          dimensionId,
          fieldId,
          unitSet
        }
        if (coin()) {
          doc.unit = unit
        }
        else {
          doc.nextUnit = unit
        }
        return createSessionMockDoc(doc)
      },
      dependencies: {
        [Field.name]: {
          factory: DocumentFactories.get(Field.name),
          selector: SelectorFactories.idSelector('fieldId')
        },
        [Dimension.name]: {
          factory: DocumentFactories.get(Dimension.name),
          selector: SelectorFactories.idSelector('dimensionId')
        },
        [UnitSet.name]: {
          factory: DocumentFactories.get(UnitSet.name),
          selector: SelectorFactories.idSelector('unitSet')
        },
        [Unit.name]: {
          factory: DocumentFactories.get(Unit.name),
          selector: SelectorFactories.idSelector('unit', 'nextUnit')
        }
      }
    })
  })
})

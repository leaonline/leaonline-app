import { UserProgress } from '../../lib/contexts/UserProgress'
import { createContextBaseTests } from '../../__testHelpers__/createContextBaseTests'
import { simpleRandomHex } from '../../lib/utils/simpleRandomHex'
import { getCollection } from '../../lib/infrastructure/collections/collections'
import Meteor from '@meteorrn/core'

describe(UserProgress.name, function () {
  createContextBaseTests({ ctx: UserProgress })

  describe(UserProgress.update.name, () => {
    it('skips if no progress doc is available', async () => {
      const fieldId = simpleRandomHex()
      const updated = await UserProgress.update({ fieldId })
      expect(updated).toBe(false)
      expect(getCollection(UserProgress.name)
        .findOne({ fieldId }))
        .toBe(undefined)
    })
    it('updates the progress doc', async () => {
      const ProgressCollection = UserProgress.collection()
      const fieldId = simpleRandomHex()
      const unitSetDoc = {
        _id: simpleRandomHex(),
        dimensionId: simpleRandomHex(),
        progress: 0,
        competencies: 0
      }
      const userId = simpleRandomHex()
      const docId = await ProgressCollection.insert({ userId, fieldId })
      const beforeDoc = ProgressCollection.findOne(docId)
      const updated = await UserProgress.update({ fieldId, unitSetDoc })
      expect(updated).toBe(true)

      const updatedDoc = ProgressCollection.findOne(docId)
      expect(updatedDoc).not.toStrictEqual(beforeDoc)
      expect(updatedDoc).toStrictEqual({
        _id: docId,
        fieldId,
        _version: 2,
        userId,
        [unitSetDoc._id]: unitSetDoc
      })
    })
  })
  describe(UserProgress.fetchFromServer.name, function () {
    it('returns undefined if no doc was loaded from server', async () => {
      jest
        .spyOn(Meteor, 'call')
        .mockImplementation((name, args, callback) => {
          callback(null, null)
        })

      jest
        .spyOn(Meteor, 'status')
        .mockImplementation(() => {
          return {
            status: 'connected',
            connected: true
          }
        })
      const fieldId = simpleRandomHex()
      const fetched = await UserProgress.fetchFromServer({ fieldId })
      expect(fetched).toBe(undefined)
    })
    it('fetches a progress doc from the server and creates a new progress doc if not defined', async () => {
      const dimensionId = simpleRandomHex()
      const fieldId = simpleRandomHex()
      const unitSet1 = {
        _id: simpleRandomHex(),
        dimensionId,
        progress: 3,
        competencies: 50,
        complete: true
      }
      const unitSet2 = {
        _id: simpleRandomHex(),
        dimensionId,
        progress: 16,
        competencies: 207,
        complete: false
      }
      const serverDoc = {
        _id: simpleRandomHex(),
        userId: simpleRandomHex(),
        fieldId,
        unitSets: [unitSet1, unitSet2]
      }
      jest
        .spyOn(Meteor, 'call')
        .mockImplementation((name, args, callback) => {
          callback(null, serverDoc)
        })

      jest
        .spyOn(Meteor, 'status')
        .mockImplementation(() => {
          return {
            status: 'connected',
            connected: true
          }
        })

      const fetched = await UserProgress.fetchFromServer({ fieldId })
      expect(fetched).toStrictEqual({
        _id: serverDoc._id,
        fieldId: serverDoc.fieldId,
        userId: serverDoc.userId,
        _version: 1,
        unitSets: {
          [unitSet1._id]: unitSet1,
          [unitSet2._id]: unitSet2,
        }
      })
    })
    it('fetches a progress doc from the server and updates an existing progress doc if defined', async () => {
      const dimensionId = simpleRandomHex()
      const fieldId = simpleRandomHex()
      const unitSet1 = {
        _id: simpleRandomHex(),
        dimensionId,
        progress: 3,
        competencies: 50,
        complete: true
      }
      const unitSet2 = {
        _id: simpleRandomHex(),
        dimensionId,
        progress: 16,
        competencies: 207,
        complete: false
      }
      const serverDoc = {
        _id: simpleRandomHex(),
        userId: simpleRandomHex(),
        fieldId,
        unitSets: [unitSet1, unitSet2]
      }
      jest
        .spyOn(Meteor, 'call')
        .mockImplementation((name, args, callback) => {
          callback(null, { ...serverDoc })
        })

      jest
        .spyOn(Meteor, 'status')
        .mockImplementation(() => {
          return {
            status: 'connected',
            connected: true
          }
        })

      await UserProgress.collection().insert({
        _id: serverDoc._id,
        fieldId: serverDoc.fieldId,
        userId: serverDoc.userId,
        unitSets: {}
      })
      const fetched = await UserProgress.fetchFromServer({ fieldId })
      expect(fetched).toStrictEqual({
        _id: serverDoc._id,
        fieldId: serverDoc.fieldId,
        userId: serverDoc.userId,
        _version: 2,
        unitSets: {
          [unitSet1._id]: unitSet1,
          [unitSet2._id]: unitSet2,
        }
      })
    })
  })
  describe(UserProgress.get.name, function () {
    it('skips if no fieldId is given', async () => {
      jest
        .spyOn(UserProgress, 'fetchFromServer')
        .mockImplementation(() => {
          throw new Error('Unexpected call')
        })
      const args = [undefined, {}, { fieldId: undefined }, { fieldId: null}]
      for (const options of args) {
        const doc = await UserProgress.get(options)
        expect(doc).toBe(undefined)
      }
    })
    it('returns a document if it locally exists', async () => {
      jest
        .spyOn(UserProgress, 'fetchFromServer')
        .mockImplementation(() => {
          throw new Error('Unexpected call')
        })
      const fieldId = simpleRandomHex()
      const docId = await UserProgress.collection().insert({ fieldId })
      const expectedDoc = UserProgress.collection().findOne(docId)
      const receivedDoc = await UserProgress.get({ fieldId })
      expect(receivedDoc).toStrictEqual(expectedDoc)
    })
    it('fetches from server if doc does not exist', async () => {
      const fieldId = simpleRandomHex()
      const serverDoc = { _id: simpleRandomHex(), fieldId }
      jest
        .spyOn(UserProgress, 'fetchFromServer')
        .mockImplementation(async () => serverDoc)
      const receivedDoc = await UserProgress.get({ fieldId })
      expect(receivedDoc).toStrictEqual(serverDoc)
    })
  })
})

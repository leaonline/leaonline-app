/* eslint-env mocha */
import { Random } from 'meteor/random'
import { MapIcons } from '../MapIcons'
import {
  testGetAllMethod,
  testGetMethod,
  testInsert,
  testRemove,
  testUpdate
} from '../../../tests/helpers/backendMethods'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'
import { Field } from '../../content/Field'
import { createIdSet } from '../../../api/utils/createIdSet'
import { setupAndTeardown } from '../../../tests/helpers/setupAndTeardown'

const MapIconsCollection = initTestCollection(MapIcons)
const FieldCollection = initTestCollection(Field)
const createDoc = ({ fieldId, icons } = {}) => {
  return {
    fieldId: fieldId ?? Random.id(),
    icons: icons ?? ['foo', 'bar', 'baz']
  }
}
describe(MapIcons.name, function () {
  setupAndTeardown([MapIconsCollection, FieldCollection])
  describe('methods', function () {
    testInsert(MapIcons, {
      factory: createDoc,
      expectSync: true
    })
    testUpdate(MapIcons, {
      factory: () => {
        const fieldId = Random.id()
        const insertDoc = { fieldId, icons: ['foo', 'bar', 'bar'] }
        const updateDoc = { fieldId, icons: ['foo'] }
        return { insertDoc, updateDoc }
      },
      expectSync: true
    })
    testRemove(MapIcons, {
      factory: createDoc,
      expectSync: true
    })
    testGetMethod(MapIcons)
    testGetAllMethod(MapIcons, {
      factory: (withDeps) => {
        const fieldId = withDeps
          ? FieldCollection.findOne()._id
          : Random.id()
        return createDoc({ fieldId })
      },
      dependencies: {
        [Field.name]: {
          selector: ({ docs }) => {
            const ids = [...createIdSet(docs, 'fieldId')]
            return { _id: { $in: ids } }
          },
          factory: () => ({ title: Random.id(), shortCode: 'al' })
        }
      },
    })
  })
})

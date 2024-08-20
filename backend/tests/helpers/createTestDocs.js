import { expect } from 'chai'
import { iterateAsync } from './iterate'
import { getCollection } from '../../api/utils/getCollection'

export const createTestDocs = async ({ times = 10, factory, collection, name }) => {
  const Collection = collection ?? getCollection(name)
  return await iterateAsync(times, async () => {
    const insertDoc = await factory()
    const docId = await Collection.insertAsync(insertDoc)
    const doc = await Collection.findOneAsync(docId)
    expect(doc).to.not.equal(undefined)
    return doc
  })
}

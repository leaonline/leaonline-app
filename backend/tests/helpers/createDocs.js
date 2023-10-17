import { expect } from 'chai'
import { iterate } from './iterate'
import { getCollection } from '../../api/utils/getCollection'

export const createDocs = ({ times = 10, factory, collection, name }) => {
  const Collection = collection ?? getCollection(name)
  return iterate(times, () => {
    const insertDoc = factory()
    const docId = Collection.insert(insertDoc)
    const doc = Collection.findOne(docId)
    expect(doc).to.not.equal(undefined)
    return doc
  })
}

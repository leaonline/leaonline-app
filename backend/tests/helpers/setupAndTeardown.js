import { restoreAll } from './stubUtils'
import { restoreCollections, stubCollection } from './stubCollection'

export const setupAndTeardown = (collections) => {
  before(() => {
    stubCollection(collections)
  })
  after(() => {
    restoreCollections()
  })
  afterEach(() => {
    restoreAll()
    collections.forEach(c => c.remove({}))
  })
}

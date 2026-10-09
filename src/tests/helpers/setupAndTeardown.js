/* eslint-env mocha */
import { restoreAll } from './stubUtils'
import { restoreCollections, stubCollection } from './stubCollection'

export const setupAndTeardown = (collections) => {
  before(() => {
    stubCollection(collections)
  })
  after(() => {
    restoreCollections()
  })
  afterEach(async () => {
    restoreAll()
    for (const c of collections) {
      await c.removeAsync({})
    }
  })
}

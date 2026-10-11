/* eslint-env mocha */
describe('data loading', () => {
  require('./asyncHttp.tests')
  require('./loadOnce.tests')
  require('./loadContentDoc.tests')
  require('./loadAllContentDocs.tests')
  require('./createSessionLoader.tests')
})

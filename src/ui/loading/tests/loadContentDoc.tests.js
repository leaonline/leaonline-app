/* eslint-env mocha */
import { loadContentDoc } from '../loadContentDoc'
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { RequestedDocsContext } from '../../../../tests/webapp-server-helpers'
import { expectThrow } from '../../../../tests/helpers.tests'
import { toContentServerURL } from '../../../api/url/toContentServerURL'

describe(loadContentDoc.name, function () {
  beforeEach(function () {
    RequestedDocsContext.collection().remove({})
  })
  it('loads a single document from the content server', async function () {
    const docId = RequestedDocsContext.routes.byId.docId
    const doc = await loadContentDoc(RequestedDocsContext, docId)
    expect(doc).to.deep.equal(RequestedDocsContext.doc)
    expect(doc.regex).to.deep.equal(/[a-z]/g)
    expect(RequestedDocsContext.collection().find().count()).to.equal(1)

    // local collection
    const localDoc = RequestedDocsContext.collection().findOne(docId)
    expect(localDoc).to.deep.equal(doc)

    // cached response
    const cachedDoc = await loadContentDoc(RequestedDocsContext, docId)
    expect(cachedDoc).to.deep.equal(doc)
    expect(RequestedDocsContext.collection().find().count()).to.equal(1)
  })
  it('throws an error if the request targets a faulty _id', async function () {
    const docId = Random.id()
    await expectThrow({
      fn: function () {
        return loadContentDoc(RequestedDocsContext, docId)
      },
      message: `failed [404] Invalid request id ${docId}`
    })
  })
  it('throws if the response is not a document', async function () {
    await expectThrow({
      fn: function () {
        return loadContentDoc(RequestedDocsContext, 'plain')
      },
      message: `Expected document for GET ${toContentServerURL(RequestedDocsContext.routes.byId.path)}`
    })
  })
})

/* eslint-env mocha */
import { loadAllContentDocs } from '../loadAllContentDocs'
import { expect } from 'chai'
import { RequestedDocsContext } from '../../../../tests/webapp-server-helpers'
import { expectThrow } from '../../../../tests/helpers.tests'

describe(loadAllContentDocs.name, function () {
  beforeEach(function () {
    RequestedDocsContext.collection().remove({})
  })
  it('throws on error-responses', async function () {
    await expectThrow({
      fn: function () {
        return loadAllContentDocs(RequestedDocsContext, { createError: true })
      },
      message: 'failed [404] Invalid request / createError'
    })
  })
  it('throws if docs contain no _id value', async function () {
    await expectThrow({
      fn: function () {
        return loadAllContentDocs(RequestedDocsContext, { noId: true })
      },
      message: 'Expected doc with _id to upsert'
    })
  })
  it('loads all docs by given context', async function () {
    const docs = await loadAllContentDocs(RequestedDocsContext, {})

    expect(docs).to.deep.equal([RequestedDocsContext.doc])
    expect(RequestedDocsContext.collection().find().count()).to.equal(1)

    // local collection
    const localDocs = RequestedDocsContext.collection().find().fetch()
    expect(localDocs).to.deep.equal(docs)

    // cached response
    const cachedDocs = await loadAllContentDocs(RequestedDocsContext)
    expect(cachedDocs).to.deep.equal(docs)
    expect(RequestedDocsContext.collection().find().count()).to.equal(1)
  })
  it('several result formats', async function () {
    let docs

    docs = await loadAllContentDocs(RequestedDocsContext, { noDocs: true })
    expect(docs).to.deep.equal([])

    docs = await loadAllContentDocs(RequestedDocsContext, { noArray: true })
    expect(docs).to.deep.equal([RequestedDocsContext.doc])

    docs = await loadAllContentDocs(RequestedDocsContext, { empty: true })
    expect(docs).to.deep.equal([])
  })
})

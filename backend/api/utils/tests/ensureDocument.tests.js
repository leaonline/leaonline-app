/* eslint-env mocha */
import { expect } from 'chai'
import { ensureDocument } from '../ensureDocument'
import { Random } from 'meteor/random'
import { restoreAll, stub } from '../../../tests/helpers/stubUtils'
import { DocNotFoundError } from '../../errors/DocNotFoundError'

describe(ensureDocument.name, function () {
  afterEach(() => {
    restoreAll()
  })
  it('throws an error with given information', () => {
    stub(console, 'error',  () => expect.fail()) // should not log
    const docId = Random.id()
    const name = 'foobar'
    const details = { foo: 'bar' }

    ;[undefined, null].forEach(document => {
      const thrown = expect(() => ensureDocument({ name, details, docId, document }))
        .to.throw('errors.docNotFound')
      thrown.with.property('reason', 'document.notFoundById')
      thrown.with.deep.property('details', { name, docId, ...details })
    })
  })
  it('logs to console, if flag is true', () => {
    let logged
    stub(console, 'error',  (err) => {
      logged = err
    })
    const docId = Random.id()
    expect(() => ensureDocument({ logToConsole: true, docId })).to.throw()
    expect(logged).to.be.instanceOf(DocNotFoundError)
    expect(logged.details.docId).to.equal(docId)
  })
  it('does not throw if the document exists', () => {
    const document = {}
    ensureDocument({ document })
  })
})

/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { Email } from 'meteor/email'
import { ServerErrors } from '../ServerErrors'
import { restoreAll, stub } from '../../../tests/helpers/stubUtils'
import { getCollection } from '../../../api/utils/getCollection'
import { restoreCollections, stubCollection } from '../../../tests/helpers/stubCollection'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'

const ServerErrorsCollection = initTestCollection(ServerErrors)

describe(ServerErrors.name, function () {
  before(() => {
    stubCollection([ServerErrorsCollection])
  })
  after(() => {
    restoreCollections()
    restoreAll()
  })
  it('saves a server error', async () => {
    const emailSent = stub(Email, 'sendAsync', () => {})

    const options = {
      error: new Error('foo bar moo'),
      userId: Random.id(),
      isMethod: true,
      name: 'method.foobar'
    }

    const stackSplit = options.error.stack.split('\n')
    stackSplit.length = 3
    const stack = stackSplit.join('\n')
    const docId = await ServerErrors.handle(options)
    const { _id, createdAt, ...doc } = await getCollection(ServerErrors.name).findOneAsync(docId)
    expect(_id).to.be.a('string')
    expect(createdAt).to.be.instanceOf(Date)
    expect(doc).to.deep.equal({
      details: undefined,
      message: 'foo bar moo',
      name: 'Error',
      reason: undefined,
      stack: stack,
      title: undefined,
      type: 'native',
      method: 'method.foobar',
      publication: undefined,
      isSystem: undefined,
      userId: options.userId,
      tag: undefined
    })
    expect(emailSent.calledOnce).to.equal(true)
  })
})

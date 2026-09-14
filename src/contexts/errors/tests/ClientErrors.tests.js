/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { Email } from 'meteor/email'
import { ClientErrors } from '../ClientErrors'
import { restoreAll, stub } from '../../../tests/helpers/stubUtils'
import { getCollection } from '../../../api/utils/getCollection'
import { restoreCollections, stubCollection } from '../../../tests/helpers/stubCollection'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'
import { asyncTimeout } from '../../../api/utils/asyncTimeout'

const ClientErrorsCollection = initTestCollection(ClientErrors)

describe(ClientErrors.name, function () {
  before(() => {
    stubCollection([ClientErrorsCollection])
  })
  after(() => {
    restoreCollections()
    restoreAll()
  })
  it('it stores the error', async () => {
    const emailSent = stub(Email, 'sendAsync', async () => {})

    const options = {
      name: 'error',
      reason: 'foo',
      details: { bar: 'moo' },
      stack: 'error in file.js\ncalled by foobar.js\nmoooooooo in moo.js'
    }

    const userId = Random.id()
    const docId = await ClientErrors.methods.send.run.call({ userId }, options)
    const { _id, createdAt, ...doc } = await getCollection(ClientErrors.name).findOneAsync(docId)
    expect(_id).to.be.a('string')
    expect(createdAt).to.be.instanceOf(Date)
    expect(doc).to.deep.equal({
      details: { bar: 'moo' },
      message: undefined,
      name: 'error',
      reason: 'foo',
      stack: options.stack,
      title: undefined,
      type: 'native',
      userId
    })

    await asyncTimeout(20)
    expect(emailSent.calledOnce).to.equal(true)
  })
})

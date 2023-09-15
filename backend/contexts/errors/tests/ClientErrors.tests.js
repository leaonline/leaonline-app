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
    let emailSent = false
    stub(Email, 'send', () => {
      emailSent = true
    })

    const options = {
      name: 'error',
      reason: 'foo',
      details: { bar: 'moo' },
      stack: 'error in file.js\ncalled by foobar.js\nmoooooooo in moo.js'
    }

    const userId = Random.id()
    const docId = ClientErrors.methods.send.run.call({ userId }, options)
    const { _id, createdAt, ...doc } = getCollection(ClientErrors.name).findOne(docId)
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
    expect(emailSent).to.equal(true)
  })
})

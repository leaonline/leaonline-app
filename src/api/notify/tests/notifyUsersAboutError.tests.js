/* eslint-env mocha */
import { expect } from 'chai'
import { Email } from 'meteor/email'
import { notifyUsersAboutError } from '../notifyUsersAboutError'
import { restoreAll, stub } from '../../../../tests/helpers.tests'

describe(notifyUsersAboutError.name, function () {
  afterEach(function () {
    restoreAll()
  })
  it('skips an undefined error', async function () {
    stub(Email, 'send', () => expect.fail())
    await notifyUsersAboutError()
  })
  it('sends an email with a stringified error', async function () {
    const err = new Error('foobar')
    err.type = 'testError'

    stub(Email, 'send', ({ to, from, replyTo, subject, text }) => {
      expect(to).to.equal('admin@example.com')
      expect(from).to.equal('system@example.com')
      expect(replyTo).to.equal('noreply@example.com')
      expect(subject).to.equal('otu.lea [error]: foobar')
      expect(text).to.equal(JSON.stringify(err, null, 2).trim())
    })

    await notifyUsersAboutError(err)
  })
})

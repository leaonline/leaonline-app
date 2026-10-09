/* eslint-env mocha */
import { expect } from 'chai'
import { Meteor } from 'meteor/meteor'
import { Email } from 'meteor/email'
import { notifyUsersAboutError } from '../notifyUsersAboutError'
import { stub, restoreAll, overrideStub } from '../../../tests/helpers/stubUtils'
import { DocNotFoundError } from '../DocNotFoundError'
import { normalizeError } from '../normalizeError'

const architectures = ['server', 'client']
const appName = Meteor.settings.app.name
const { notify, replyTo, from } = Meteor.settings.email
const getHtml = (error) => {
  const source = `<pre><code>${JSON.stringify(error, null, 2)}</code></pre>`
  return `<html lang="en"><body>${source}</body></html>`
}

describe(notifyUsersAboutError.name, function () {
  afterEach(() => {
    restoreAll()
  })
  it('skips if no error is given', async () => {
    stub(Email, 'sendAsync', expect.fail)
    const values = [null, undefined, '', 1, () => {}]
    for (const value of values) {
      await notifyUsersAboutError(value, undefined)
    }
  })
  it('notifies registered users about a server error', async () => {
    stub(Email, 'sendAsync', expect.fail)
    const values = [
      new Error('foo'),
      new TypeError('bar'),
      new Meteor.Error('foo', 'bar', 'baz'),
      new DocNotFoundError('foo', 'bar')
    ]

    for (const error of values) {
      for (const type of architectures) {
        const e = normalizeError({ error })
        overrideStub(Email, 'sendAsync', async options => {
          expect(notify).to.include(options.to)
          expect(options.subject).to.equal(`${appName} (${type}) [error]: ${e.message}`)
          expect(options.replyTo).to.equal(replyTo)
          expect(options.from).to.equal(from)
          expect(options.html).to.equal(getHtml(e))
        })
        await notifyUsersAboutError(e, type)
      }
    }
  })
})

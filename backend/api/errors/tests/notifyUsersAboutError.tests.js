/* eslint-env mocha */
import { expect } from 'chai'
import { Meteor } from 'meteor/meteor'
import { Email } from 'meteor/email'
import { notifyUsersAboutError } from '../notifyUsersAboutError'
import { stub, restoreAll, overrideStub } from '../../../tests/helpers/stubUtils'
import { DocNotFoundError } from '../DocNotFoundError'
import { normalizeError } from '../normalizeError'

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
  it('skips if no error is given', () => {
    stub(Email, 'send', args => expect.fail())
    ;[null, undefined, '', 1, () => {}].forEach(value => {
      notifyUsersAboutError(value, undefined)
    })
  })
  it('notifies registered users about a server error', () => {
    stub(Email, 'send', args => expect.fail())
    ;[
      new Error('foo'),
      new TypeError('bar'),
      new Meteor.Error('foo', 'bar', 'baz'),
      new DocNotFoundError('foo', 'bar')
    ].forEach(error => {
      ['server', 'client'].forEach(type => {
        const e = normalizeError({ error })

        overrideStub(Email, 'send', options => {
          expect(notify).to.include(options.to)
          expect(options.subject).to.equal(`${appName} (${type}) [error]: ${e.message}`)
          expect(options.replyTo).to.equal(replyTo)
          expect(options.from).to.equal(from)
          expect(options.html).to.equal(getHtml(e))
        })
        notifyUsersAboutError(e, type)
      })
    })
  })
})

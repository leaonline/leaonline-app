/* eslint-env mocha */
/* global fetch */
import { Meteor } from 'meteor/meteor'
import { expect } from 'chai'
import { createReachabilityUrl } from '../createReachabilityUrl'

describe(createReachabilityUrl.name, () => {
  it('creates a reachability url for a given path', async () => {
    const path = '/foo-bar-baz'
    createReachabilityUrl({ path })
    expect(() => createReachabilityUrl({ path }))
      .to.throw(`Path ${path} already taken!`)

    const url = Meteor.absoluteUrl(path)
    const response = await fetch(url, { method: 'head' })

    expect(response.ok).to.eq(true)
    expect(response.status).to.equal(204)
    expect(response.body).to.equal(null)
    expect(response.statusText).to.equal('No Content')
    expect(await response.text()).to.equal('')
    expect(response.headers.get('content-length')).to.eq('0')
    expect(response.headers.get('content-type')).to.eq(null)
  })
})

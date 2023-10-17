/* eslint-env mocha */
import { Meteor } from 'meteor/meteor'
import { expect } from 'chai'
import { HTTP } from 'meteor/jkuester:http'
import { createReachabilityUrl } from '../createReachabilityUrl'

describe(createReachabilityUrl.name, function () {
  it('creates a reachability url for a given path', () => {
    const path = '/foo-bar-baz'
    createReachabilityUrl({ path })
    const url = Meteor.absoluteUrl(path)
    const response = HTTP.call('head', url)
    expect(response.statusCode).to.equal(204)

    expect(() => createReachabilityUrl({ path }))
      .to.throw(`Path ${path} already taken!`)
  })
})

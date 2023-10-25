/* eslint-env mocha */
import { Meteor } from 'meteor/meteor'
import { expect } from 'chai'
import { HTTP } from 'meteor/jkuester:http'
import { createReachabilityUrl } from '../createReachabilityUrl'
import { asyncTimeout } from '../../utils/asyncTimeout'

describe(createReachabilityUrl.name, () => {
  it('creates a reachability url for a given path', async () => {
    const path = '/foo-bar-baz'
    createReachabilityUrl({ path })
    await asyncTimeout(50)

    const url = Meteor.absoluteUrl(path)
    const response = HTTP.call('get', url)
    expect(response.statusCode).to.equal(204)

    expect(() => createReachabilityUrl({ path }))
      .to.throw(`Path ${path} already taken!`)
  })
})

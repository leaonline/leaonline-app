/* eslint-env mocha */
import { expect } from 'chai'
import { createReachabilityUrl } from '../createReachabilityUrl'

describe(createReachabilityUrl.name, () => {
  it('creates a reachability url for a given path', () => {
    const path = '/foo-bar-baz'
    createReachabilityUrl({ path })
    expect(() => createReachabilityUrl({ path }))
      .to.throw(`Path ${path} already taken!`)
  })
})

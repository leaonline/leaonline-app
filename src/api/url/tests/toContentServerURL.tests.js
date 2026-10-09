/* eslint-env mocha */
import { Meteor } from 'meteor/meteor'
import { expect } from 'chai'
import { toContentServerURL } from '../toContentServerURL'

// we can use the url base of this project port because we use
// an extra Meteor.settings file that has all external ports changed to this
// so we can mock external apps locally
const url = u => Meteor.absoluteUrl(u)

describe(toContentServerURL.name, function () {
  it('returns the base URL for the content server if no params are passed', function () {
    expect(toContentServerURL('/api/unit/get')).to.equal(url('/api/unit/get'))
  })
  it('returns the URL with query if params are given', function () {
    const _id = '01234567890'
    const name = 'John Doe'
    expect(toContentServerURL('/api/unit/get', { _id, name })).to.equal(url('/api/unit/get?_id=01234567890&name=John%20Doe'))

    const text = 'Hello, world! This is a star* sentence with extra chars, like !"§$%&/()=?\''
    expect(toContentServerURL('/api/unit/get', { text })).to.equal(url('/api/unit/get?text=Hello%2C%20world%21%20This%20is%20a%20star%2A%20sentence%20with%20extra%20chars%2C%20like%20%21%22%C2%A7%24%25%26%2F%28%29%3D%3F%27'))
  })
  it('correctly processes array params', function () {
    const arr = [1, 2, 3, 4]
    expect(toContentServerURL('/api/unit/get', { arr })).to.equal(url('/api/unit/get?arr=1&arr=2&arr=3&arr=4'))

    const arr2 = ['!', '§', '(', ')', '?', '\'', '*']
    expect(toContentServerURL('/api/unit/get', { arr2 })).to.equal(url('/api/unit/get?arr2=%21&arr2=%C2%A7&arr2=%28&arr2=%29&arr2=%3F&arr2=%27&arr2=%2A'))
  })
  it('correctly processes object params', function () {
    const obj = JSON.stringify({ foo: 'bar' }, null, 0)
    expect(toContentServerURL('/api/unit/get', { obj })).to.equal(url('/api/unit/get?obj=%7B%22foo%22%3A%22bar%22%7D'))
  })
  it('correctly processes date params', function () {
    const date = 'Date Fri Jun 25 2021 08:09:53 GMT+0200 (Central European Summer Time)'
    expect(toContentServerURL('/api/unit/get', { date })).to.equal(url('/api/unit/get?date=Date%20Fri%20Jun%2025%202021%2008%3A09%3A53%20GMT%2B0200%20%28Central%20European%20Summer%20Time%29'))
  })
})

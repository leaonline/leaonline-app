/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { createRepository } from '../createRepository'

describe(createRepository.name, function () {
  it('creates a new repository with default in-mem storage', function () {
    const repo = createRepository()
    const item = { _id: Random.id() }
    repo.add('foo', item)
    expect(repo.get()).to.equal(undefined)
    expect(repo.has(Random.id())).to.equal(false)
    expect(repo.has('foo')).to.equal(true)
    expect(repo.get('foo')).to.deep.equal(item)
    expect(repo.all()).to.deep.equal([item])

    expect(() => repo.add('foo', {})).to.throw('Item "foo" already exists')
  })
})

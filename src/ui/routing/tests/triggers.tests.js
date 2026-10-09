/* eslint-env mocha */
import { expect } from 'chai'
import { createTrigger } from '../triggers'
import { Router } from '../Router'
import { stub, restoreAll } from '../../../../tests/helpers.tests'

const exec = (cond, fn) => createTrigger(cond, fn)()

describe(createTrigger.name, function () {
  afterEach(function () {
    restoreAll()
  })
  it('throws on incomplete params', function () {
    const err = 'Match error: Expected function, got undefined'
    expect(() => createTrigger()).to.throw(err)
    expect(() => createTrigger(() => {})).to.throw(err)
    expect(() => createTrigger(undefined, () => {})).to.throw(err)
  })
  it('does not trigger if a given condition is falsy', function () {
    const fn = () => {}
    ;[false, null, undefined, '', 0].forEach(value => {
      const condition = () => value
      expect(exec(condition, fn)).to.equal(false)
    })
  })
  it('triggers if a given condition is truthy', function () {
    stub(Router, 'location', () => '/')
    stub(Router, 'go', path => {
      expect(path).to.equal('%2F')
    })
    const fn = x => x
    ;[true, {}, [], '1', 1, new Date()].forEach(value => {
      const condition = () => value
      expect(exec(condition, fn)).to.equal(true)
    })
  })
})

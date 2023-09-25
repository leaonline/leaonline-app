/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { errorMixin } from '../errorMixin'
import { stub, restoreAll } from '../../../tests/helpers/stubUtils'
import { ServerErrors } from '../../../contexts/errors/ServerErrors'

describe(errorMixin.name, function () {
  afterEach(() => {
    restoreAll()
  })
  it('catches a runtime error and reports if', () => {
    const error = new Error('expected error')
    const name = `methods.${Random.id()}`
    const userId = Random.id()
    const run = function () {
      throw error
    }

    stub(console, 'error', e => expect(e).to.equal(error))
    stub(Meteor, 'defer', fn => fn())
    stub(ServerErrors, 'handle', (options) => {
      expect(options.name).to.equal(name)
      expect(options.isMethod).to.equal(true)
      expect(options.isPublication).to.equal(false)
      expect(options.error).to.equal(error)
      expect(options.userId).to.equal(userId)
    })

    const wrapped = errorMixin({ name, run })
    expect(() => wrapped.run.call({ userId })).to.throw(error)
  })
})

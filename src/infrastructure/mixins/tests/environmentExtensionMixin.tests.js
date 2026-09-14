/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { environmentExtensionMixin } from '../environmentExtensionMixin'

describe(environmentExtensionMixin.name, function () {
  it('returns the options if set to null', function () {
    const options = { env: null }
    const options2 = { env: false }
    expect(environmentExtensionMixin(options)).to.deep.equal(options)
    expect(environmentExtensionMixin(options2)).to.deep.equal(options2)
  })
  it('assigns helper functions to the environment', function () {
    const userId = Random.id()
    const options = {
      name: Random.id(8),
      run: function () {
        expect(this.log).to.be.a('function')
        // preserves original env
        expect(this.userId).to.equal(userId)
      }
    }

    const updated = environmentExtensionMixin(options)
    updated.run.call({ userId })
  })
  it('passes all parameters', function () {
    const testArgs = []
    testArgs.length = 5 + Math.floor(Math.random() * 10)
    testArgs.fill(-99)

    const options = {
      name: Random.id(8),
      run: function (...args) {
        expect(args).to.deep.equal(testArgs)
      }
    }

    const updated = environmentExtensionMixin(options)
    updated.run(...testArgs)
  })
})

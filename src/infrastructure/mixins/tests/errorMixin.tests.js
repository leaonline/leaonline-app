/* eslint-env mocha */
import { Meteor } from 'meteor/meteor'
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { errorMixin } from '../errorMixin'
import { stub, restoreAll } from '../../../tests/helpers/stubUtils'
import { ServerErrors } from '../../../contexts/errors/ServerErrors'
import { expectThrown } from '../../../tests/helpers/expectThrown'

describe(errorMixin.name, function () {
  afterEach(() => {
    restoreAll()
  })
  it('catches a runtime error and reports if', async () => {
    const message = 'expected error'
    const error = new Error(message)
    const name = `methods.${Random.id()}`
    const userId = Random.id()
    const run = async function () {
      throw error
    }

    stub(console, 'error', (m, e) => {
      expect(m).to.equal(`[${name}]:`)
      expect(e.message).to.equal(message)
    })
    stub(Meteor, 'defer', async fn => fn())
    stub(ServerErrors, 'handle', async (options) => {
      expect(options.name).to.equal(name)
      expect(options.isMethod).to.equal(true)
      expect(options.isPublication).to.equal(false)
      expect(options.error).to.equal(error)
      expect(options.userId).to.equal(userId)
    })

    const wrapped = errorMixin({ name, run })
    await expectThrown({
      fn: () => wrapped.run.call({ userId }),
      message
    })
  })
})

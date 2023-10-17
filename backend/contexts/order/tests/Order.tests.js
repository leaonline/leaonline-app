/* eslint-env mocha */
import { expect } from 'chai'
import { coin } from '../../../tests/helpers/coin'
import { Order } from '../Order'
import { Random } from 'meteor/random'
import { testGetMethod, testUpdate } from '../../../tests/helpers/backendMethods'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'
import { setupAndTeardown } from '../../../tests/helpers/setupAndTeardown'

const OrderCollection = initTestCollection(Order)
const createDoc = (options = {}) => {
  return {
    fields: options.fields ?? [Random.id()],
    dimensions: options.dimensions ?? [Random.id()]
  }
}

describe(Order.name, function () {
  setupAndTeardown([OrderCollection])

  describe(Order.init.name, () => {
    it('creates a default doc once', () => {
      const count = n => expect(OrderCollection.find().count()).to.equal(n)
      count(0)
      Order.init()
      count(1)
      Order.init()
      count(1)
      Order.init()
      Order.init()
      Order.init()
      Order.init()
      count(1)
    })
  })

  describe('methods', () => {
    testUpdate(Order, {
      factory: () => {
        const insertDoc = createDoc()
        const updateDoc = coin()
          ? { fields: [Random.id()] }
          : { dimensions: [Random.id()] }
        return { insertDoc, updateDoc }
      },
      expectSync: true
    })
    testGetMethod(Order)
  })
})

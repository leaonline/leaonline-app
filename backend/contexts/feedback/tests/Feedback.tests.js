/* eslint-env mocha */
import { coin } from '../../../tests/helpers/coin'
import { Feedback } from '../Feedback'
import { testGetAllMethod, testGetMethod, testInsert, testUpdate } from '../../../tests/helpers/backendMethods'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'
import { setupAndTeardown } from '../../../tests/helpers/setupAndTeardown'

const FeedbackCollection = initTestCollection(Feedback)
const createMockDoc = (options = {}) => {
  return {
    threshold: options.threshold ?? 0.5,
    phrases: options.phrases ?? ['foo', 'bar']
  }
}

describe(Feedback.name, function () {
  setupAndTeardown([FeedbackCollection])

  describe('methods', () => {
    testInsert(Feedback, {
      factory: createMockDoc,
      expectSync: true
    })
    testUpdate(Feedback, {
      factory: () => {
        const insertDoc = createMockDoc()
        const updateDoc = coin()
          ? { phrases: ['bar', 'baz'] }
          : { threshold: 0.1 }
        return { insertDoc, updateDoc }
      },
      expectSync: true
    })
    testGetMethod(Feedback)
    testGetAllMethod(Feedback, {
      factory: createMockDoc
    })
  })
})

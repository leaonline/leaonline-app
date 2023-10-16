/* eslint-env mocha */
import { coin } from '../../../tests/helpers/coin'
import { Feedback } from '../Feedback'
import { testGetAllMethod, testGetMethod, testInsert, testUpdate } from '../../../tests/helpers/backendMethods'
import { restoreCollections, stubCollection } from '../../../tests/helpers/stubCollection'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'

const FeedbackCollection = initTestCollection(Feedback)
const createDoc = (options = {}) => {
  return {
    threshold: options.threshold ?? 0.5,
    phrases: options.phrases ?? ['foo', 'bar']
  }
}

describe(Feedback.name, function () {
  before(() => {
    stubCollection([FeedbackCollection])
  })
  after(() => {
    restoreCollections()
  })
  afterEach(() => {
    FeedbackCollection.remove({})
  })
  describe('methods', () => {
    testInsert(Feedback, {
      factory: createDoc,
      expectSync: true
    })
    testUpdate(Feedback, {
      factory: () => {
        const insertDoc = createDoc()
        const updateDoc = coin()
          ? { phrases: ['bar', 'baz'] }
          : { threshold: 0.1 }
        return { insertDoc, updateDoc }
      },
      expectSync: true
    })
    testGetMethod(Feedback)
    testGetAllMethod(Feedback, {
      factory: createDoc
    })
  })
})
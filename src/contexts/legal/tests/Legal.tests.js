/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { Legal } from '../Legal'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'
import { testGetMethod, testUpdate } from '../../../tests/helpers/backendMethods'
import { setupAndTeardown } from '../../../tests/helpers/setupAndTeardown'
import { forEachAsync } from '../../../infrastructure/async/forEachAsync'

const LegalCollection = initTestCollection(Legal)
const createMockDoc = () => ({
  imprint: Random.id(),
  privacy: Random.id(),
  terms: Random.id(),
  contact: Random.id()
})

describe(Legal.name, function () {
  setupAndTeardown([LegalCollection])

  describe('methods', function () {
    testGetMethod(Legal, ({ run }) => {
      const validNames = ['imprint', 'privacy', 'terms', 'contact']
      const invalidNames = ['imprint2', '__proto__']
      const emptyNameArgs = [undefined, {}, { name: undefined }, { name: null }, { name: false }, { name: '' }]
      const env = {}

      it('returns nothing if no doc exists', async () => {
        const test = async name => {
          const doc = await run.call(env, { name })
          expect(doc).to.equal(undefined)
        }
        await forEachAsync(validNames, test)
        await forEachAsync(invalidNames, test)
        await forEachAsync(emptyNameArgs, test)
      })

      it('returns the doc on no name', async () => {
        const docId = await LegalCollection.insertAsync(createMockDoc())
        const doc = await LegalCollection.findOneAsync(docId)

        await forEachAsync(emptyNameArgs, async arg => {
          const current = await run.call(env, arg)
          expect(current).to.deep.equal(doc)
        })
      })

      it('returns only a specific text if name is given', async () => {
        const docId = await LegalCollection.insertAsync(createMockDoc())
        const doc = await LegalCollection.findOneAsync(docId)

        await forEachAsync(validNames, async name => {
          const text = await run.call(env, { name })
          expect(text).to.be.a('string')
          expect(text).to.equal(doc[name])
        })

        await forEachAsync(invalidNames, async name => {
          const text = await run.call(env, { name })
          expect(text).to.equal(undefined)
        })
      })
    })
    testUpdate(Legal, {
      expectSync: true,
      factory: () => {
        return {
          insertDoc: createMockDoc(),
          updateDoc: createMockDoc()
        }
      }
    })
  })
})

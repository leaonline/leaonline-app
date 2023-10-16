/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { Legal } from '../Legal'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'
import { testGetMethod, testUpdate } from '../../../tests/helpers/backendMethods'
import { setupAndTeardown } from '../../../tests/helpers/setupAndTeardown'

const LegalCollection = initTestCollection(Legal)
const createDoc = () => ({
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
      const emptyNameArgs = [undefined, {}, { name: undefined }, { name: null} , { name: false }, { name: ''}]
      it('returns nothing if no doc exists', () => {
        const test = name => {
          const doc = run({ name })
          expect(doc).to.equal(undefined)
        }
        validNames.forEach(test)
        invalidNames.forEach(test)
        emptyNameArgs.forEach(test)
      })

      it('returns the doc on no name', () => {
        const docId = LegalCollection.insert(createDoc())
        const doc = LegalCollection.findOne(docId)

        emptyNameArgs.forEach(arg => {
          const current = run(arg)
          expect(current).to.deep.equal(doc)
        })
      })

      it('returns only a specific text if name is given', () => {
        const docId = LegalCollection.insert(createDoc())
        const doc = LegalCollection.findOne(docId)

        validNames.forEach(name => {
          const text = run({ name })
          expect(text).to.be.a('string')
          expect(text).to.equal(doc[name])
        })

        invalidNames.forEach(name => {
          const text = run({ name })
          expect(text).to.equal(undefined)
        })
      })
    })
    testUpdate(Legal, {
      expectSync: true,
      factory: () => {
        return {
          insertDoc: createDoc(),
          updateDoc: createDoc()
        }
      }
    })
  })
})
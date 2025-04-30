/* eslint-env mocha */
import { Random } from 'meteor/random'
import { setupAndTeardown } from '../../../tests/helpers/setupAndTeardown'
import { UnitSetAppraisal } from '../UnitSetAppraisal'
import { Field } from '../../content/Field'
import { Dimension } from '../../content/Dimension'
import { UnitSet } from '../../content/UnitSet'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'
import { testGetAllMethod } from '../../../tests/helpers/backendMethods'
import { DocumentFactories, SelectorFactories } from '../../../tests/helpers/Factories'
import { expectThrown } from '../../../tests/helpers/expectThrown'
import { expect } from 'chai'

const UnitSetAppraisalCollection = initTestCollection(UnitSetAppraisal)
const FieldCollection = initTestCollection(Field)
const DimensionCollection = initTestCollection(Dimension)
const UnitSetCollection = initTestCollection(UnitSet)
const createMockDoc = ({ fieldId, dimensionId, unitSetId }) => {
  return {
    userId: Random.id(),
    fieldId: fieldId ?? Random.id(),
    dimensionId: dimensionId ?? Random.id(),
    unitSetId: unitSetId ?? Random.id(),
    response: 3,
    createdAt: new Date(),
    stage: 11
  }
}

describe(UnitSetAppraisal.name, () => {
  setupAndTeardown([
    UnitSetAppraisalCollection,
    FieldCollection,
    DimensionCollection,
    UnitSetCollection
  ])
  describe('methods', () => {
    describe(UnitSetAppraisal.methods.send.name, () => {
      const run = UnitSetAppraisal.methods.send.run

      it('throws if the unit set does not exist', async () => {
        const unitSetId = Random.id()
        await expectThrown({
          fn: () => run.call({}, { unitSetId }),
          name: 'errors.docNotFound'
        })
      })
      it('adds a new appraisal', async () => {
        const field = Random.id()
        const dimension = Random.id()
        const userId = Random.id()
        const response = '3'
        const unitSetId = await UnitSetCollection.insertAsync({ field, dimension })
        const appraisalId = await run.call({ userId }, { unitSetId, response })
        expect(appraisalId).to.be.a('string')

        const doc = await UnitSetAppraisalCollection.findOneAsync(appraisalId)
        expect(doc).to.be.a('object')
        const { createdAt, ...appraisalDoc } = doc
        expect(createdAt).to.be.instanceof(Date)
        expect(appraisalDoc).to.deep.equal({
          _id: appraisalId,
          userId,
          fieldId: field,
          dimensionId: dimension,
          unitSetId,
          response
        })
      })
    })

    testGetAllMethod(UnitSetAppraisal, {
      factory: async withDeps => {
        const fieldId = withDeps ? (await FieldCollection.findOneAsync())._id : Random.id()
        const dimensionId = withDeps ? (await DimensionCollection.findOneAsync())._id : Random.id()
        const unitSetId = withDeps ? (await UnitSetCollection.findOneAsync())._id : Random.id()
        return createMockDoc({ fieldId, dimensionId, unitSetId })
      },
      dependencies: {
        [Field.name]: {
          factory: DocumentFactories.get(Field.name),
          selector: SelectorFactories.idSelector('fieldId')
        },
        [Dimension.name]: {
          factory: DocumentFactories.get(Dimension.name),
          selector: SelectorFactories.idSelector('dimensionId')
        },
        [UnitSet.name]: {
          factory: DocumentFactories.get(UnitSet.name),
          selector: SelectorFactories.idSelector('unitSetId')
        }
      }
    })
  })
})

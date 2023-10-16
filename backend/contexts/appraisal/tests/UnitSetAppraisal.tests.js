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

const UnitSetAppraisalCollection = initTestCollection(UnitSetAppraisal)
const FieldCollection = initTestCollection(Field)
const DimensionCollection = initTestCollection(Dimension)
const UnitSetCollection = initTestCollection(UnitSet)
const createDoc = ({ fieldId, dimensionId, unitSetId }) => {
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
      it('is not impl')
    })
    testGetAllMethod(UnitSetAppraisal, {
      factory: withDeps => {
        const fieldId = withDeps ? FieldCollection.findOne()._id : Random.id()
        const dimensionId = withDeps ? DimensionCollection.findOne()._id : Random.id()
        const unitSetId = withDeps ? UnitSetCollection.findOne()._id : Random.id()
        return createDoc({ fieldId, dimensionId, unitSetId })
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
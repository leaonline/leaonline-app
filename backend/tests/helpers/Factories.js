import { Random } from 'meteor/random'
import { Field } from '../../contexts/content/Field'
import { Dimension } from '../../contexts/content/Dimension'
import { Unit } from '../../contexts/content/Unit'
import { UnitSet } from '../../contexts/content/UnitSet'
import { createIdSet } from '../../api/utils/createIdSet'

export const DocumentFactories = {}

const docFactories = new Map()
docFactories.set(Field.name, () => ({ title: Random.id(), shortCode: 'fo' }))
docFactories.set(Dimension.name, () => ({
  title: Random.id(),
  icon: Random.id(4),
  colorType: 1,
  shortCode: 's',
  shortNum: 1
}))
docFactories.set(Unit.name, () => ({ title: Random.id(), pages: [] }))
docFactories.set(UnitSet.name, () => ({ title: Random.id(), units: [Random.id()] }))

DocumentFactories.get = name => docFactories.get(name)

export const SelectorFactories = {}

SelectorFactories.idSelector = (...fieldNames) => ({ docs }) => {
  const ids = [...createIdSet(docs, fieldNames)]
  return { _id: { $in: ids }}
}

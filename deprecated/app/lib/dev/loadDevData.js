import { callMeteor } from '../meteor/call'
import { Config } from '../env/Config'
import { Dimension } from '../contexts/Dimension'
import { getDimensionColor } from '../screens/unit/getDimensionColor'
import { Field } from '../contexts/Field'

/**
 * Development data makes all units available.
 *
 * The following structure is provided:
 *
 * fields: [string]
 * unitSetIds: [string]
 * units: [object]
 *
 * @return {Promise<*>}
 */
export const loadDevData = async () => {
  const dimensions = new Map()
  Dimension.collection().find().forEach(doc => {
    const numStr = doc.shortNum.toString()
    dimensions.set(numStr, doc)
  })
  const fields = new Map()
  Field.collection().find().forEach(doc => {
    const { shortCode } = doc
    fields.set(shortCode, doc)
  })
  const data = await callMeteor({
    name: Config.methods.getDevData,
    args: {}
  })

  const unitSetCodes = new Map()

  const withDimension = unitDoc => {
    const [field, unitSetShortCode] = unitDoc.shortCode.split('_')

    if (!unitSetCodes.has(field)) {
      unitSetCodes.set(field, new Set())
    }
    unitSetCodes.get(field).add(unitSetShortCode)

    const num = unitSetShortCode.charAt(0)
    unitDoc.dimension = dimensions.get(num)
    unitDoc.color = getDimensionColor(unitDoc.dimension)
    unitDoc.fieldIcon = fields.get(field)?.icon
    return unitDoc
  }
  data.units = data.units
    .filter(undefinedSets)
    .map(withDimension)
    .sort(alphabetically)

  data.dimensions = [...dimensions.values()]
  data.fields = [...fields.keys()]
  data.unitSetCodes = unitSetCodes

  return data
}

const undefinedSets = doc => !!doc.shortCode
const alphabetically = (a, b) => a.shortCode.localeCompare(b.shortCode)

import { Dimension } from '../../contexts/Dimension'
import { ColorTypeMap } from '../../constants/ColorTypeMap'
import Colors from '../../constants/Colors'

/**
 * Gets a color by dimension id. Falls back to primary if no dimension doc
 * is found or no Color is defined for the linked colorType property.
 * @param dimensionId {string}
 * @return {string}
 */
export const getDimensionColor = dimensionId => {
  const dimensionDoc = Dimension.collection().findOne(dimensionId)

  if (!dimensionDoc) {
    return Colors.primary
  }

  const { colorType } = dimensionDoc

  if (!ColorTypeMap.has(colorType)) {
    return Colors.primary
  }

  return ColorTypeMap.get(colorType)
}

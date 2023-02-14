import { Dimension } from '../../contexts/Dimension'
import { ColorTypeMap } from '../../constants/ColorTypeMap'
import { Colors } from '../../constants/Colors'

/**
 * Gets a color by dimension id. Falls back to primary if no dimension doc
 * is found or no Color is defined for the linked colorType property.
 * @param dimension {string|object} either an _id string or the dimension document
 * @return {string} a valid hex color code
 */
export const getDimensionColor = (dimension) => {
  const dimensionDoc = typeof dimension === 'object'
    ? dimension
    : Dimension.collection().findOne(dimension)

  if (!dimensionDoc) {
    return Colors.primary
  }

  const { colorType } = dimensionDoc

  if (!ColorTypeMap.has(colorType)) {
    return Colors.primary
  }

  return ColorTypeMap.get(colorType)
}

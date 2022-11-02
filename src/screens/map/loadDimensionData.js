import { Dimension } from '../../contexts/Dimension'

export const loadDimensionData = async (stage) => {
  if (!stage?.unitSets?.length) { return null }

  stage.unitSets.forEach(unitSet => {
    unitSet.dimension = Dimension.collection().findOne(unitSet.dimension)
  })

  return stage
}

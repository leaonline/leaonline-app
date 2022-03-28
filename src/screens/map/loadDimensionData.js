import { AppState } from '../../state/AppState'
import { Dimension } from '../../contexts/Dimension'

export const loadDimensionData = async () => {
  const stage = await AppState.stage()

  if (!stage?.unitSets?.length) { return null }
  stage.unitSets.forEach(unitSet => {
    unitSet.dimension = Dimension.collection().findOne(unitSet.dimension)
  })

  return stage
}

import { AppState } from '../../state/AppState'
import { getDimensionColor } from '../unit/getDimensionColor'

export const loadCompleteData = async () => {
  const count = await AppState.complete(undefined)
  const unitSet = await AppState.unitSet(undefined)
  const dimensionColor = unitSet && getDimensionColor(unitSet.dimension)

  return { count, unitSet, dimensionColor }
}

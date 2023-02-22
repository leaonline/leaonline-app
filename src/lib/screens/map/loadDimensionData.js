import { Dimension } from '../../contexts/Dimension'
import nextFrame from 'next-frame'

export const loadDimensionData = async (unitSets) => {
  if (!unitSets?.length) { return null }

  for (const unitSet of unitSets) {
    await nextFrame()
    unitSet.dimension = Dimension.collection().findOne(unitSet.dimension)
    unitSet.progressPercent = Math.round((unitSet.userProgress ?? 0) / (unitSet.progress ?? 1) * 100)
  }

  return { unitSets }
}

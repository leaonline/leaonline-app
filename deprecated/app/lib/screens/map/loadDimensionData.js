import { Dimension } from '../../contexts/Dimension'
import nextFrame from 'next-frame'
import { Order } from '../../contexts/Order'

export const loadDimensionData = async (unitSets) => {
  if (!unitSets?.length) { return null }

  for (const unitSet of unitSets) {
    await nextFrame()
    unitSet.dimension = Dimension.collection().findOne(unitSet.dimension)
    unitSet.progressPercent = Math.round((unitSet.userProgress ?? 0) / (unitSet.progress ?? 1) * 100)
  }

  const order = Order.collection().findOne()

  if (order) {
    unitSets.sort((a, b) => {
      const indexA = order.dimensions.indexOf(a.dimension)
      const indexB = order.dimensions.indexOf(b.dimension)
      return indexA - indexB
    })
  }

  return { unitSets }
}

import { getDimensionColor } from '../unit/getDimensionColor'

export const loadCompleteData = async ({ competencies, unitSet }) => {
  const dimensionColor = unitSet && getDimensionColor(unitSet.dimension)

  return { competencies, unitSet, dimensionColor }
}
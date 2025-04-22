import { getDimensionColor } from '../unit/getDimensionColor'
import { Feedback } from '../../contexts/Feedback'

export const loadCompleteData = async ({ competencies, unitSet }) => {
  const dimensionColor = unitSet && getDimensionColor(unitSet.dimension)
  const feedbackDocs = Feedback
    .collection()
    .find()
    .fetch()
    .sort((a, b) => a.threshold - b.threshold)
  return { competencies, unitSet, dimensionColor, feedbackDocs }
}

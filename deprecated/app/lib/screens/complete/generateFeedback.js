import { Feedback } from '../../contexts/Feedback'
import { randomArrayElement } from '../../utils/array/randomArrayElement'

export const generateFeedback = ({ threshold = 0, feedbackDocs = [] }) => {
  const percent = Math.round(100 * threshold)
  const filteredDocs = feedbackDocs.filter(doc => doc.threshold <= threshold)
  let feedback = filteredDocs[filteredDocs.length - 1]

  // fallback 1: if no feedback doc has been found for the
  // given threshold we just take the first in the list
  if (!feedback) {
    feedback = feedbackDocs[0]
  }

  if (!feedback) {
    feedback = Feedback.getFallbackDoc()
  }

  const phrase = randomArrayElement(feedback.phrases)
  const isFallback = !!feedback.isFallback

  return { percent, phrase, isFallback }
}

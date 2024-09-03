import { generateFeedback } from '../../../lib/screens/complete/generateFeedback'
import { Feedback } from '../../../lib/contexts/Feedback'

const fallback = Feedback.getFallbackDoc()

describe(generateFeedback.name, function () {
  it('returns a fallback doc if nothing is found', () => {
    const data = [{}, { threshold: 0 }, { feedbackDocs: [] }, { threshold: 0, feedbackDocs: [] }]
    data.forEach(({ threshold, feedbackDocs }) => {
      const feedback = generateFeedback({ threshold, feedbackDocs })
      expect(feedback.percent).toBe(0)
      expect(feedback.isFallback).toBe(true)
      expect(feedback.phrase).toBe(fallback.phrases[0])
    })
  })
  it('falls back to the first doc in list, if no doc is suitable for the threshold', () => {
    const feedbackDocs = [{ threshold: 0.2, phrases: ['foo'] }, { threshold: 0.5, phrases: ['bar'] }]
    const data = [{}, { threshold: 0 }, { threshold: 0.1 }]

    data.forEach(({ threshold }) => {
      const feedback = generateFeedback({ threshold, feedbackDocs })
      expect(feedback.percent).toBe(Math.round((threshold ?? 0) * 100))
      expect(feedback.phrase).toBe('foo')
      expect(feedback.isFallback).toBe(false)
    })
  })

  it('returns the appropriate feedback for the current threshold', () => {
    const feedbackDocs = [
      { threshold: 0.2, phrases: ['foo', 'bar'] },
      { threshold: 0.5, phrases: ['baz', 'moo'] }
    ]

    for (let i = 0.2; i < 0.5; i += 0.01) {
      const feedback = generateFeedback({ threshold: i, feedbackDocs })
      expect(feedback.percent).toEqual(Math.round(i * 100))
      expect(feedbackDocs[0].phrases.includes(feedback.phrase)).toBe(true)
      expect(feedback.isFallback).toBe(false)
    }

    for (let i = 0.5; i <= 1; i += 0.01) {
      const feedback = generateFeedback({ threshold: i, feedbackDocs })
      expect(feedback.percent).toEqual(Math.round(i * 100))
      expect(feedbackDocs[1].phrases.includes(feedback.phrase)).toBe(true)
      expect(feedback.isFallback).toBe(false)
    }
  })
})

import { ScoringTypes } from './ScoringTypes'
import { UndefinedScore } from './UndefinedScore'

export const Scoring = {
  name: 'scoring'
}

Scoring.UNDEFINED = UndefinedScore
Scoring.types = { ...ScoringTypes }

const scoreFns = new Map()
const key = (type, subtype) => `${type}-${subtype}`

Scoring.register = ({ type, subtype, scoreFn }) => {
  scoreFns.set(key(type, subtype), scoreFn)
}

Scoring.score = async (itemDoc, responseDoc) => {
  const { type, subtype } = itemDoc
  const fn = scoreFns.get(key(type, subtype))

  if (!fn) {
    throw new Error(`Expected scoring fn by ${type} / ${subtype}`)
  }

  return fn(itemDoc, responseDoc)
}

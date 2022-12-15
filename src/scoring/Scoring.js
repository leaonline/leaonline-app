import { ScoringTypes } from './ScoringTypes'
import { UndefinedScore } from './UndefinedScore'
import { Log } from '../infrastructure/Log'

export const Scoring = {
  name: 'scoring'
}

const log = Log.create(Scoring.name)

Scoring.UNDEFINED = UndefinedScore
Scoring.types = { ...ScoringTypes }

const scoreFns = new Map()
const key = (type, subtype) => `${type}-${subtype}`

Scoring.register = ({ type, subtype, scoreFn }) => {
  log('register', type, subtype)
  scoreFns.set(key(type, subtype), scoreFn)
}

Scoring.score = async (itemDoc = {}, responseDoc) => {
  log('score', itemDoc.type, itemDoc.subtype)
  const { type, subtype } = itemDoc
  const fn = scoreFns.get(key(type, subtype))

  if (!fn) {
    throw new Error(`Expected scoring fn by ${type} / ${subtype}`)
  }

  return fn(itemDoc, responseDoc)
}

Scoring.validateItemDoc = itemDoc => {
  if (typeof itemDoc !== 'object') {
    throw new Error(`Expected itemDoc, got`)
  }

  if (!itemDoc.scoring?.length) {
    throw new Error(`Expected scoring definitions on itemDoc.`)
  }
}

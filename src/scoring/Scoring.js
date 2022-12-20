import { ScoringTypes } from './ScoringTypes'
import { UndefinedScore } from './UndefinedScore'
import { Log } from '../infrastructure/Log'
import { check } from '../schema/check'

export const Scoring = {
  name: 'scoring'
}

const log = Log.create(Scoring.name)

Scoring.UNDEFINED = UndefinedScore
Scoring.types = { ...ScoringTypes }

const scoreFns = new Map()
const key = (type, subtype) => `${type}-${subtype}`

/**
 * Registers a scoring handler for a given item type/subtype.
 * @param options {object}
 * @param options.type {string}
 * @param options.subtype {string}
 * @param options.scoreFn {function}
 */
Scoring.register = (options) => {
  log('register', options)
  check(options, {
    type: String,
    subtype: String,
    scoreFn: Function
  })
  const { type, subtype, scoreFn } = options
  scoreFns.set(key(type, subtype), scoreFn)
}

/**
 * Scores a given response according to the registered scoring handler.
 *
 * @param itemDoc
 * @param responseDoc
 * @throws {Error} if scoring handler is not found by given item type
 * @returns {Promise<*>}
 */
Scoring.score = async (itemDoc = {}, responseDoc) => {
  Scoring.validateItemDoc(itemDoc)
  Scoring.validateResponseDoc(responseDoc)

  log('score', itemDoc.type, itemDoc.subtype)
  const { type, subtype } = itemDoc
  const fn = scoreFns.get(key(type, subtype))

  if (typeof fn !== 'function') {
    throw new Error(`Expected scoring fn by ${type} / ${subtype}`)
  }
  return fn(itemDoc, responseDoc)
}

Scoring.validateItemDoc = itemDoc => {
  const type = typeof itemDoc

  if (type !== 'object') {
    throw new Error(`Expected itemDoc, got ${type}`)
  }

  if (!itemDoc.scoring?.length) {
    throw new Error('Expected itemDoc to have property "scoring"')
  }
}

Scoring.validateResponseDoc = responseDoc => {
  const type = typeof responseDoc

  if (type !== 'object') {
    throw new Error(`Expected responseDoc, got ${type}`)
  }

  if (!Array.isArray(responseDoc.responses)) {
    throw new Error('Expected responses to have Array-like property "responses"')
  }
}
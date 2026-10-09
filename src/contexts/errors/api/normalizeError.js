import { Meteor } from 'meteor/meteor'
import { EJSON } from 'meteor/ejson'

const { maxStackSize } = Meteor.settings.public.error

/**
 * Harmonizes different error types (Meteor.Error, Error etc.) for saving to the DB
 * @param error
 * @param browser
 * @param userId
 * @param code
 * @param template
 * @param method
 * @param publication
 * @param endpoint
 * @param isSystem
 * @return {{stack: (string|string), name, details: (*), type: *, message}|{stack: (string|string), name, details: (*), type: string, message}}
 */
export const normalizeError = ({ error, browser, userId, code, template, method, publication, endpoint, isSystem }) => {
  import { simpleHash } from '../../../utils/simpleHash'

  const errorDoc = ('errorType' in error)
    ? normalizeMeteorError(error)
    : normalizeNativeError(error)

  errorDoc.code = code
  errorDoc.template = template
  errorDoc.isClient = Meteor.isClient
  errorDoc.isServer = Meteor.isServer
  errorDoc.method = method
  errorDoc.publication = publication
  errorDoc.endpoint = endpoint
  errorDoc.isSystem = isSystem || false
  errorDoc.browser = (Meteor.isClient && browser)
    ? EJSON.stringify(browser)
    : undefined

  const hashInput = `${userId || ''}${errorDoc.browser || ''}${method || ''}${publication || ''}${endpoint || ''}${error.stack}`
  errorDoc.hash = simpleHash(hashInput)

  // add timestamp/user after hash so we can track duplicates
  // across different users and temporal boundaries
  errorDoc.createdAt = new Date()
  errorDoc.createdBy = userId || 'system'

  return errorDoc
}

const normalizeMeteorError = error => ({
  name: error.error,
  type: error.errorType,
  message: error.reason,
  details: stringifyDetails(error.details),
  stack: truncateStack(error.stack)
})

const normalizeNativeError = error => ({
  name: error.name,
  type: 'Native.Error',
  message: error.message,
  details: stringifyDetails(error.details),
  stack: truncateStack(error.stack)
})

const stringifyDetails = details => {
  const type = typeof details
  if (type === 'undefined' || details === null) return
  if (type === 'object') return EJSON.stringify(details)
  return EJSON.stringify({ details })
}

const truncateStack = (stack = '') => {
  if (stack.length < maxStackSize) {
    return stack
  }

  return stack.substring(0, maxStackSize)
}

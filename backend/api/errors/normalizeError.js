import { Meteor } from 'meteor/meteor'
import { EJSON } from 'meteor/ejson'

export const normalizeError = ({ error, browser, userId, code, method, publication, endpoint, isSystem }) => {
  const errorDoc = ('errorType' in error)
    ? normalizeMeteorError(error)
    : normalizeNativeError(error)

  errorDoc.code = code
  errorDoc.isServer = Meteor.isServer
  errorDoc.method = method
  errorDoc.publication = publication
  errorDoc.isSystem = isSystem || false

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
  return stack
}

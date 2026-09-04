import { Meteor } from 'meteor/meteor'

export const normalizeError = ({ error, userId, stackLength = 3 }) => {
  const isMeteorError = ('errorType' in error || error instanceof Meteor.Error)
  const errorDoc = {
    type: isMeteorError ? error.errorType : 'native',
    name: error.name,
    message: error.message,
    title: error.error,
    reason: error.reason,
    details: error.details
  }

  errorDoc.createdAt = new Date()
  errorDoc.userId = userId
  errorDoc.stack = error.stack && stripStack(error.stack, stackLength)

  return errorDoc
}

const stripStack = (stack = '', length) => {
  const split = stack.split('\n')
  split.length = length
  return split.join('\n')
}

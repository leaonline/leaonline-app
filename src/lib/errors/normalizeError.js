export const normalizeError = ({ error, userId, stack, stackLength = 3 }) => {
  const errorDoc = {
    type: error.errorType || 'native',
    name: error.name,
    message: error.message,
    title: error.error,
    reason: error.reason,
    details: error.details
  }

  errorDoc.createdAt = new Date()
  errorDoc.userId = userId

  const stackTrace = stack || error.stack

  if (stackTrace) {
    errorDoc.stack = stripStack(stackTrace, stackLength)
  }

  return errorDoc
}

const stripStack = (stack = '', length) => {
  const split = stack.split('\n').filter(line => line.trim().length > 0)
  split.length = length
  return split.join('\n')
}

import { Meteor } from 'meteor/meteor'
import { normalizeError } from '../../api/errors/normalizeError'
import { notifyUsersAboutError } from '../../api/errors/notifyUsersAboutError'

export const errorMixin = options => {
  const { name } = options
  const isMethod = name.includes('methods')
  const isPublication = name.includes('publications')
  const runFct = options.run

  options.run = function run (...args) {
    const { userId } = this
    try {
      return runFct.call(this, ...args)
    }
    catch (runtimeError) {
      console.error(runtimeError)
      Meteor.defer(() => sendError({
        name, isMethod, error: runtimeError, userId, isPublication
      }))

      // finally throw original runtime error
      throw runtimeError
    }
  }

  return options
}

const sendError = ({ name, isMethod, error, userId, isPublication }) => {
  const normalizedError = normalizeError({
    error,
    userId,
    method: isMethod ? name : undefined,
    publication: isPublication ? name : undefined
  })

  notifyUsersAboutError(normalizedError)
}

import { Meteor } from 'meteor/meteor'
import { ServerErrors } from '../../contexts/errors/ServerErrors'

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
      Meteor.defer(() => {
        ServerErrors.handle({
          name, isMethod, error: runtimeError, userId, isPublication
        })
      })

      // finally throw original runtime error
      throw runtimeError
    }
  }

  return options
}

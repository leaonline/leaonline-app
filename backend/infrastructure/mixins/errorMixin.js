import { Meteor } from 'meteor/meteor'
import { ServerErrors } from '../../contexts/errors/ServerErrors'
import { ClientConnection } from '../../contexts/connection/ClientConnection'
import { Random } from 'meteor/random'

export const errorMixin = options => {
  const { name } = options
  const isMethod = name.includes('methods')
  const isPublication = name.includes('publications')
  const runFct = options.run

  options.run = function run (...args) {
    const { userId } = this
    try {
      return runFct.call(this, ...args)
    } catch (runtimeError) {
      // we create a tag in order to later identify errors within logs
      const tag = runtimeError.tag || Random.id()
      runtimeError.tag = runtimeError.tag || tag
      console.error(`[${options.name}]:`, runtimeError)
      Meteor.defer(() => {
        const connection = ClientConnection.collection().findOne({ id: this.connection?.id })
        ServerErrors.handle({
          name, tag, isMethod, error: runtimeError, userId, isPublication, connection
        })
      })

      // finally throw original runtime error
      throw runtimeError
    }
  }

  return options
}

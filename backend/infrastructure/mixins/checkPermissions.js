import { Meteor } from 'meteor/meteor'
import { getUsersCollection } from '../../api/collections/getUsersCollection'

export const checkPermissions = function (options) {
  const { isPublic, backend } = options

  if (isPublic) {
    return options
  }

  const runFct = options.run
  options.run = function run (...args) {
    let userId = this.userId

    if (!userId) {
      const user = Meteor.user()
      userId = user?._id
    }

    if (!userId) {
      throw new Meteor.Error('errors.permissionDenied', 'errors.userNotExists', { userId })
    }

    if (backend) {
      const user = getUsersCollection().findOne(userId)
      if (!user?.services?.lea) {
        throw new Meteor.Error('errors.permissionDenied', 'errors.backendOnly', { userId })
      }
    }

    // // this is a soft-prevention for clients that want to connect
    // // without the app, however it's not a real "protection"
    // const appToken = args[0]?.appToken
    // console.debug('check permission:', options.name, appToken)
    //
    // if (!backend && !appTokenIsValid(appToken)) {
    //   const error = new Meteor.Error(
    //     'errors.permissionDenied',
    //     'errors.invalidAppToken',
    //     { userId, appToken }
    //   )
    //   // TODO - once we have no installation of the old version we need to throw here
    //   throw error
    // }
    //
    // // make sure we won't break validation
    // delete args[0].appToken

    return runFct.call(this, ...args)
  }

  return options
}

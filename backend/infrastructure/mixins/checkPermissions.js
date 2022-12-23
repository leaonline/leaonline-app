import { Meteor } from 'meteor/meteor'

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
      throw new Meteor.Error('errors.permissionDenied', 'errors.userNotExists', userId)
    }

    if (backend) {
      const user = Meteor.users.findOne(userId)
      if (!user?.services?.lea) {
        throw new Meteor.Error('errors.permissionDenied', 'errors.backendOnly', userId)
      }
    }

    return runFct.call(this, ...args)
  }

  return options
}

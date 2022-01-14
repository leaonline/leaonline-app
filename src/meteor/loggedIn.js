import Meteor from '@meteorrn/core'

export const loggedIn = () => Meteor.user() || Meteor.userId()

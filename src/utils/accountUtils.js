import { Meteor } from 'meteor/meteor'

export const loggedIn = () => Meteor.userId() && Meteor.user()
export const loggedOut = () => !loggedIn()

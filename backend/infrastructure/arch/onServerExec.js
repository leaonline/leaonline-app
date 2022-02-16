import { Meteor } from 'meteor/meteor'

export const onServerExec = fn => Meteor.isServer ? fn() : undefined

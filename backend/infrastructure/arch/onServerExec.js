import { Meteor } from 'meteor/meteor'

/**
 * Executes function only when in Server environment.
 * @param fn {function} the function to execute
 * @return {*} returns whether the function returns
 * @module
 */
export const onServerExec = fn => Meteor.isServer ? fn() : undefined

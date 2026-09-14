import { Meteor } from 'meteor/meteor'

/**
 * Executes function only when in Server environment and returns its return value.
 * @param fn {function} the function to execute
 * @return {*|undefined} returns whether the function returns or undefined on client
 * @module onServerExec
 */
export const onServerExec = fn => Meteor.isServer ? fn() : undefined

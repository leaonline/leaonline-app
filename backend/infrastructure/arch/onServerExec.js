export const onServerExec = fn => Meteor.isServer ? fn() : undefined

import Meteor from '@meteorrn/core'

// this adds RegExp as type to EJSON, so we can load
// RegExp types from the server via (E)JSON and they get automatically
// converted to valid RegExp instances
Meteor.EJSON.addType('RegExp', value => new RegExp(value.regex, value.options))

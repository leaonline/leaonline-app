import { Meteor } from 'meteor/meteor'
import { getProperty } from './object/getProperty'

const types = ['log', 'info', 'warn', 'debug', 'error']

export const createLog = ({ name, type = 'info', devOnly } = {}) => {
  if (!types.includes(type)) {
    throw new Error(`Unexpected log type ${type}`)
  }

  if (devOnly && !Meteor.isDevelopment) {
    return () => {}
  }

  const target = getProperty(console, type)
  const infoName = `[${name}]:`
  return (...args) => {
    args.unshift(infoName)
    target.apply(console, args)
    return true
  }
}

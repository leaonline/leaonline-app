/* eslint-disable no-console */
import { Config } from '../env/Config'

export const Log = {}

let logLevel = Config.debug.logLevel

const allLevels = {
  debug: {
    index: 0,
    run: (...args) => {
      if (logLevel > 0) { return }
      console.debug(timestamp(), ...args)
    }
  },
  info: {
    index: 1,
    run: (...args) => {
      if (logLevel > 1) { return }
      console.info(timestamp(), ...args)
    }
  },
  log: {
    index: 2,
    run: (...args) => {
      if (logLevel > 2) { return }
      console.log(timestamp(), ...args)
    }
  },
  warning: {
    index: 3,
    run: (...args) => {
      if (logLevel > 3) { return }
      console.warn(timestamp(), ...args)
    }
  },
  error: {
    index: 4,
    run: (...args) => {
      console.error(timestamp(), ...args)
    }
  }
}

const timestamp = () => {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
}

Log.levels = () => ({ ...allLevels })

Log.setLevel = level => {
  const indices = Object.values(allLevels)

  if (!indices.includes(level)) {
    throw new Error(`Unsupported log level: ${level}`)
  }

  logLevel = level
}

/**
 * Creates a new log type.
 * @param name {string} the namespace for the log
 * @param type {string='log'} the log type name
 * @param force {boolean=} overrides global logLevel
 * @return {(function())|*|(function(...[*]): void)}
 */
Log.create = (name, type = 'log', force) => {
  if (typeof force === 'boolean' && force !== true) {
    return () => {} // noOp on conditionals
  }
  if (!Object.hasOwnProperty.call(allLevels, type)) {
    throw new Error(`Unsupported log type: ${type}`)
  }

  const logName = `${type} [${name}]:`
  const logFn = allLevels[type].run

  if (!logFn) {
    throw new Error(`Unexpected: no log function retrieved for type ${type}`)
  }

  return (...args) => logFn(logName, ...args)
}

Log.debug = (...args) => allLevels.debug.run(...args)

Log.info = (...args) => allLevels.info.run(...args)

Log.log = (...args) => allLevels.log.run(...args)

Log.warn = (...args) => allLevels.warning.run(...args)

Log.error = (...args) => allLevels.error.run(...args)
/* eslint-enable no-console */

import { Config } from '../env/Config'
import { ConsoleLogger } from './log/ConsoleLogger'

export const Log = {}

let logLevel = Config.debug.logLevel
let logTarget = ConsoleLogger

Log.setTarget = (impl) => {
  logTarget = impl
}

const allLevels = {
  debug: {
    index: 0,
    run: (...args) => {
      if (logLevel > 0) { return }
      logTarget.debug(timestamp(), ...args)
    }
  },
  info: {
    index: 1,
    run: (...args) => {
      if (logLevel > 1) { return }
      logTarget.info(timestamp(), ...args)
    }
  },
  log: {
    index: 2,
    run: (...args) => {
      if (logLevel > 2) { return }
      logTarget.log(timestamp(), ...args)
    }
  },
  warning: {
    index: 3,
    run: (...args) => {
      if (logLevel > 3) { return }
      logTarget.warn(timestamp(), ...args)
    }
  },
  error: {
    index: 4,
    run: (...args) => {
      logTarget.error(timestamp(), ...args)
    }
  },
  fatal: {
    index: 5,
    run: (...args) => {
      logTarget.error(timestamp(), ...args)
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
 * @param {string=} [type='log'] the log type name
 * @param force {boolean=} overrides global logLevel
 * @return {function}
 */
Log.create = (name, type = 'log', force) => {
  if (name in Config.debug && !Config.debug.name) {
    return () => {}
  }

  if (typeof force === 'boolean' && force !== true) {
    return () => {} // noOp on conditionals
  }

  if (Config.isTest()) {
    return () => {}
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

Log.fatal = (...args) => allLevels.fatal.run(...args)

Log.print = obj => Log.debug(JSON.stringify(obj, null, 2))

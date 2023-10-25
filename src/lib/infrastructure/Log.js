import { Config } from '../env/Config'
import { ConsoleLogger } from './log/ConsoleLogger'
import { Colors } from '../constants/Colors'

// TODO move to /log
export const Log = {}

Log.name = 'Log'

let logLevel = Config.debug.logLevel
let logTarget = ConsoleLogger
const stack = []

Log.setTarget = (impl) => {
  logTarget = impl
}

Log.stack = async () => [].concat(stack)

Log.color = type => allLevels[type]?.color

const allLevels = {
  debug: {
    index: 0,
    color: Colors.gray,
    run: (...args) => {
      if (logLevel > 0) { return }
      const now = timestamp()
      stack.push(['debug', now].concat(args))
      logTarget.debug(now, ...args)
    }
  },
  info: {
    index: 1,
    color: Colors.info,
    run: (...args) => {
      if (logLevel > 1) { return }
      const now = timestamp()
      stack.push(['info', now].concat(args))
      logTarget.info(now, ...args)
    }
  },
  log: {
    index: 2,
    color: Colors.dark,
    run: (...args) => {
      if (logLevel > 2) { return }
      const now = timestamp()
      stack.push(['log', now].concat(args))
      logTarget.log(now, ...args)
    }
  },
  warning: {
    index: 3,
    color: Colors.warning,
    run: (...args) => {
      if (logLevel > 3) { return }
      const now = timestamp()
      stack.push(['warning', now].concat(args))
      logTarget.warn(timestamp(), ...args)
    }
  },
  error: {
    index: 4,
    color: Colors.danger,
    run: (...args) => {
      if (logLevel > 4) { return }
      const now = timestamp()
      stack.push(['error', now].concat(args))
      logTarget.error(now, ...args)
    }
  },
  fatal: {
    index: 5,
    color: '#ff0000',
    run: (...args) => {
      if (logLevel > 5) { return }
      const now = timestamp()
      stack.push(['fatal', now].concat(args))
      logTarget.fatal
        ? logTarget.fatal(now, ...args)
        : logTarget.error(now, ...args)
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

  const logName = `[${name}]:`
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

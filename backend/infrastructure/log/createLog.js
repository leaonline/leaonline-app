import { Meteor } from 'meteor/meteor'
import { hasProp } from '../../api/utils/hasProp'
import chalk from 'chalk'

const logLevel = Meteor.settings.log.level
const internal = {
  error: {
    level: 0,
    color: s => chalk.red(s),
    run: (...args) => console.error(...args)
  },
  warn: {
    level: 1,
    color: s => chalk.yellow(s),
    run: (...args) => console.warn(...args)
  },
  log: {
    level: 2,
    color: s => chalk.blue(s),
    run: (...args) => console.log(...args)

  },
  info: {
    level: 3,
    color: s => chalk.gray(s),
    run: (...args) => console.info(...args)
  },
  debug: {
    level: 4,
    color: s => chalk.magenta(s),
    run: (...args) => console.debug(...args)
  }
}

/**
 * Creates a log-function for a given log type and with a given name, that is
 * used as prefix. For example name="foo" and type="log" creates a log
 * like:
 *
 * log (path/to/file.js:123:1) [foo]: message
 *
 *
 * @throws {Error} if the log type is not supported
 * @param options {object}
 * @param options.name {string} the prefix to log before the message
 * @param options.type {string} the allowed log type.
 * @return {Function} a logger function or empty no-op function if log-level is
 *  not supported / defined
 */
export const createLog = function ({ name = 'system', type = 'log' } = {}) {
  if (!hasProp(internal, type)) {
    throw new Error(`Unexpected log type ${type}`)
  }

  const logName = `[${name}]:`
  const logType = internal[type]
  const typeName = `${type}`

  // if the log level is not supported, wo return a no-op fn
  if (logType.level > logLevel) {
    return () => {}
  }

  return (...args) => {
    const line = getLine()
    const info = logType.color(`${typeName} ${line}`)
    logType.run(info, logName, ...args)
  }
}

const getLine = () => {
  const stack = new Error().stack
  const lines = stack.split('\n').slice(1)

  for (const line of lines) {
    if (line.match(/^\s*(at eval \(eval)|(eval:)/)) {
      return 'file: "eval"'
    }

    if (!line.match(/(infrastructure\/log\/createLog)|(environmentExtensionMixin)/)) {
      return line.replace(/\s*at\s*[a-zA-Z0-9._-]+\s*/, '').replace(/[()]+/g, '')
    }
  }
}

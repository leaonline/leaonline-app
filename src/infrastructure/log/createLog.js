import { Meteor } from 'meteor/meteor'
import { hasProp } from '../../api/utils/hasProp'
import { isomorph } from 'meteor/leaonline:corelib/utils/arch'

const internal = {
  error: {
    level: 0,
    run: (...args) => console.error(...args)
  },
  warn: {
    level: 1,
    run: (...args) => console.warn(...args)
  },
  log: {
    level: 2,
    run: (...args) => console.log(...args)

  },
  info: {
    level: 3,
    run: (...args) => console.info(...args)
  },
  debug: {
    level: 4,
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
 * @param {boolean} [includeInTests=false] set to true if to include in tests
 * @return {Function} a logger function or empty no-op function if log-level is
 *  not supported / defined
 */
export const createLog = isomorph({
  onServer: () => {
    import chalk from 'chalk'
    const logLevel = Meteor.settings.log.level

    internal.error.color = s => chalk.red(s)
    internal.warn.color = s => chalk.yellow(s)
    internal.log.color = s => chalk.blue(s)
    internal.info.color = s => chalk.gray(s)
    internal.debug.color = s => chalk.magenta(s)

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

    return ({ name = 'system', type = 'log', includeInTests = false } = {}) => {
      if (!hasProp(internal, type)) {
        throw new Error(`Unexpected log type ${type}`)
      }

      const logName = `[${name}]:`
      const logType = internal[type]
      const typeName = `${type}`
      const excludeForTest = Meteor.isTest && !includeInTests

      // if the log level is not supported, wo return a no-op fn
      if (logType.level > logLevel || excludeForTest) {
        return () => {}
      }

      return (...args) => {
        const line = getLine()
        const info = logType.color(`${typeName} ${line}`)
        logType.run(info, logName, ...args)
      }
    }
  },
  onClient: () => {
    const logLevel = Meteor.settings.public.log?.level ?? 2
    return ({ name = 'system', type = 'log', includeInTests = false } = {}) => {
      if (!hasProp(internal, type)) {
        throw new Error(`Unexpected log type ${type}`)
      }

      const logName = `[${name}]:`
      const logType = internal[type]
      const typeName = `${type}`
      const excludeForTest = Meteor.isTest && !includeInTests

      // if the log level is not supported, wo return a no-op fn
      if (logType.level > logLevel || excludeForTest) {
        return () => {}
      }

      return (...args) => {
        logType.run(typeName, logName, ...args)
      }
    }
  }
})

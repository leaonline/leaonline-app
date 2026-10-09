import Meteor from '@meteorrn/core'
import { Config } from '../../env/Config'
import { ConsoleLogger } from './ConsoleLogger'
import { callMeteor } from '../../meteor/call'

const { method, batchSize, separator, level } = Config.log.target

export const RemoteDDPLogger = {
  debug: (...args) => {
    ConsoleLogger.debug(...args)
    queueLog(0, ...args)
  },
  info: (...args) => {
    ConsoleLogger.info(...args)
    queueLog(1, ...args)
  },
  log: (...args) => {
    ConsoleLogger.log(...args)
    queueLog(2, ...args)
  },
  warn: (...args) => {
    ConsoleLogger.warn(...args)
    queueLog(3, ...args)
  },
  error: (...args) => {
    ConsoleLogger.error(...args)
    queueLog(4, ...args)
  },
  fatal: (...args) => {
    ConsoleLogger.fatal(...args)
    queueLog(5, ...args)
  }
}

let queue = []

const queueLog = (currentLevel, type, ...args) => {
  if (currentLevel < level) {
    return
  }

  const str = `${type}${separator}${args.join(separator)}`
  queue.push(str)

  if (Meteor.status().connected && queue.length >= batchSize) {
    const args = [].concat(queue)
    sendLog(args).catch((err) => ConsoleLogger.error(err))
    queue = []
  }
}

const sendLog = (logs) => {
  ConsoleLogger.debug('[RemoteDDPLogger]: send to', method, logs.length)
  return callMeteor({
    name: method,
    args: { logs }
  })
}

import Meteor from '@meteorrn/core'
import { Config } from '../../env/Config'
import { ConsoleLogger } from './ConsoleLogger'
import { callMeteor } from '../../meteor/call'

const { method, batchSize, separator } = Config.log.target

export const RemoteDDPLogger = {
  debug: (...args) => {
    ConsoleLogger.debug(...args)
    queueLog(...args)
  },
  info: (...args) => {
    ConsoleLogger.info(...args)
    queueLog(...args)
  },
  log: (...args) => {
    ConsoleLogger.log(...args)
    queueLog(...args)
  },
  warn: (...args) => {
    ConsoleLogger.warn(...args)
    queueLog(...args)
  },
  error: (...args) => {
    ConsoleLogger.error(...args)
    queueLog(...args)
  },
  fatal: (...args) => {
    ConsoleLogger.fatal(...args)
    queueLog(...args)
  }
}

let queue = []

const queueLog = (type, ...args) => {
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

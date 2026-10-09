/* global fetch AbortController */
import Meteor from '@meteorrn/core'
import { onDev } from './onDev'
import { Log } from '../infrastructure/Log'
import { Config } from '../env/Config'

const createLog = Log.create

export const debugConnection = ({ reachability = false, data = false, ddp = false, socket = false, raw = false }) => {
  onDev(() => {
    const initLog = createLog('DEBUG_CONNECTION')

    if (reachability) {
      initLog('setup reachability log')
      const logReachability = createLog('DEBUG_CONNECTION::reachability')

      const controller = new AbortController()
      setTimeout(() => controller.abort(), 5000)
      logReachability('fetch HEAD request to', Config.backend.reachabilityUrl)
      fetch(Config.backend.reachabilityUrl, {
        method: 'HEAD',
        signal: controller.signal
      })
        .then((response) => logReachability('response', response))
        .catch(Log.error)
    }

    const Data = Meteor.getData()

    if (data) {
      initLog('setup data log')
      const dataLog = createLog('DEBUG_CONNECTION::DATA')
      ;[
        'loggingIn',
        'loggingOut',
        'change'
      ].forEach(name => {
        const event = `<${name}>`
        Data.on(name, (...args) => dataLog(event, ...args))
      })
    }

    if (ddp) {
      Data.waitDdpReady(() => {
        initLog('setup ddp log')
        const ddpLog = createLog('DEBUG_CONNECTION::DDP')
        const events = [
          // connection messages
          'connected',
          'disconnected',
          // Subscription messages (Meteor Publications)
          'ready',
          'nosub',
          'added',
          'changed',
          'removed',
          // Method messages (Meteor Methods)
          'result',
          'updated',
          // Error messages
          'error'
        ]
        events.forEach((eventName) => {
          Data.ddp.on(eventName, (...args) => ddpLog(eventName, ...args))
        })
      })
    }

    if (socket) {
      Data.waitDdpReady(() => {
        initLog('setup socket log')
        const socketLog = createLog('DEBUG_CONNECTION::socket')
        const socket = Data.ddp.socket
        const events = ['open', 'close', 'message:out', 'message:in', 'error']
        events.forEach((eventName) => {
          socket.on(eventName, (event) => socketLog(eventName, event))
        })
      })
    }

    if (raw) {
      Data.waitDdpReady(() => {
        Data.ddp.socket.on('open', () => {
          initLog('setup raw log')
          const rawLog = createLog('DEBUG_CONNECTION::raw')
          const rawSocket = Data.ddp.socket.rawSocket
          rawSocket.onopen = (e) => rawLog('raw open', e)
          rawSocket.onmessage = (e) => rawLog('raw message', e)
          rawSocket.onclose = (e) => rawLog('raw close', e)
          rawSocket.onerror = (e) => rawLog('raw error', e)
        })
      })
    }

    Data.waitDdpConnected(() => {
      initLog('DDP CONNECTED')
    })
  })
}

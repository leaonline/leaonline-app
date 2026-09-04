import { Log } from '../infrastructure/Log'
import Meteor from '@meteorrn/core'

export const logMeteor = () => {
  const log = Log.create('MeteorRN')

  const Data = Meteor.getData()
  const socket = Data.ddp.socket

  Data.onChange((event) => log('change', event))
  Data.on('loggingIn', (e) => log('loggingIn', e))

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
    Data.ddp.on(eventName, (event) => log(`(high) ${eventName}`, event))
  })

  ;['open', 'close', 'message:out', 'message:in', 'error'].forEach((eventName) => {
    socket.on(eventName, (event) => log(`(socket) ${eventName}`, event))
  })
}

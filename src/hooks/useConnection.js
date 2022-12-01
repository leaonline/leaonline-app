import { useState } from 'react'
import Meteor from '@meteorrn/core'
import * as SecureStore from 'expo-secure-store'
import { Config } from '../env/Config'
import { Log } from '../infrastructure/Log'

const log = Log.create('useConnection')

// get detailed info about internals
Meteor.enableVerbose()

// connect with Meteor and use a secure store
// to persist our received login token, so it's encrypted
// and only readable for this very app
// read more at: https://docs.expo.dev/versions/latest/sdk/securestore/
Meteor.connect(Config.backend.url, {
  AsyncStorage: {
    getItem: SecureStore.getItemAsync,
    setItem: SecureStore.setItemAsync,
    removeItem: SecureStore.deleteItemAsync
  },
  autoConnect: true,
  autoReconnect: true,
  reconnectInterval: 500
})

/**
 * Hook that handle auto-reconnect and updates state accordingly.
 * @return {{connected: boolean|null}}
 */
export const useConnection = () => {
  const [connected, setConnected] = useState(false)

  const status = Meteor.useTracker(() => Meteor.status())

  if (status.connected && !connected) {
    log('set connnected')
    setConnected(true)
  }

  if (connected && !status.connected) {
    log('set connnected')
    setConnected(false)
  }
  // // we use separate functions as the handlers, so they get removed
  // // on unmount, which happens on auto-reload and would cause errors
  // // if not handled
  // useEffect(() => {
  //   const onError = (e) => setConnectionError(e)
  //   Meteor.ddp.on('error', onError)
  //
  //   const onConnected = () => {
  //     log('connected to', Config.backend.url)
  //     if (connected !== true) setConnected(true)
  //   }
  //
  //   Meteor.ddp.on('connected', onConnected)
  //
  //   // if the connection is lost, we not only switch the state
  //   // but also force to reconnect to the server
  //   const onDisconnected = () => {
  //     console.debug('disconnected from', Config.backend.url)
  //     Meteor.ddp.autoConnect = true
  //     if (connected !== false) {
  //       setConnected(false)
  //     }
  //     Meteor.reconnect()
  //   }
  //
  //   Meteor.ddp.on('disconnected', onDisconnected)
  //
  //   // remove all of these listeners on unmount
  //   return () => {
  //     Meteor.ddp.off('error', onError)
  //     Meteor.ddp.off('connected', onConnected)
  //     Meteor.ddp.off('disconnected', onDisconnected)
  //   }
  // }, [])

  return { connected }
}

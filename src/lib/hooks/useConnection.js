import { useState } from 'react'
import Meteor from '@meteorrn/core'
import * as SecureStore from 'expo-secure-store'
import { Config } from '../env/Config'
import { Log } from '../infrastructure/Log'

const log = Log.create('useConnection')

const connect = (() => {
  let started = false

  return () => {
    if (started) {
      return false
    }
    else {
      started = true
    }

    // get detailed info about internals
    Meteor.enableVerbose()

    log('connect Meteor to backend at', Config.backend.url)
    log('url for reachability test is', Config.backend.reachabilityUrl)

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
      reconnectInterval: 500,
      reachabilityUrl: Config.backend.reachabilityUrl
    })

    return false
  }
})()

/**
 * Hook that handle auto-reconnect and updates state accordingly.
 * @return {{connected: boolean|null}}
 */
export const useConnection = () => {
  const [connected, setConnected] = useState(() => connect())
  const status = Meteor.useTracker(() => Meteor.status())

  if (status.connected && !connected) {
    log(Config.backend.url, 'connected', status)
    setConnected(true)
  }

  if (connected && !status.connected) {
    log(Config.backend.url, 'disconnected', status)
    setConnected(false)
  }

  return { connected }
}

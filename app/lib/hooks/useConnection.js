import { useEffect, useState } from 'react'
import Meteor from '@meteorrn/core'
import * as SecureStore from 'expo-secure-store'
import { Config } from '../env/Config'
import { Log } from '../infrastructure/Log'
import { AppState } from 'react-native'
import { useNetInfo } from '@react-native-community/netinfo'

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
  autoConnect: false,
  autoReconnect: true,
  reconnectInterval: 3000,
  NetInfo: null
})

/**
 * Hook that handle auto-reconnect and updates state accordingly.
 * @return {{connected: boolean|null}}
 */
export const useConnection = () => {
  const appState = useAppState()
  const [connected, setConnected] = useState(null)
  const [status, setStatus] = useState('connecting')
  const { isConnected } = useNetInfo({
    reachabilityUrl: Config.backend.reachabilityUrl,
    reachabilityTest: async (response) => response.status === 204,
    reachabilityLongTimeout: 15 * 1000, // 15s
    reachabilityShortTimeout: 5 * 1000, // 5s
    reachabilityRequestTimeout: 15 * 1000, // 15s
    reachabilityShouldRun: () => appState === 'active' && !connected,
    shouldFetchWiFiSSID: true, // met iOS requirements to get SSID
    useNativeReachability: false
  })

  const www = !!isConnected
  const backend = status === 'connected'

  useEffect(() => {
    const Data = Meteor.getData()
    const updateConnected = (backendConnected) => {
      if (backendConnected && connected !== true) {
        log('set connected=true')
        setConnected(true)
      }

      if (connected !== false && !backendConnected) {
        log('set connected=false')
        setConnected(false)
      }
    }
    Data.ddp.on('error', e => {
      // Log.error(e)
      log('DDP on error')
      Log.info(e.message)
    })

    Data.ddp.on('connected', () => {
      log('DDP on connected')
      setStatus('connected')
      updateConnected(true)
    })

    Data.ddp.on('disconnected', () => {
      log('DDP on disconnected')
      setStatus('connecting')
      updateConnected(false)
    })

    Meteor.reconnect()

    return () => {
      Data.ddp.off('error')
      Data.ddp.off('connected')
      Data.ddp.off('disconnected')
    }
  }, [])

  useEffect(() => {
    if ((isConnected && appState === 'active') && connected === false) {
      log('connect to server')
      Meteor.getData().ddp.connect()
    }

    if ((!isConnected || appState === 'background') && connected === true) {
      log('disconnect from server')
      Meteor.getData().ddp.disconnect()
    }
  }, [appState, connected, isConnected])

  return {
    connected,
    www,
    backend
  }
}

const log = Log.create('useConnection')

const useAppState = () => {
  const [appState, setAppState] = useState(AppState.currentState)
  useEffect(() => {
    const listener = AppState.addEventListener('change', newState => setAppState(newState))
    return () => listener.remove()
  }, [])
  return appState
}

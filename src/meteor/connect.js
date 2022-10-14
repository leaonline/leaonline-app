import Meteor from '@meteorrn/core'
import { check } from '../schema/check'
import { createSchema } from '../schema/createSchema'
import AsyncStorage from '@react-native-async-storage/async-storage'
// make sure connections can send/receive custom types
import './ejson-regex'
import { Log } from '../infrastructure/Log'
import { Config } from '../env/Config'

const log = Log.create('Meteor')
const maxTimeout = Config.backend.maxTimeout
const interval = Config.backend.interval
const endpointSchema = createSchema({
  endpoint: {
    type: String,
    regEx: /^ws{1,2}:\/\/[0-9a-zA-z.:-]+\/websocket$/i
  }
})

/**
 * Connects to a Meteor server by given endpoint. Returns a Promise.
 *
 * Rejects the promise, if
 * - error during connect
 * - timeout exceeds maxTimeout
 *
 * @return {Promise<Object>} a promise, resolving to the latest connection
 *  status on success
 */
export const connectMeteor = () => {
  log('connect to', Config.backend.url)
  check({ endpoint: Config.backend.url }, endpointSchema)

  return new Promise((resolve) => {
    const complete = (status, error) => resolve({ status, error })

    // skip with current status, if already connected
    const initialStatus = Meteor.status()
    if (initialStatus.connected) {
      return resolve(initialStatus)
    }

    // break early on any errors during connect attempt
    try {
      Meteor.connect(Config.backend.url, { AsyncStorage })
    } catch (connectError) {
      const errorStatus = Meteor.status()
      return complete(errorStatus, connectError)
    }

    // during Meteor.connect the internal connection status
    // can change many times to various "states"
    // so we need to wait until the state is actually "connected"
    // or fail if the maximum timeout has been exceeded
    let count = 0
    let timer = setInterval(() => {
      const updatedStatus = Meteor.status()

      if (updatedStatus.connected) {
        clearInterval(timer)
        timer = null
        return complete(updatedStatus)
      }

      if (count > maxTimeout) {
        clearInterval(timer)
        timer = null
        return complete(updatedStatus, new Error('connectMeteorTimeout'))
      }

      count += interval
    }, interval)
  })
}

import Meteor from '@meteorrn/core'
import { check } from '../schema/check'
import { createSchema } from '../schema/createSchema'
import AsyncStorage from '@react-native-async-storage/async-storage'
// make sure connections can send/receive custom types
import './ejson-regex'

// TODO move this into env config
const maxTimeout = 10000
const interval = 250
const argsSchema = createSchema({
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
 * @param endpoint {string} a valid websocket endpoint. Requires local ip on
 *  development mode (192.188.x.y)
 * @return {Promise<Object>} a promise, resolving to the latest connection
 *  status on success
 */
export const connectMeteor = ({ endpoint }) => {
  check({ endpoint }, argsSchema)

  return new Promise((resolve, reject) => {
    const status = Meteor.status()

    // skip with current status, if already connected
    if (status.connected) { return resolve(status) }

    // break early on any errors during connect attempt
    try {
      Meteor.connect(endpoint, { AsyncStorage })
    } catch (e) {
      return reject(e)
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
        return resolve(updatedStatus)
      }

      if (count > maxTimeout) {
        clearInterval(timer)
        timer = null
        reject(new Error('connectMeteorTimeout'))
      }

      count += interval
    }, interval)
  })
}

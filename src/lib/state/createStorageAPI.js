import Meteor from '@meteorrn/core'
import nextFrame from 'next-frame'
import { Log } from '../infrastructure/Log'
import { ErrorReporter } from '../errors/ErrorReporter'

const debug = Log.create('StorageAPI', 'debug')
const { EJSON } = Meteor

/**
 * @param storage {object}
 * @param storage.setItem {function}
 * @param storage.getItem {function}
 * @param storage.removeItem {function}
 * @param storage.multiRemove {function}
 * @param storage.multiSet {function}
 */
export const createStorageAPI = ({ storage }) => {
  return new StorageAPI({ storage })
}

class StorageAPI {
  constructor ({ storage }) {
    this.storage = storage
  }

  async restore (key) {
    await nextFrame()
    try {
      const value = await this.storage.getItem(key)
      if (typeof value === 'string') {
        return EJSON.parse(value)
      }
    }
    catch (e) {
      Log.error(e)
      ErrorReporter
        .send({ error: e })
        .catch(Log.error)
    }
    return null
  }

  async update (key, value) {
    await nextFrame()
    debug('storage update', key, value)
    const strValue = EJSON.stringify(value)
    return this.storage.setItem(key, strValue)
  }

  async remove (key) {
    await nextFrame()
    debug('storage remove', key)
    this.storage.removeItem(key)
  }

  async updateMulti (options) {
    await nextFrame()
    debug('storage update multi')
    const entries = Object.entries(options)
    const removePairs = entries.filter(([key, value]) => value === null)
    const updatePairs = entries.filter(([key, value]) => value !== null)

    if (removePairs.length > 0) {
      await this.storage.multiRemove(removePairs.map(toRemovePairs))
    }
    if (updatePairs.length > 0) {
      await this.storage.multiSet(updatePairs.map(toStoragePairs))
    }
    debug('storage update multi complete')
  }
}

const toRemovePairs = pair => pair[0]
const toStoragePairs = ([key, value]) => {
  return [key, JSON.stringify(value)]
}

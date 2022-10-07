import { Log } from '../infrastructure/Log'
import { Config } from '../env/Config'

/**
 * The AppState is the single point of truth for application-wide
 * state.
 *
 * It requires a storage that implements the capacity to persist the state
 * across application usage (but not necessarily across installations).
 *
 * Add a storage implementation with {AppState.init}.
 * @type {object}
 */
export const AppState = {
  name: 'appState'
}

/**
 * Sets the current storage implementation.
 * The storage needs to implement the JavaScript
 * @param storageImpl
 * @return {Promise<void>}
 */
AppState.init = (storageImpl) => {
  debug('init with storage', storageImpl)
  storage = storageImpl
}

AppState.field = async doc => {
  return await updateSingle(KEYS.FIELD, doc)
}

AppState.stage = async doc => {
  return await updateSingle(KEYS.STAGE, doc)
}

AppState.unitSet = async doc => {
  return await updateSingle(KEYS.UNIT_SET, doc)
}

/**
 * Updates data for the complete screen.
 * This should already be done when there is known, whether
 * a unit has been answered correctly or not!
 *
 * Cleared when `null` is passed, returns the current value,
 * when `undefined` is passed.
 *
 * @param value
 * @return {Promise<*|undefined>}
 */
AppState.complete = async value => {
  return await updateSingle(KEYS.COMPLETE, value, async newVal => {
    const current = await get(KEYS.COMPLETE)
    return (current ?? 0) + (newVal ?? 0)
  })
}

// ============================================================================
//
// PRIVATE / INTERNAL
//
// ============================================================================

let storage = null

const debug = Config.debug.state
  ? Log.create('AppState', 'debug')
  : () => {}

const createKey = name => `lea.online@${name}`
const KEYS = {
  SCREEN: createKey('screen'),
  FIELD: createKey('field'),
  UNIT_SET: createKey('unitSet'),
  UNIT: createKey('uni'),
  DIMENSION: createKey('dimension'),
  LEVEL: createKey('level'),
  STAGE: createKey('level'),
  COMPLETE: createKey('complete')
}

const defaultTransform = x => x
const ensureStorage = () => {
  if (!storage) {
    throw new Error('appState.noStorage')
  }
}

/**
 * Removes a storage item at given key
 * @param key
 * @return {Promise<undefined>}
 */
const remove = async (key) => {
  debug(key, 'remove item')
  await storage.removeItem(key)
  return undefined
}

/**
 * Updates the storage item at given key with given value,
 * returns the new value
 * @param key {string}
 * @param value {*}
 * @return {Promise<*>}
 */
const update = async (key, value) => {
  debug(key, 'set new value', value)
  await storage.setItem(key, value)
  return value
}

/**
 * Retrieves a storage item
 * @param key
 * @return {Promise<*>}
 */
const get = async (key) => {
  debug(key, 'get item')
  return await storage.getItem(key)
}

/**
 * by passing a null-value, we actually remove the item
 * for undefined values we return the stored value
 * by passing a non-undefined value we use it for update.
 *
 * @param key {string} the storage key to access the storage
 * @param value {*} the new value to update
 * @param fn {function=} optional, async function to transform the value
 * @return {Promise<*|undefined>}
 */
const updateSingle = async (key, value, fn = defaultTransform) => {
  ensureStorage()

  switch (value) {
    case null:
      return remove(key)
    case undefined:
      return get(key)
    default:
      const newValue = await fn(value)
      return update(key, newValue)
  }
}

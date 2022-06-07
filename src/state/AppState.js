import { Log } from '../infrastructure/Log'

/**
 * The AppState is the single point of truth for application-wide
 * state.
 *
 * It requires a storage that implements the capacity to persist the state
 * across application usage (but not necessarily across installations).
 */
export const AppState = {
  name: 'appState'
}

const debug = Log.create('AppState', 'debug')
const createKey = name => `lea.online@${name}`
const KEYS = {
  SCREEN: createKey('screen'),
  FIELD: createKey('field'),
  UNIT_SET: createKey('unitSet'),
  UNIT: createKey('uni'),
  DIMENSION: createKey('dimension'),
  LEVEL: createKey('level'),
  STAGE: createKey('level')
}

let storage = null

const updateSingle = async (key, value) => {
  if (!storage) {
    throw new Error('appState.noStorage')
  }

  if (value === null) {
    // by passing a null-value, we actually remove the item
    debug(key, 'remove item')
    await storage.removeItem(key)
    return undefined
  } else if (value !== undefined) {
    // by passing an undefined value
    debug(key, 'set new value')
    await storage.setItem(key, value)
    return value
  } else {
    // for undefined values we return the stored value
    debug(key, 'get item')
    return await storage.getItem(key)
  }
}

AppState.init = async (storageImpl) => {
  debug('init with storage')
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

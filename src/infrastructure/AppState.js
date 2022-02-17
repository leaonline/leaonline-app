import { Log } from './Log'

const createKey = name => `lea.online@${name}`

const KEYS = {
  SCREEN: createKey('screen'),
  FIELD: createKey('field'),
  TEST_CYCLE: createKey('testCycle'),
  UNIT_SET: createKey('unitSet'),
  UNIT: createKey('uni'),
  DIMENSION: createKey('dimension'),
  LEVEL: createKey('level'),
}

const internal = {
  storage: null,
  log: Log.create('AppState'),
  debug: Log.create('AppState', 'debug'),
  updateSingle: async (key, value) => {
    if (!internal.storage) {
      throw new Meteor.Error('appState.error', 'noStorage')
    }

    // by passing a null-value, we actually remove the item
    if (value === null) {
      internal.log(key, 'remove item')
      await internal.storage.removeItem(key)
      return undefined
    }

    // by passing an undefined value
    else if (value !== undefined) {
      internal.log(key, 'set new value')
      await internal.storage.setItem(key, value)
      return value
    }

    // for undefined values we return the stored value
    else {
      internal.log(key, 'get item')
      return await internal.storage.getItem(key)
    }
  }

}

/**
 * The AppState is the single point of truth for application-wide
 * state.
 *
 * It requires a storage that implements the capacity to persist the state
 * across application usage (but not necessarily across installations).
 */
export const AppState = {}

AppState.setStorage = storage => {
  internal.log('set storage', storage.name)
  internal.storage = storage
}

AppState.screen = async value => {
  return internal.updateSingle(KEYS.SCREEN, value)
}

AppState.field = async value => {
  return internal.updateSingle(KEYS.FIELD, value)
}

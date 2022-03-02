import { MeteorError } from '../errors/MeteorError'

const createKey = name => `lea.online@${name}`

export const StateKeys = {}

StateKeys.KEYS = {
  SCREEN: createKey('screen'),
  FIELD: createKey('field'),
  TEST_CYCLE: createKey('testCycle'),
  UNIT_SET: createKey('unitSet'),
  UNIT: createKey('uni'),
  DIMENSION: createKey('dimension'),
  LEVEL: createKey('level'),
}

const keyNames = new Set(Object.values(StateKeys.KEYS))

StateKeys.has = key => keyNames.has(key)

StateKeys.validate = key => {
  if (!StateKeys.has(key)) {
    throw new MeteorError('stateKeys.invalid', 'keyNotSupported', { key })
  }
}

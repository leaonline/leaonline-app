import { Random } from 'meteor/random'
import { Meteor } from 'meteor/meteor'

/**
 * The environment variables, used to define the internals
 */
const codeSettings = Meteor.settings.restore.codes

/**
 * Internal settings that are fixed and cannot be altered at runtime.
 */
const internal = {
  numberOfCOdes: codeSettings.numberOfCodes,
  length: codeSettings.length,
  uppercase: codeSettings.uppercase,
  forbidden: new RegExp(codeSettings.forbidden.source, codeSettings.forbidden.flags),
  maxRetries: codeSettings.maxRetries
}

/**
 * Generates the restore codes for a user in accordance to the schema definition
 *
 * @type {{
 *  name: String,
 *  schema: function():object,
 *  generate: function():Array<string>
 * }}
 */
export const RestoreCodes = {
  name: 'restoreCodes'
}

/**
 * Returns the restore-codes schema, to be used for validation.
 * @return {{
 *  restore: {type: ArrayConstructor, min: number},
 *  'restore.$': {type: *, min: number, regEx: RegExp}
 *  }}
 */
RestoreCodes.schema = () => ({
  restore: {
    type: Array,
    min: internal.numberOfCOdes
  },
  'restore.$': {
    type: String,
    min: internal.length,
    regEx: internal.forbidden
  }
})

/**
 * Generates an Array of n restore codes with length m where n and m are
 * defined by the application's settings.
 * @return {Array}
 */
RestoreCodes.generate = () => {
  const codes = []
  codes.length = internal.numberOfCOdes

  for (let i = 0; i < internal.numberOfCOdes; i++) {
    codes[i] = generateCode()
  }

  return codes
}

/**
 * @private
 */
const generateCode = () => {
  let count = 0
  let isValid = false
  let code

  while (!isValid && count++ < internal.maxRetries) {
    code = Random.id(internal.length)
    isValid = internal.forbidden.test(code) === false
  }

  return internal.uppercase
    ? code.toUpperCase()
    : code
}

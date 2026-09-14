import { Random } from 'meteor/random'
import { Meteor } from 'meteor/meteor'

/**
 * Generates the restore codes for a user in accordance to the schema definition.
 * The restore codes can be used to restore the account on another device without the need for an email address.
 * @category api
 * @namespace
 */
const RestoreCodes = {
  /**
   * @type {string}
   * @default: 'restoreCodes'
   */
  name: 'restoreCodes'
}

/**
 * Returns the restore-codes schema, to be used for validation.
 *
 * @method
 * @memberof RestoreCodes
 * @return {{
 *  restore: {type: Array, min: number},
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
    min: internal.length
  }
})

/**
 * Generates an Array of n restore codes with length m where n and m are
 * defined by the application's settings.
 * @return {Array}
 * @method
 */
RestoreCodes.generate = () => {
  const codes = []
  const { numberOfCOdes } = internal
  codes.length = numberOfCOdes

  for (let i = 0; i < numberOfCOdes; i++) {
    codes[i] = generateCode()
  }

  return codes
}

/**
 * The environment variables, used to define the internals
 * @private
 */
const codeSettings = Meteor.settings.restore.codes

/**
 * Internal settings that are fixed and cannot be altered at runtime.
 * @private
 */
const internal = {
  numberOfCOdes: codeSettings.numberOfCodes,
  length: codeSettings.length,
  uppercase: codeSettings.uppercase,
  forbidden: new RegExp(codeSettings.forbidden.source, codeSettings.forbidden.flags),
  maxRetries: codeSettings.maxRetries
}

/**
 * @private
 */
const generateCode = () => {
  let count = 0
  let isValid = false
  let code
  const { maxRetries, length, forbidden, uppercase } = internal

  while (!isValid && count++ < maxRetries) {
    code = Random.id(length)
    isValid = forbidden.test(code) === false
  }

  return uppercase
    ? code.toUpperCase()
    : code
}

export { RestoreCodes }

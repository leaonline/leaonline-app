export const KeyboardTypes = {}

KeyboardTypes.allowedValues = () => [].concat(allowedValues)

// we use email-address as default/fallback, since 'default'  offers the microphone
// which may trigger in some users the urge to avoid typing
const EMAIL_ADDRESS = 'email-address'
const DECIMAL_PAD = 'decimal-pad'
const NUMBER_PAD = 'number-pad'
const NUMERIC = 'numeric'
const PHONE_PAD = 'phone-pad'
const URL = 'url'

let typesList = []
const types = new Map()
const allowedValues = [
  EMAIL_ADDRESS,
  NUMBER_PAD,
  DECIMAL_PAD,
  NUMERIC,
  PHONE_PAD,
  URL
]

KeyboardTypes.register = ({ name, regex, value }) => {
  if (!allowedValues.includes(value)) {
    throw new Error(`Unsupported value ${value}`)
  }
  types.set(name, { regex, value })
  typesList = [...types.values()]
}

// TODO move outside this module

KeyboardTypes.register({
  name: 'numeric',
  regex: /^[\d,.-]+$/,
  value: DECIMAL_PAD
})

KeyboardTypes.register({
  name: 'text',
  regex: /^\w+$/,
  value: EMAIL_ADDRESS
})

/**
 *
 * @param pattern
 * @return {string}
 */
KeyboardTypes.get = (pattern) => {
  if (!pattern) { return EMAIL_ADDRESS }
  const found = typesList.find(({ regex }) => regex.test(pattern))
  return found?.value || EMAIL_ADDRESS
}

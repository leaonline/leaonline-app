export const KeyboardTypes = {}

KeyboardTypes.allowedValues = () => [].concat(allowedValues)

// we use this as fallback, since 'default'  offers the microphone
// which may trigger in some users the urge to avoid typing
const DEFAULT = 'default'
const types = new Map()
let typesList = []
const allowedValues = [
  DEFAULT,
  'email-address',
  'number-pad',
  'decimal-pad',
  'numeric',
  'phone-pad',
  'url'
]

KeyboardTypes.register = ({ name, regex, value }) => {
  if (!allowedValues.includes(value)) {
    throw new Error(`Unsupported value ${value}`)
  }
  types.set(name, { regex, value })
  typesList = [...types.values()]
}

KeyboardTypes.register({
  name: 'numeric',
  regex: /^\d+$/,
  value: 'numeric'
})

KeyboardTypes.register({
  name: 'text',
  regex: /^\w+$/,
  value: DEFAULT
})

/**
 *
 * @param pattern
 * @return {"default"|"numeric"}
 */
KeyboardTypes.get = (pattern) => {
  if (!pattern) { return DEFAULT }
  const found = typesList.find(({ regex }) => regex.test(pattern))
  return found?.value || DEFAULT
}

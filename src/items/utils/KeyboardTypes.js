export const KeyboardTypes = {}

KeyboardTypes.allowedValues = () => [].concat(allowedValues)

// we use this as fallback, since 'default'  offers the microphone
// which may trigger in some users the urge to avoid typing
const FALLBACK = 'email-address'
const types = new Map()
let typesList = []
const allowedValues = [
  FALLBACK,
  'default',
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
  regex: /^\d+$/g,
  value: 'numeric'
})

KeyboardTypes.register({
  name: 'text',
  regex: /^\w+$/g,
  value: 'email-address'
})

/**
 *
 * @param pattern
 * @return {"default"|"numeric"}
 */
KeyboardTypes.get = (pattern) => {
  if (!pattern) { return FALLBACK }
  const found = typesList.find(({ regex }) => regex.test(pattern))
  return found?.value || FALLBACK
}

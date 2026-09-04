
const unsupportedChars = /[!'()*]/g

const fixedEncodeURIComponent = str => encodeURIComponent(str)
  .replace(unsupportedChars, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())

const toEncodedParams = ([key, value]) => {
  if (Array.isArray(value)) {
    return value.map(entry => `${fixedEncodeURIComponent(key)}=${fixedEncodeURIComponent(entry)}`).join('&')
  }

  return `${fixedEncodeURIComponent(key)}=${fixedEncodeURIComponent(value)}`
}

/**
 * Safely encodes query params, including characters, that may be forgotten
 * by the builtin functions.
 * @see https://stackoverflow.com/a/62969380
 * @param params
 * @return {string}
 */
export const encodeQueryParams = params => Object.entries(params)
  .map(toEncodedParams)
  .join('&')

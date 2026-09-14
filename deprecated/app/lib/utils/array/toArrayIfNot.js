/**
 * Makes an array out of any value, in case it's not already an array.
 * Returns an empty array if undefined is given but returns
 * an array with null as element, if null is given.
 *
 * @param value {*}
 * @return {Array<*>}
 */
export const toArrayIfNot = value =>
  typeof value === 'undefined'
    ? []
    : Array.isArray(value)
      ? value
      : [value]

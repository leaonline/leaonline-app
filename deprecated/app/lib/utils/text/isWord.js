/**
 * A word is defined as a string with non-zero length.
 * @param s {*}
 * @return {boolean}
 */
export const isWord = s => (typeof s) === 'string' ? s.length > 0 : false

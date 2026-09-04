import { randomIntInclusive } from '../math/randomIntInclusive'

/**
 * returns a random value in array.
 * @throws {Error} if no array is given
 * @param array {array}
 * @returns {undefined|*} undefined if array has length of 0,
 *  otherwise any element the array contains
 */
export const randomArrayElement = (array) => {
  if (!Array.isArray(array)) {
    throw new Error(`Expected array, got ${array}`)
  }

  // zero and single length array return the first element,
  // resolves to undefined at zero length and
  // the first element for single length
  if (array.length < 2) { return array[0] }

  const index = randomIntInclusive(0, array.length - 1)
  return array[index]
}

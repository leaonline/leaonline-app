import { isSafeInteger } from '../number/isSafeInteger'

/**
 * creates a random integer between min and max
 * @param min {number}
 * @param max {number}
 * @throws {Error} if min or max are no safe integers
 */
export const randomIntInclusive = (min, max) => {
  if (!isSafeInteger(min) || !isSafeInteger(max)) {
    throw new Error(`Expected safe integers, got ${min} and ${max}`)
  }

  return Math.floor(
    Math.random() * (max - min + 1) + min
  )
}

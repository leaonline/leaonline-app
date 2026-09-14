/**
 * creates a random integer between min and max
 * @param min {number}
 * @param max {number}
 * @throws {Error} if min or max are no safe integers
 */
export const randomIntInclusive = (min, max) => {
  return Math.floor(
    Math.random() * (max - min + 1) + min
  )
}

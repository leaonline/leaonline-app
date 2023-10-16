import { randomIntInclusive } from './randomIntInclusive'

export const iterate = (times, fn) => {
  const n = randomIntInclusive(1, times)
  let result = []
  result.length = n
  for (let i = 0; i < n; i++) {
    result[i] = fn(i)
  }
  return result
}
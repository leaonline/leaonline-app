/**
 * See https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
 * @param str
 * @return {String}
 */
export const simpleHash = str => {
  let hash = 0
  let i
  let chr

  if (str.length === 0) {
    return hash
  }

  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0 // Convert to 32bit integer
  }

  return Math.abs(hash).toString(16)
}

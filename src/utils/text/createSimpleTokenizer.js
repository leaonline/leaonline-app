/**
 * Creates a simple tokenizer to split strings by a given pattern, defined by a
 * open-pattern and close-pattern. No AST scanning etc. required.
 *
 * @param openPattern A unique pattern indicate the following content is part if our token
 * @param closePattern A unique pattern indicate the previous content was part of our token
 * @returns {Array<Object>} An array of token-objects
 */
export const createSimpleTokenizer = (openPattern, closePattern) => value => {
  if (typeof value !== 'string' || value.length === 0) {
    return []
  }

  let startIndex = 0
  let endIndex = 0
  let index = 0
  let substr

  const tokens = []

  while (startIndex < value.length && startIndex > -1) {
    startIndex = value.indexOf(openPattern, endIndex)

    if (startIndex === -1 || startIndex >= value.length) {
      // no open bracket is found, we still try to add the rest of the words
      // that may remain in the value string until the end
      substr = value.substring(endIndex, value.length)
      tokens.push({ value: substr, length: substr.length, index: index++ })
      break
    }

    // add previous words
    substr = value.substring(endIndex, startIndex)
    tokens.push({ value: substr, length: substr.length, index: index++ })

    // add input related words
    endIndex = value.indexOf(closePattern, startIndex)
    substr = value.substring(startIndex + openPattern.length, endIndex)
    tokens.push({ isToken: true, value: substr, length: substr.length, index: index++ })
    endIndex += closePattern.length
  }

  return tokens
}

export const HighlightTokenizer = {}

const pattern = /\w+|{{[^{]+}}|\S|\s{2,}/g
const separatorChars = /[.,;:?!]+/g
const groupPattern = /[{}]+/g
const whiteSpace = /^\s+$/

HighlightTokenizer.tokenize = ({ text }) => {
  if (!text) return []

  const matches = text.match(pattern)
  const tokens = matches
    .map(token => token.replace(groupPattern, ''))
    .map(token => {
      const obj = { value: token }

      if (whiteSpace.test(token)) {
        obj.isSpace = true
      }

      if (separatorChars.test(token)) {
        obj.isSeparator = true
      }

      return obj
    })

  const readableText = tokens.map(({ value }) => value).join(' ')

  return { tokens, readableText }
}

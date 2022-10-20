import { createSimpleTokenizer } from '../../utils/text/createSimpleTokenizer'
import { ClozeHelpers } from './ClozeHelpers'

export const ClozeTokenizer = {}

const separator = '$'
const startPattern = '{{'
const closePattern = '}}'
const newLinePattern = '//'
const optionsSeparator = '|'
const tableSeparator = '||'
const newLineReplacer = `${startPattern}${newLinePattern}${closePattern}`
const newLineRegExp = /\n/g
const tokenize = createSimpleTokenizer(startPattern, closePattern)

// =============================================================================
// PUBLIC
// =============================================================================

ClozeTokenizer.tokenize = ({ text, flavor, isTable }) => {
  if (isTable) {
    return text.split(newLineRegExp).map(row => {
      return row.split(tableSeparator).map(cell => {
        return tokenize(cell.trim()).map(toTokens, { flavor })
      }).flat().filter(cell => cell.length > 0)
    })
  }
  else {
    const preprocessedValue = text.replace(newLineRegExp, newLineReplacer)
    return tokenize(preprocessedValue).map(toTokens, { flavor })
  }
}

// =============================================================================
// INTERNAL, EXPORTED ONLY FOR TESTING
// =============================================================================

const tokenizeValueEntry = createSimpleTokenizer('[', ']')

const tokenizeBlanks = (flavor, value) => tokenizeValueEntry(value)
  .filter(entry => entry.length > 0)
  .map((token, index, arr) => {
    if (token.isToken) {
      token.hasPre = index > 0
      token.hasSuf = index < arr.length - 1
      token.flavor = flavor
    }
    token.index = index
    return token
  })

const tokenizeSelect = (flavor, value) => tokenizeValueEntry(value)
  .filter(entry => entry.length > 0)
  .map((token, index, arr) => {
    if (token.isToken) {
      token.value = token.value.split(optionsSeparator)
      token.hasPre = index > 0
      token.hasSuf = index < arr.length - 1
      token.flavor = flavor
    }
    token.index = index
    return token
  })

const tokenizeText = (flavor, value) => tokenizeValueEntry(value)
  .filter(entry => entry.length > 0)
  .map((token, index) => {
    if (token.isToken) {
      token.hasPre = false
      token.hasSuf = false
      token.flavor = flavor
    }
    token.index = index
    return token
  })

const toTokens = entry => {
  // we simply indicate newlines within
  // our brackets to avoid complex parsing
  if (entry.value.includes('//')) {
    entry.isNewLine = true
    return entry
  }

  if (entry.value.length === 0) {
    entry.isEmpty = true
    return entry
  }

  // for normal text tokens we don't need
  // further processing of content here
  if (entry.value.indexOf(separator) === -1) {
    return entry
  }

  // if this is an interactive token
  // we process ist from the value split
  const split = entry.value.split('$')
  const flavorKey = split[0]
  const flavor = ClozeHelpers.getFlavor(flavorKey)

  if (!flavor) {
    throw new Error(`Unexpected flavor - ${flavorKey}`)
  }

  entry.flavor = flavor
  entry.value = getTokenValueForFlavor(entry.flavor, split[1])
  entry.tts = split[2]

  // optionally we can parse some configurations
  if (split[3]) {
    const configs = split[3].split('&')
    configs.forEach(configPair => {
      const configSplit = configPair.split('=')
      if (configSplit.length < 2) {
        return console.warn('Invalid config:', configPair)
      }
      entry[configSplit[0]] = configSplit[1]
    })
  }

  // a block entry has no value and is used, for example, to
  // render a d-block tts-button to read the whole text
  entry.isBlock = !entry.value || entry.value.length === 0

  return entry
}

const getTokenValueForFlavor = (flavor, rawValue = '') => {
  if (ClozeHelpers.isBlank(flavor)) {
    return tokenizeBlanks(flavor, rawValue)
  }

  if (ClozeHelpers.isSelect(flavor)) {
    return tokenizeSelect(flavor, rawValue)
  }

  if (ClozeHelpers.isEmpty(flavor)) {
    return tokenizeBlanks(flavor, rawValue)
  }

  if (ClozeHelpers.isText(flavor)) {
    return tokenizeText(flavor, rawValue)
  }

  throw new Error(`Unexpected flavor: ${flavor}`)
}

export {
  tokenizeBlanks,
  tokenizeSelect,
  tokenizeText,
  toTokens,
  getTokenValueForFlavor
}

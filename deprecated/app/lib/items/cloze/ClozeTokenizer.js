import { createSimpleTokenizer } from '../../utils/text/createSimpleTokenizer'
import { ClozeHelpers } from './ClozeHelpers'
import { isWord } from '../../utils/text/isWord'

export const ClozeTokenizer = {}

const separator = '$'
const startPattern = '{{'
const closePattern = '}}'
const newLinePattern = '//'
const optionsSeparator = '|'
const tableSeparator = '||'
const CELL_SKIP = '<<>>'
const newLineReplacer = `${startPattern}${newLinePattern}${closePattern}`
const newLineRegExp = /\n+/g
const tokenize = createSimpleTokenizer(startPattern, closePattern)

// =============================================================================
// PUBLIC
// =============================================================================

/**
 * Tokenizes a cloze text into a list of objects with rendering and item
 * information.
 *
 * @param text
 * @param isTable
 * @return {*}
 */
ClozeTokenizer.tokenize = ({ text, isTable }) => {
  let tokens
  const tokenIndexes = []
  let index = 0
  const assignIndex = token => {
    if (!Array.isArray(token.value)) {
      return
    }
    token.value.forEach(value => {
      if ('flavor' in value && ClozeHelpers.isScoreableFlavor(value.flavor)) {
        tokenIndexes.push(index)
        value.itemIndex = index++
      }
    })
  }

  if (isTable) {
    tokens = text
      .split(newLineRegExp)
      .map(row => {
        const parsed = row
          .split(tableSeparator)
          .map(cells => tokenize(cells.trim()).map(toTokens))
          .flat()
          .filter(cell => cell.length > 0)

        // assigned incremental indexes
        // to flattened list
        parsed.forEach((cell, cellIndex) => {
          cell.index = cellIndex
        })

        return parsed
      })
    tokens.forEach(row => row.forEach(assignIndex))
  }
  else {
    const preprocessedValue = text.replace(newLineRegExp, newLineReplacer)
    tokens = tokenize(preprocessedValue).map(toTokens)
    tokens.forEach(assignIndex)
  }

  return { tokens, tokenIndexes }
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
  if (entry.value.includes(CELL_SKIP)) {
    entry.isCellSkip = true
    return entry
  }

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

      if (configSplit.length < 2 || !configSplit.every(isWord)) {
        throw new Error(`Invalid options syntax: ${configPair}`)
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

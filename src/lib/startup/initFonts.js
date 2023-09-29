import * as Font from 'expo-font'
import { Log } from '../infrastructure/Log'

/**
 * used to load our custom font
 * @private
 * @return {Promise.<void>}
 */
export const initFonts = () => {
  let handle

  try {
    handle = require('../assets/fonts/SemikolonPlus-Regular.ttf')
  }
  catch (error) {
    Log.error(error)
    handle = require('../assets/fonts/OpenSans-Regular.ttf')
  }

  if (!handle) {
    throw new Error(`Expected font handle, got ${handle}`)
  }

  const fontMap = { semicolon: handle }

  return Font.loadAsync(fontMap)
}

import { useFonts } from 'expo-font'

/**
 * used to load our custom font
 * @private
 * @return {[boolean, Error|undefined]}
 */
export const initFonts = () => {
  let handle = null // bad style, alternative?

  try {
    handle = require('../assets/fonts/SemikolonPlus-Regular.ttf')
  }
  catch (error) {
    handle = require('../assets/fonts/OpenSans-Regular.ttf')
  }
  return useFonts({
    semicolon: handle
  })
}

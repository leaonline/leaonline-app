import * as Font from 'expo-font'

/**
 * @private used to load our custom font
 * @return {Promise<void>}
 */
export const fetchFonts = async () => {
  let handle = null // bad style, alternative?

  try {
    handle = require('../assets/fonts/SemikolonPlus-Regular.ttf')
  } catch (error) {
    handle = require('../assets/fonts/OpenSansVariable.ttf')
  } finally {
    if (handle != null) {
      await Font.loadAsync({
        semicolon: handle
      })
    }
  }
}

import { Config } from '../env/Config'
import { StyleSheet } from 'react-native'

/**
 * Creates a new style sheet instance.
 * If debug is true then all given style definitions will
 * be extended by a red border. However, the `borderColor`
 * and `borderWidth` are only added, if not already
 * defined by the styles.
 *
 * @param options {object}
 * @param debug {boolean=} optional debug flag to force-render debug styles
 * @return {StyleSheet}
 */
export const createStyleSheet = (options, debug = false) => {
  if (debug || Config.debug.layoutBorders) {
    Object.values(options).forEach(style => {
      style.borderColor = style.borderColor || 'red'
      style.borderWidth = style.borderWidth || 1
    })
  }

  return StyleSheet.create(options)
}

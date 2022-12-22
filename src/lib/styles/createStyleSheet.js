import { Config } from '../env/Config'
import { StyleSheet } from 'react-native'

/**
 * Creates a new style sheet instance
 * @param options
 * @param debug {boolean=true} optional debug flag to force-render debug styles
 * @return {StyleSheet.NamedStyles<StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>> | StyleSheet.NamedStyles<any>}
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

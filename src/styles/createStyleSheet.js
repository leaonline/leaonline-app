import { Config } from '../env/Config'
import { StyleSheet } from 'react-native'

/**
 *
 * @param options
 * @return {StyleSheet.NamedStyles<StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>> | StyleSheet.NamedStyles<any>}
 */
export const createStyleSheet = (options, debug) => {
  if (debug || Config.debug.layoutBorders) {
    Object.values(options).forEach(style => {
      style.borderColor = style.borderColor || 'red'
      style.borderWidth = style.borderWidth || 1
    })
  }

  return StyleSheet.create(options)
}

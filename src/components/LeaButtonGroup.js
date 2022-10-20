import { ButtonGroup } from 'react-native-elements'
import React, { useState } from 'react'
import { createStyleSheet } from '../styles/createStyleSheet'
import Colors from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { mergeStyles } from '../styles/mergeStyles'

/**
 *
 * @param props {object}
 * @param props.data {Array<React.component|string>}
 * @param props.onPress {function|undefined}
 * @returns {JSX.Element}
 * @constructor
 */
export const LeaButtonGroup = props => {
  const [index, setIndex] = useState(-1)
  const select = (newIndex) => {
    if (newIndex !== index) {
      setIndex(newIndex)
    }
    if (props.onPress) {
      props.onPress(props.data[newIndex], newIndex)
    }
  }

  const isFirstButton = index === 0
  const isLastButton = index === props.data.length - 1
  const selectedButtonStyle = {}
  const radius = Layout.borderRadius()

  if (isFirstButton) {
    selectedButtonStyle.borderTopLeftRadius = radius
    selectedButtonStyle.borderBottomLeftRadius = radius
  }

  if (isLastButton) {
    selectedButtonStyle.borderTopRightRadius = radius
    selectedButtonStyle.borderBottomRightRadius = radius
  }

  return (
    <ButtonGroup
      onPress={select}
      selectedIndex={index}
      buttons={props.data}
      textStyle={styles.textStyle}
      containerStyle={styles.container}
      selectedButtonStyle={mergeStyles(styles.selectedButtonStyle, selectedButtonStyle)}
    />
  )
}


const styles = createStyleSheet({
  container: {
    minHeight: 50,
    ...Layout.button(),
    ...Layout.dropShadow(),
    overflow: 'visible'
  },
  textStyle: {
    ...Layout.defaultFont()
  },
  selectedButtonStyle: {
    backgroundColor: Colors.primary,
  }
})
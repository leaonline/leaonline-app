import { ButtonGroup } from 'react-native-elements'
import React, { useState } from 'react'
import { createStyleSheet } from '../styles/createStyleSheet'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { mergeStyles } from '../styles/mergeStyles'

/**
 *
 * @param props {object}
 * @param props.style {object=}
 * @param props.data {Array<React.component|string>}
 * @param props.active {number=}
 * @param props.onPress {function|undefined}
 * @returns {JSX.Element}
 * @component
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

  if (props.background) {
    selectedButtonStyle.backgroundColor = props.background
  }

  if (isFirstButton) {
    selectedButtonStyle.borderTopLeftRadius = radius
    selectedButtonStyle.borderBottomLeftRadius = radius
  }

  if (isLastButton) {
    selectedButtonStyle.borderTopRightRadius = radius
    selectedButtonStyle.borderBottomRightRadius = radius
  }

  const selectedIndexes = typeof props.active === 'number'
    ? [props.active]
    : undefined

  const containerStyle = props.style
    ? mergeStyles(styles.container, props.style)
    : styles.container

  return (
    <ButtonGroup
      selectedIndexes={selectedIndexes}
      onPress={select}
      selectedIndex={index}
      buttons={props.data}
      textStyle={styles.textStyle}
      containerStyle={containerStyle}
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
    backgroundColor: Colors.primary
  }
})

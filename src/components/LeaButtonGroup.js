import { ButtonGroup } from 'react-native-elements'
import React, { useState } from 'react'
import { createStyleSheet } from '../styles/createStyleSheet'
import Colors from '../constants/Colors'

const styles = createStyleSheet({
  buttonContainer: {
    borderRadius: 15,
    minHeight: 50,
    backgroundColor: Colors.white,
    // dropshadow - ios only
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    // dropshadow - android only
    elevation: 0.5
  },
  textStyle: {
    fontFamily: 'semicolon',
  },
  selectedButtonStyle: {
    backgroundColor: Colors.primary
  }
})

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

  return (
    <ButtonGroup
      onPress={select}
      selectedIndex={index}
      buttons={props.data}
      textStyle={styles.textStyle}
      buttonStyle={styles.buttonStyle}
      containerStyle={styles.buttonContainer}
      selectedButtonStyle={styles.selectedButtonStyle}
    />
  )
}
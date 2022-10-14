import { Button, Icon } from 'react-native-elements'
import React from 'react'
import { createStyleSheet } from '../styles/createStyleSheet'
import Colors from '../constants/Colors'
import { mergeStyles } from '../styles/mergeStyles'

const styles = createStyleSheet({
  button: {
    borderRadius: 15,
    paddingTop: 10,
    fontFamily: 'semicolon',
    backgroundColor: Colors.white
  },
  title: {
    color: Colors.primary,
    fontFamily: 'semicolon',
    fontSize: 22
  }
})

export const LeaButton = props => {
  const renderIcon = () => {
    if (!props.icon) { return null }
    return (
      <Icon
        testID={props.iconId || 'icon-id'}
        color={props.color || Colors.secondary}
        size={props.iconSize || 18}
        name={props.icon}
        type='font-awesome-5'
      />
    )
  }

  const titleStyle = mergeStyles(styles.title, props.titleStyle)
  const buttonStyle = mergeStyles(styles.button, props.buttonStyle)

  return (
    <Button
      title={props.text}
      titleStyle={titleStyle}
      buttonStyle={buttonStyle}
      type='outline'
      onPress={props.onPress}
      icon={renderIcon()}
    />
  )
}
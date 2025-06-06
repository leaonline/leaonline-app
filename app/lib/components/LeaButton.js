import { Button } from 'react-native-elements'
import Icon from '@expo/vector-icons/FontAwesome6'
import React, { useState } from 'react'
import { createStyleSheet } from '../styles/createStyleSheet'
import { Colors } from '../constants/Colors'
import { mergeStyles } from '../styles/mergeStyles'
import { Layout } from '../constants/Layout'
import { Vibration } from 'react-native'

/**
 * The LeaButton is the very base class for any button in our application.
 * It implements our theme / layout defaults and provides support to display
 * an icon on the left or right to the title.
 *
 * The title comes with our default font styles as well.
 * Do not use this class directly unless it's really required.
 * Otherwise use {ActionButton} or {RouteButton} as they
 * implement most required functionailty already.
 *
 * @param props {object}
 * @param props.title {string=} Displayed label if none is given, it will only render the icon (if given)
 * @param props.onPress {function} On press handler
 * @param props.color {string=} Optional color to apply
 * @param props.titleStyle {object=} Optional title styles overrides
 * @param props.buttonStyle {object=} Optional button style overrides
 * @param props.containerStyle {object=} Optional container style overrides
 * @param props.icon {string=} Optional icon to display
 * @param props.iconColor {string=} Optional icon color to apply
 * @param props.iconSize {number=} Optional icon size
 * @param props.iconId {string=} Optional icon id for test purposes
 * @param props.iconPosition {string=} Optional icon position for test purposes
 * @param props.autoScale {boolean=} Optional if set to false will prevent automatic font scaling
 * @component
 * @returns {JSX.Element}
 */
export const LeaButton = props => {
  const [pressed, setPressed] = useState(false)
  const renderIcon = () => {
    if (pressed) {
      return (
        <Icon
          testID={props.iconId || defaults.icon.id}
          color={props.color || props.iconColor || defaults.icon.color}
          size={props.iconSize || defaults.icon.size}
          name='spinner'
          type={defaults.icon.type}
          style={styles.icon}
        />
      )
    }

    if (props.icon) {
      return (
        <Icon
          testID={props.iconId || defaults.icon.id}
          color={props.color || props.iconColor || defaults.icon.color}
          size={props.iconSize || defaults.icon.size}
          name={props.icon}
          type={defaults.icon.type}
          style={styles.icon}
        />
      )
    }
    return null
  }

  const handlePress = () => {
    setPressed(true)
    Vibration.vibrate(100)
    if (props.onPress) {
      setTimeout(async () => {
        await props.onPress()
        setPressed(false)
      }, 50)
    }
  }

  const textColor = props.color || Colors.primary
  const titleStyle = mergeStyles(styles.title, props.titleStyle, { color: textColor })
  const buttonStyle = mergeStyles(styles.button, props.buttonStyle)
  const containerStyle = mergeStyles(styles.container, props.containerStyle)
  return (
    <Button
      accessible='button'
      title={props.title}
      titleStyle={titleStyle}
      buttonStyle={buttonStyle}
      disabledStyle={styles.disabled}
      containerStyle={containerStyle}
      disabled={props.disabled || pressed}
      type='outline'
      titleProps={{
        lineBreakMode: 'middle',
        textBreakStrategy: 'balanced',
        android_hyphenationFrequency: 'normal',
        adjustsFontSizeToFit: true,
        allowFontScaling: props.autoScale
      }}
      onPress={handlePress}
      icon={renderIcon()}
      iconPosition={props.iconPosition || defaults.icon.position}
    />
  )
}

/**
 * Default icon props
 * @private
 */
const defaults = {
  icon: {
    id: 'icon-id',
    color: Colors.secondary,
    size: 18,
    position: 'left'
  }
}

/**
 * Default styles
 * @private
 */
const styles = createStyleSheet({
  button: {
    backgroundColor: Colors.white,
    ...Layout.button(),
    ...Layout.dropShadow({ android: false })
  },
  title: {
    color: Colors.primary,
    ...Layout.defaultFont(),
    flexGrow: 1
  },
  container: {
    ...Layout.dropShadow({ ios: false }),
    borderRadius: 15,
    borderWidth: 0,
    overflow: 'visible'
  },
  disabled: {
    opacity: 0.5
  },
  icon: {
    marginLeft: 7
  }
})

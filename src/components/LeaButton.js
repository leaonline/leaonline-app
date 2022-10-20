import { Button, Icon } from 'react-native-elements'
import React from 'react'
import { createStyleSheet } from '../styles/createStyleSheet'
import Colors from '../constants/Colors'
import { mergeStyles } from '../styles/mergeStyles'
import { Layout } from '../constants/Layout'

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
 * @param props.icon {string=} Optional icon to display
 * @param props.iconColor {string=} Optional icon color to apply
 * @param props.iconSize {number=} Optional icon size
 * @param props.iconId {string=} Optional icon id for test purposes
 * @param props.iconPosition {string=} Optional icon position for test purposes
 * @component
 * @returns {JSX.Element}
 */
export const LeaButton = props => {
  const renderIcon = () => {
    if (!props.icon) { return null }
    return (
      <Icon
        testID={props.iconId || defaults.icon.id}
        color={props.color || props.iconColor || defaults.icon.color}
        size={props.iconSize || defaults.icon.size}
        name={props.icon}
        type={defaults.icon.type}
      />
    )
  }

  const titleStyle = mergeStyles(styles.title, props.titleStyle)
  const buttonStyle = mergeStyles(styles.button, props.buttonStyle)

  return (
    <Button
      title={props.title}
      titleStyle={titleStyle}
      buttonStyle={buttonStyle}
      containerStyle={styles.container}
      type="outline"
      onPress={props.onPress}
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
    type: 'font-awesome-5',
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
    ...Layout.dropShadow()
  },
  title: {
    color: Colors.primary,
    ...Layout.defaultFont()
  },
  container: {
    borderWidth: 0,
    overflow: 'visible'
  },
  icon: {}
})
import React from 'react'
import { Image } from 'react-native'
import { mergeStyles } from '../../styles/mergeStyles'

const logos = {
  footer: {
    src: require('../../../assets/logo-footer.png'),
    styles: {}
  }
}

/**
 * Renders one of the given lea logos. Available are currently: [footer] defaults to 'footer' if not found.
 * @component
 * @category Components
 * @returns {JSX.Element}
 * @param props {object}
 * @param props.logo {string=} name of the available logos
 * @param props.style {object=} optional style overrides
 */
export const LeaLogo = props => {
  const { src, styles } = (logos[props.logo] ?? logos.footer)
  const imageStyle = mergeStyles(styles.logo, props.style)
  return (<Image style={imageStyle} accessibilityRole='image' resizeMethod='resize' resizeMode='contain' source={src} />)
}

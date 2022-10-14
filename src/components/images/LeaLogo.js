import React from 'react'
import { Image } from 'react-native'

const logos = {
  footer: {
    src: require('../../assets/logo-footer.png'),
    styles: {}
  }
}

export const LeaLogo = props => {
  const { src, styles } = (logos[props.logo] ?? logos.footer)
  const imageStyle = props.style
    ? { ...styles.logo, ...props.style }
    : styles.logo
  return (<Image style={imageStyle} resizeMethod='resize' resizeMode='contain' source={src} />)
}

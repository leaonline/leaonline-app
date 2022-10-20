import Colors from './Colors'
import { PixelRatio } from 'react-native'

export const Layout = {}

Layout.lineWidth = (value) => PixelRatio.roundToNearestPixel(value)

Layout.containter = () => ({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20
  // marginTop: StatusBar.currentHeight
})

Layout.content = () => {
  return {
    padding: 20
  }
}

Layout.defaultFont = () => ({
  fontFamily: 'semicolon',
  fontSize: 22,
  lineHeight: 28,
  fontStyle: 'normal',
  fontWeight: 'normal',
  padding: 0,
  margin: 0
})

Layout.borderRadius = () => 15

Layout.button = () => ({
  backgroundColor: Colors.white,
  borderRadius: Layout.borderRadius(),
  borderColor: Colors.white
})

Layout.dropShadow = ({ ios = true, android = true } = {}) => {
  const styles = {
    shadowColor: '#000'
  }

  if (ios) {
    styles.shadowOffset = { width: 0, height: 4 }
    styles.shadowOpacity = 0.2
    styles.shadowRadius = 12
  }
  if (android) {
    styles.elevation = 5
  }

  return styles
}

Layout.debugBorders = () => ({
  borderWidth: 1,
  borderColor: '#ff0000'
})

import { Colors } from './Colors'
import Constants from 'expo-constants'
import { Dimensions, PixelRatio } from 'react-native'

const window = Dimensions.get('window')
const screen = Dimensions.get('screen')
const { width, height } = screen
const ratio = PixelRatio.get()
const fontScale = PixelRatio.getFontScale()
const isLarge = width * ratio > 1300

export const Layout = {}

Layout.statusBarHeight = () => Constants.statusBarHeight

Layout.width = () => width

Layout.ratio = () => ratio

Layout.height = () => height * ratio

Layout.withRatio = value => value * ratio

Layout.isLarge = () => isLarge

Layout.lineWidth = (value) => PixelRatio.roundToNearestPixel(value)

Layout.fontScale = () => fontScale

Layout.fontSize = () => 22

Layout.windowScale = () => window.scale

Layout.yOffset = () => window.height - height
Layout.xOffset = () => window.width - width

const defaultContainerMargin = isLarge
  ? '8%'
  : '3%'

Layout.container = ({ margin = defaultContainerMargin } = {}) => ({
  flex: 1,
  margin,
  alignItems: 'stretch',
  justifyItems: 'stretch',
  justifyContent: 'space-around'
})

Layout.content = () => {
  return {
    padding: 20
  }
}

/**
 * Default styles for (Text-) input
 * components.
 */
Layout.input = () => ({
  padding: 5,
  fontSize: Layout.fontSize() / Layout.fontScale(),
  fontFamily: 'semicolon',
  color: Colors.secondary,
  backgroundColor: '#fff',
  borderWidth: 1,
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
  borderBottomRightRadius: 4,
  borderBottomLeftRadius: 4
})

Layout.defaultFont = () => ({
  color: Colors.secondary,
  fontFamily: 'semicolon',
  fontSize: Layout.fontSize() / Layout.fontScale(),
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
    styles.elevation = 2
  }

  return styles
}

Layout.debugBorders = () => ({
  borderWidth: 1,
  borderColor: '#ff0000'
})

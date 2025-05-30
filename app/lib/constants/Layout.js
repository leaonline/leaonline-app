import { Colors } from './Colors'
import Constants from 'expo-constants'
import { Dimensions, PixelRatio } from 'react-native'

const window = Dimensions.get('window')
const screen = Dimensions.get('screen')
const { width, height } = screen
const ratio = PixelRatio.get()
const fontScale = PixelRatio.getFontScale()
const isLarge = width * ratio > 1300
const SEMICOLON_FONT = 'semicolon'

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

Layout.row = () => {
  return {
    flexDirection: 'row',
    // alignItems: 'stretch',
    // justifyItems: 'stretch',
    justifyContent: 'space-around',
    alignItems: 'center'
  }
}

Layout.content = () => {
  return {
    padding: 20
  }
}

/**
 * Default styles for (Text-) input
 * components.
 */
Layout.input = () => {
  return {
    padding: 5,
    fontSize: Layout.fontSize() / Layout.fontScale(),
    color: Colors.secondary,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 4,
    fontFamily: SEMICOLON_FONT
  }
}

Layout.defaultFont = () => {
  return {
    color: Colors.secondary,
    fontSize: Layout.fontSize() / Layout.fontScale(),
    lineHeight: 28,
    fontStyle: 'normal',
    fontWeight: 'normal',
    padding: 0,
    margin: 0,
    fontFamily: SEMICOLON_FONT
  }
}

Layout.borderRadius = () => 15

Layout.button = () => ({
  backgroundColor: Colors.white,
  borderRadius: Layout.borderRadius(),
  borderColor: Colors.white
})

Layout.dropShadow = (options = {}) => {
  const { ios = true, android = true } = options
  const styles = {
    shadowColor: '#000'
  }

  if (ios) {
    styles.shadowOffset = { width: 0, height: 4 }
    styles.shadowOpacity = 0.2
    styles.shadowRadius = 12
  }
  if (android) {
    styles.elevation = options.elevation ?? 2
  }

  return styles
}

Layout.debugBorders = () => ({
  borderWidth: 1,
  borderColor: '#ff0000'
})

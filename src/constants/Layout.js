import { StatusBar } from 'react-native'
import Colors from './Colors'

export const Layout = {}

Layout.containter = () => ({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: StatusBar.currentHeight
})

Layout.defaultFont = () => ({
  fontFamily: 'semicolon',
  fontSize: 22
})

Layout.borderRadius = () => 15

Layout.button = () => ({
  backgroundColor: Colors.white,
  borderRadius: Layout.borderRadius(),
  borderColor: Colors.white,
})

Layout.dropShadow = () => ({
  shadowColor: '#000',
  // ios only
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  // android only
  elevation: 5
})

Layout.debugBorders = () => ({
  borderWidth: 1,
  borderColor: '#ff0000'
})
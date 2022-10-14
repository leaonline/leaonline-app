import { StatusBar } from 'react-native'

export const Layout = {}

Layout.containter = () => ({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: StatusBar.currentHeight
})

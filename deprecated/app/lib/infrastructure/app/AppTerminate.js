import { BackHandler, DevSettings } from 'react-native'
import RNRestart from 'react-native-restart'
import { Config } from '../../env/Config'

export const AppTerminate = {}

AppTerminate.restart = () => {
  if (Config.isDevelopment) {
    DevSettings.reload()
  }
  else {
    RNRestart.restart()
  }
}

AppTerminate.close = () => {
  BackHandler.exitApp()
}

import { Colors } from '../constants/Colors'
import { isIOS } from '../utils/isIOS'

export const getHeaderOptions = () => {
  const headerOptions = {
    statusBarTranslucent: true,
    statusBarColor: Colors.light
  }

  if (!isIOS()) {
    Object.assign(headerOptions, {
      statusBarHidden: false,
      statusBarStyle: 'dark',
      statusBarAnimation: 'fade'
    })
  }

  return headerOptions
}

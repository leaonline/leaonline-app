import { useEffect } from 'react'
import { Keyboard } from 'react-native'

export const useKeyboardVisibilityHandler = (handler) => {
  const keyboardDidShow = () => handler({ status: 'shown' })
  const keyboardDidHide = () => handler({ status: 'hidden' })

  useEffect(() => {
    const didShowSub = Keyboard.addListener('keyboardDidShow', keyboardDidShow)
    const didHideSub = Keyboard.addListener('keyboardDidHide', keyboardDidHide)

    // cleanup function
    return () => {
      didShowSub.remove()
      didHideSub.remove()
    }
  }, [handler])
}

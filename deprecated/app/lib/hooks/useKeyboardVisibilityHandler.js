import { useEffect } from 'react'
import { Keyboard } from 'react-native'

export const useKeyboardVisibilityHandler = (handler) => {
  useEffect(() => {
    if (typeof handler === 'function') {
      const didShowSub = Keyboard.addListener('keyboardDidShow', () => handler({ status: 'shown' }))
      const didHideSub = Keyboard.addListener('keyboardDidHide', () => handler({ status: 'hidden' }))

      return () => {
        // cleanup function
        didShowSub.remove()
        didHideSub.remove()
      }
    }
  }, [handler])
}

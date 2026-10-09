import { useEffect } from 'react'
import { BackHandler } from 'react-native'

/**
 *
 * @param {function(): boolean} handler
 */
export const useBackHandler = (handler) => {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handler)

    return () => {
      backHandler.remove()
    }
  }, [handler])
}

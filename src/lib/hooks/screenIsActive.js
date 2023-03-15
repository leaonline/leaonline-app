import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useCallback, useEffect, useState } from 'react'

export const useScreenIsActive = (dependencies = []) => {
  const navigation = useNavigation()
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setIsActive(false)
    });

    return unsubscribe;
  }, [navigation].concat(dependencies))

  useFocusEffect(useCallback(() => {
    setIsActive(true)
  }, dependencies))

  return { isActive }
}

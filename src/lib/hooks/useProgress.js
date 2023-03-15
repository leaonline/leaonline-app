import { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { UserProgress } from '../contexts/UserProgress'
import { Log } from '../infrastructure/Log'

export const useProgress = ({ fieldId }) => {
  const [progressDoc, setProgressDoc] = useState(null)

  useFocusEffect(useCallback(() => {
    console.debug('load progress')
    UserProgress.get({ fieldId })
      .catch(Log.error)
      .then(doc => {
        Log.print(doc)
        if (doc) {
          setTimeout(() => {
            setProgressDoc(doc)
          }, 1000)
        }
      })
  }, [fieldId]))

  return { progressDoc }
}

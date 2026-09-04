import { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { UserProgress } from '../contexts/UserProgress'
import { Log } from '../infrastructure/Log'
import { ErrorReporter } from '../errors/ErrorReporter'

export const useProgress = ({ fieldId, loadUserData }) => {
  const [progressDoc, setProgressDoc] = useState(null)

  useFocusEffect(useCallback(() => {
    UserProgress.get({ fieldId, force: loadUserData })
      .catch(error => {
        Log.error(error)
        ErrorReporter
          .send({ error })
          .catch(Log.error)
      })
      .then(doc => {
        if (doc) {
          setProgressDoc(doc)
        }
      })
  }, [fieldId, loadUserData]))

  return { progressDoc }
}

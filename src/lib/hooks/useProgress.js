import { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { UserProgress } from '../contexts/UserProgress'

export const useProgress = ({ fieldId }) => {
  const [progressDoc, setProgressDoc] = useState(null)

  useFocusEffect(useCallback(() => {
    const doc = fieldId && UserProgress.collection().findOne({ fieldId })

    if (doc) {
      setProgressDoc(doc)
    }
  }, [fieldId]))

  return { progressDoc }
}

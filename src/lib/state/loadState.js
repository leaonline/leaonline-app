import { useEffect, useState } from 'react'
import { AppState } from './AppState'

export const loadState = ({ key, dependencies = [] }) => {
  const [value, setValue] = useState(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(async () => {
    const result = await AppState.single(key)
    setValue(result)
    setLoading(false)
  }, dependencies)

  return { value, loading }
}

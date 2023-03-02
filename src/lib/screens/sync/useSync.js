import { useState, useEffect } from 'react'
import { Sync } from '../../infrastructure/sync/Sync'

export const useSync = () => {
  const [progress, setProgress] = useState(0)
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    const onProgress = (data) => setProgress(data.progress)
    Sync.run({ onProgress })
      .finally(() => {
        setProgress(100)
        setTimeout(() => {
          setComplete(true)
        }, 5000)
      })
  })

  return { progress, complete }
}

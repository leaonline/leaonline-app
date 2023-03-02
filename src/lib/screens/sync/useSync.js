import { useState, useEffect } from 'react'
import { Sync } from '../../infrastructure/sync/Sync'
import { Log } from '../../infrastructure/Log'

export const useSync = () => {
  const [progress, setProgress] = useState(0)
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    const onProgress = (data) => setProgress(data.progress)
    Sync.run({ onProgress })
      .finally(() => {
        setProgress(100)
        setTimeout(() => {
          console.debug('Sync complete!', Log.print(Sync.collection().findOne()))
          setComplete(true)
        }, 5000)
      })
  }, [])

  return { progress, complete }
}

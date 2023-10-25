import { useEffect, useState } from 'react'
import { TTSengine } from '../components/Tts'
import { Log } from '../infrastructure/Log'
import { ErrorReporter } from '../errors/ErrorReporter'

export const useVoices = () => {
  const [voices, setVoices] = useState([])
  const [currentVoice, setCurrentVoice] = useState(null)
  const [voicesLoaded, setVoicesLoaded] = useState(false)

  useEffect(() => {
    TTSengine.getVoices()
      .catch(e => {
        Log.error(e)
        ErrorReporter
          .send({ error: e })
          .catch(Log.error)
        setVoicesLoaded(true)
      })
      .then(result => {
        setVoices(result)
        setVoicesLoaded(true)
        setCurrentVoice(TTSengine.currentVoice || null)
      })
  }, [])

  return { voices, voicesLoaded, currentVoice }
}

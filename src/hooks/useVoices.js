import { useEffect, useState } from 'react'
import { TTSengine } from '../components/Tts'

export const useVoices = () => {
  const [voices, setVoices] = useState([])
  const [currentVoice, setCurrentVoice] = useState(null)
  const [voicesLoaded, setVoicesLoaded] = useState(false)

  useEffect(() => {
    TTSengine.getVoices()
      .catch(e => {
        console.error(e)
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
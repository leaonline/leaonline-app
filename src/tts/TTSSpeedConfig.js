import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LeaButtonGroup } from '../components/LeaButtonGroup'
import { TTSengine } from '../components/Tts'

const speeds = [0.6, 0.9, 1.1] // TODO move to TTSengine
const speedNames = ['slow', 'medium', 'fast']


export const TTSSpeedConfig = props => {
  const { t } = useTranslation()
  const [index, setIndex] = useState(-1)
  const [selected, setSelected] = useState(false)

  useEffect(() => {
    const currentSpeed = TTSengine.currentSpeed
    const currentIndex = speeds.findIndex(s => s === currentSpeed)
    if (currentIndex > -1) {
      setIndex(currentIndex)
    }
  }, [])

  const groupData = speedNames.map(str => t(`tts.speed.${str}`))
  const onSpeedSet = (text, index) => {
    const newSpeed = speeds[index]
    TTSengine.stop()
    TTSengine.updateSpeed(newSpeed)
    TTSengine.speakImmediately(t('tts.speedText', { value: text }))
    if (!selected) {
      setSelected(true)
    }

    if (props.onChange) {
      props.onChange(newSpeed)
    }
  }

  const initialActive = selected
    ? undefined
    : index

  return (
    <LeaButtonGroup
      active={initialActive}
      data={groupData}
      onPress={onSpeedSet}
    />
  )
}

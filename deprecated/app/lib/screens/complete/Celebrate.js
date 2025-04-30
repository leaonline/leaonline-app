import React, { useState } from 'react'
import { Image, View } from 'react-native'
import TrophyAnimated from '../../../assets/images/trophy-animated.gif'
import TrophyStatic from '../../../assets/images/trophy-static.png'
import { createStyleSheet } from '../../styles/createStyleSheet'

export const Celebrate = () => {
  const [/* animationStopPosition */, setAnimationStopPosition] = useState(0)
  const [stopCupAnimation] = useState(false)
  const onLayout = (event) => {
    const { y } = event.nativeEvent.layout
    setAnimationStopPosition(y)
  }

  const renderTrophy = () => {
    const imageSource = stopCupAnimation
      ? TrophyStatic
      : TrophyAnimated

    return (
      <Image
        onLayout={onLayout}
        style={styles.trophy}
        source={imageSource}
      />
    )
  }

  return (
    <View style={styles.container}>
      {renderTrophy()}
    </View>
  )
}

const styles = createStyleSheet({
  trophy: {
    width: '100%',
    height: '100%'
  },
  container: {
    flex: 1,
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

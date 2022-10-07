import React, { useState } from 'react'
import {
  Image,
  View,
  Dimensions
} from 'react-native'
import Star from '../../assets/svg/Star.svg'
import TrophyAnimated from '../../assets/images/winner5.gif'
import TrophyStopped from '../../assets/images/winnerstop1.png'
import CelebrationAnimation from './CelebrationAnimation'
import { createStyleSheet } from '../../styles/createStyleSheet'

const { width, height } = Dimensions.get('screen')
const styles = createStyleSheet({
  trophyImage: {
    width: width + 100,
    height: height / 2 + 20
  },
  container: {
    flex: 1,
    alignItems: 'center',
    flexGrow: 6
  }
})

export const Celebrate = props => {
  const [animationStopPosition, setAnimationStopPosition] = useState(0)
  const [stopCupAnimation, setStopCupAnimation] = useState(false)
  const onLayout = (event) => {
    const { y } = event.nativeEvent.layout
    setAnimationStopPosition(y)
  }
  const starImages = [
    <Star key={1} height={25} width={25} />,
    <Star key={2} height={20} width={20} />,
    <Star key={3} height={15} width={15} />,
    <Star key={4} height={30} width={30} />
  ]

  const renderTrophy = () => {
    const imageSource = stopCupAnimation
      ? TrophyStopped
      : TrophyAnimated

    return (
      <Image
        onLayout={onLayout}
        style={styles.trophyImage}
        source={imageSource}
      />
    )
  }

  return (
    <View style={styles.container}>
      <CelebrationAnimation
        imgs={starImages}
        count={40}
        stopAnimarion={animationStopPosition}
        duration={14200}
        updateState={() => setStopCupAnimation(true)}
      />
      {props.children}
      {renderTrophy()}
    </View>
  )
}

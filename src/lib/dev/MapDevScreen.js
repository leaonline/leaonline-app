import React, { useState } from 'react'
import { Diamond } from '../components/progress/Diamond'
import { Colors } from '../constants/Colors'
import { Button, Text, View } from 'react-native'

export const MapDevScreen = props => {
  const [value, setValue] = useState(0)
  return (
    <View>
      <Diamond width={50} height={100} color={Colors.info} value={value} precise={false} />
      <Text>{value}</Text>
      <Button title='random value' onPress={() => setValue(getRandomInt(0, 100))} />
    </View>
  )
}

const getRandomInt = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min) // The maximum is exclusive and the minimum is inclusive
}

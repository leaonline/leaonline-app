import React from 'react'
import { View, Image, Text } from 'react-native'

export const LazyImage = props => {
  const urlReplaced = props.value.replace('https://content.lealernen.de', 'http://localhost:3030')
  console.debug(urlReplaced)
  return (
    <View>
      <Text>jkl</Text>
      <Image source={{ uri: urlReplaced }}  />
    </View>
  )
}

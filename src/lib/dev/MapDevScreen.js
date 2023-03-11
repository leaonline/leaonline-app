import React from 'react'
import { View } from 'react-native'

import { ConnectItemRenderer } from '../items/connect/ConnectItemRenderer'
import { Colors } from '../constants/Colors'
import { useTts } from '../components/Tts'
import { createStyleSheet } from '../styles/createStyleSheet'
import { Layout } from '../constants/Layout'

const data = {
  value: {
    left: [
      { text: 'z.B. 1000 g' },
      { text: 'z.B. 10000 g' }
    ],
    right: [
      { text: 'z.B. 10 kg' },
      { text: 'z.B. 1 kg' }
    ]
  }
}

export const MapDevScreen = () => {
  const { Tts } = useTts()
  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <ConnectItemRenderer value={data.value} dimensionColor={Colors.success} />
      </View>
      <View style={{ flex: 1 }}>
        <Tts text='hallo' block />
      </View>
    </View>
  )
}

const styles = createStyleSheet({
  container: {
    ...Layout.container()
  },
  root: {
    ...Layout.container(),
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    borderColor: '#f00'
  },
  dot: {
    width: 4,
    height: 4,
    backgroundColor: Colors.primary
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: window.width,
    height: '100%',
    borderColor: '#0ff'
  },
  svg: {
    flex: 0,
    position: 'absolute',
    borderColor: '#ff0',
    borderWidth: 1
  }
})

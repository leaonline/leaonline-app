import React, { useRef } from 'react'
import { View } from 'react-native'
import { Colors } from '../constants/Colors'
import { createStyleSheet } from '../styles/createStyleSheet'
import { Layout } from '../constants/Layout'
import { ConnectItemRenderer } from '../items/connect/ConnectItemRenderer'

const data = {
  value: {
    left: [
      { text: 'z.B. 1000 g' },
      { text: 'z.B. 10000 g' },
      { text: 'Im ..... ist Materialstau.' }
    ],
    right: [
      { text: 'z.B. 10 kg' },
      { text: 'z.B. 1 kg' }
    ]
  }
}
export const MapDevScreen = () => {
  const responseRef = useRef({})
  const page = 0

  const submitResponse = async ({ responses, data }) => {
    responseRef.current[page] = responseRef.current[page] ?? {}
    responseRef.current[page][data.contentId] = { responses, data }
  }

  return (
    <View style={styles.connectContainer}>
      <ConnectItemRenderer
        contentId='132465'
        value={data.value}
        submitResponse={submitResponse}
        dimensionColor='#0ff'
      />
    </View>
  )
}

const styles = createStyleSheet({
  container: {
    flex: 1,
    margin: 20,
    height: 200
  },
  connectContainer: {
    ...Layout.container(),
    height: '100%'
  },
  root: {
    ...Layout.container(),
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    borderColor: '#f00'
  },
  section: { flex: 1 },
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
}, true)

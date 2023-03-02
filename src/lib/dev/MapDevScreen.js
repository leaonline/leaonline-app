import React from 'react'
import { View } from 'react-native'

import { ConnectItemRenderer } from '../items/connect/ConnectItemRenderer'

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
  return (
    <View>
      <ConnectItemRenderer value={data.value} />
    </View>
  )
}

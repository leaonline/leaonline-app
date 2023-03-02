import React from 'react'
import { View } from 'react-native'
import { useSync } from './useSync'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Layout } from '../../constants/Layout'
import { Colors } from '../../constants/Colors'
import { LinearProgress } from 'react-native-elements'

export const SyncScreen = () => {
  const sync = useSync()

  return (
    <View style={styles.container}>
      <LinearProgress
        value={sync.progress}
        variant='determinate'
        color={sync.complete ? Colors.success : Colors.primary}
      />
    </View>
  )
}

const styles = createStyleSheet({
  container: {
    ...Layout.container(),
    alignItems: 'center',
    justifyContent: 'center'
  }
})

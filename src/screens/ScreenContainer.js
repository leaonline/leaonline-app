import React from 'react'
import { View,   SafeAreaView } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'
import { Layout } from '../constants/Layout'

const styles = createStyleSheet({
  container: Layout.containter(),
})

export const ScreenContainer = () => {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaView}>
        {props.children}
      </SafeAreaView>
    </View>
  )
}
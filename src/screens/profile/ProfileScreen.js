import React from 'react'
import { SafeAreaView, ScrollView } from 'react-native'
import { AccountInfo } from './AccountInfo'
import { Achievements } from './Achievements'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Layout } from '../../constants/Layout'

/**
 *  TODO
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const ProfileScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Achievements />
        <AccountInfo />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = createStyleSheet({
  container: Layout.container(),
  scroll: {
    flexGrow: 1
  }
})

export default ProfileScreen

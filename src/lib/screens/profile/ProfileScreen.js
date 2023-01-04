import React from 'react'
import { SafeAreaView, ScrollView } from 'react-native'
import { AccountInfo } from './account/AccountInfo'
import { Achievements } from './Achievements'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Layout } from '../../constants/Layout'
import { TTSSettings } from './TTSSettings'

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
        <Achievements containerStyle={styles.section} />
        <TTSSettings containerStyle={styles.section} />
        <AccountInfo containerStyle={styles.section} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = createStyleSheet({
  container: Layout.container(),
  scroll: {
    flexGrow: 1
  },
  section: {
    marginBottom: 30
  }
})

export default ProfileScreen

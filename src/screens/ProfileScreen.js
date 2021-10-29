import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import i18n from 'i18next'
import { LinearProgress } from 'react-native-elements'
import { useTranslation } from 'react-i18next'
import Colors from '../constants/Colors'
import { TTSengine } from '../components/Tts'
import * as data from '../profileData.json'

const Tts = TTSengine.component()

const ProfileScreen = props => {
  const { t } = useTranslation()
  return (
    <View style={styles.container}>
      <Tts text={t('profileScreen.title')} color={Colors.secondary} id={7} testId='profilescreen-header' smallButton />
      <View style={styles.body}>
        <Text>Mein Profil</Text>
      </View>

      <View style={styles.progressTitle}>
        <Tts text={t('profileScreen.progress')} color={Colors.primary} id={8} testId='profilescreen-fortschritt' smallButton />
      </View>
      <LinearProgress color={Colors.primary} variant='determinate' value={data.progress.global} style={{ borderRadius: 15, height: 15 }} />
    </View>

  )
}

ProfileScreen.navigationOptions = (navData) => {
  return {
    headerTitle: i18n.t('profileScreen.headerTitle')
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 10,
    paddingBottom: 10
  },
  body: {
    flex: 2,
    flexDirection: 'row'
  },
  progressTitle: {
    alignItems: 'center'
  }
})

export default ProfileScreen

import React from 'react'
import { SafeAreaView, ScrollView, View } from 'react-native'
import { AccountInfo } from './account/AccountInfo'
import { Achievements } from './achievements/Achievements'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Layout } from '../../constants/Layout'
import { TTSSettings } from './TTSSettings'
import { useTimeout } from '../../hooks/useTimeout'
import { Loading } from '../../components/Loading'
import Colors from '../../constants/Colors'
import { useTts } from '../../components/Tts'
import { useTranslation } from 'react-i18next'

/**
 *  TODO
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const ProfileScreen = () => {
  const screenReady = useTimeout({ timeout: 300 })
  const { Tts } = useTts()
  const { t } = useTranslation()

  const renderContent = () => {
    if (!screenReady) {
      return (<Loading />)
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headline}>
          <Tts
            text={t('profileScreen.achievements.title')}
            color={Colors.secondary}
            align='center'
            fontStyle={styles.headlineText}
            id='profileScreen.achievements.title'
          />
        </View>
        <Achievements containerStyle={styles.achievements} />
        <View style={styles.headline}>
          <Tts
            text={t('tts.settings')}
            color={Colors.secondary}
            align='center'
            fontStyle={styles.headlineText}
            id='profileScreen.tts.settings'
          />
        </View>
        <TTSSettings containerStyle={styles.tts} />
        <View style={styles.headline}>
          <Tts
            text={t('accountInfo.title')}
            color={Colors.secondary}
            align='center'
            fontStyle={styles.headlineText}
            id='profileScreen.accountInfo.title'
          />
        </View>
        <AccountInfo containerStyle={styles.accounts} />
      </SafeAreaView>
    )
  }

  return (
    <ScrollView persistentScrollbar>
      {renderContent()}
    </ScrollView>
  )
}

const styles = createStyleSheet({
  container: {
    ...Layout.container()
  },
  scroll: {
  },
  achievements: {
    flex: 1,
    marginBottom: 55
  },
  tts: {
    flex: 1,
    marginBottom: 55
  },
  accounts: {
    flex: 1,
    marginBottom: 55
  },
  headline: {
    alignItems: 'center',
    marginBottom: 5
  },
  headlineText: {
    fontWeight: 'bold'
  }
})

export default ProfileScreen

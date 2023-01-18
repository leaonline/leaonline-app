import React from 'react'
import { SafeAreaView, ScrollView, View } from 'react-native'
import { AccountInfo } from './account/AccountInfo'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Layout } from '../../constants/Layout'
import { TTSSettings } from './TTSSettings'
import { useTimeout } from '../../hooks/useTimeout'
import { Loading } from '../../components/Loading'
import Colors from '../../constants/Colors'
import { useTts } from '../../components/Tts'
import { useTranslation } from 'react-i18next'
import { ActionButton } from '../../components/ActionButton'

/**
 *  TODO
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const ProfileScreen = (props) => {
  const screenReady = useTimeout({ timeout: 300 })
  const { Tts } = useTts()
  const { t } = useTranslation()

  const renderContent = () => {
    if (!screenReady) {
      return (<Loading />)
    }

    return (
      <SafeAreaView style={styles.container}>
        <ActionButton
            buttonStyle={styles.achievementsButton}
            titleStyle={styles.achievementButtonTitle}
            iconColor={Colors.secondary}
            color={Colors.white}
            onPress={() => props.navigation.navigate('achievements')}
            title={t('profileScreen.achievements.title')} />
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
  tts: {
    flex: 1
  },
  accounts: {
    flex: 1
  },
  headline: {
    alignItems: 'center',
    marginTop: 55,
    marginBottom: 5
  },
  headlineText: {
    fontWeight: 'bold'
  },
  achievementsButton: {
    backgroundColor: Colors.secondary
  },
  achievementButtonTitle: {
    color: Colors.white
  }
})

export default ProfileScreen

import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Icon } from 'react-native-elements'
import { TTSengine } from '../../components/Tts'
import { useTranslation } from 'react-i18next'
import RouteButton from '../../components/RouteButton'
import { loadDocs } from '../../meteor/loadDocs'
import { loadHomeData } from './loadHomeData'
import { AppState } from '../../state/AppState'
import { useKeepAwake } from 'expo-keep-awake'
import { createStyleSheet } from '../../styles/createStyleSheet'
import Colors from '../../constants/Colors'

/**
 * @private TTS Ref
 */
const Tts = TTSengine.component()

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  profile: {
    display: 'flex',
    marginLeft: 'auto'
  },
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 30
  },
  header: {
    flex: 1,
    alignItems: 'center',
    margin: 30
  },
  body: {
    flex: 2,
    alignItems: 'center'
  },
  button: {
    alignItems: 'center',
    flex: 1
  }
})

/**
 * The main screen for registered users. From here they can navigate to their
 * profile ({ProfileScreen}) or select a field of work to start new units (which navigates them
 * to the {MapScreen}.
 *
 * @category Screens
 * @component
 * @param props {object}
 * @param props.navigation {object} navigation API
 * @returns {JSX.Element}
 */
const HomeScreen = props => {
  useKeepAwake()
  const { t } = useTranslation()
  const { data, error, loading } = loadDocs(loadHomeData)
  console.debug(data?.length)
  const renderContent = () => {
    if (loading) {
      return (
        <View>
          <ActivityIndicator size='large' color={Colors.secondary} />
        </View>
      )
    }

    if (error) {
      // TODO display error
    }

    if (!data?.length) {
      // TODO what todo here?
    }

    return (
      <View style={styles.button}>
        {renderButtons()}
      </View>
    )
  }

  const selectField = async value => {
    await AppState.field(value)
    props.navigation.navigate('Map')
  }

  /**
   * Renders the RouteButtons for the Homescreen
   */
  const renderButtons = () => {
    return (data || []).map((item, key) => {
      return (
        <RouteButton
          title={item.title} icon={item.icon} key={key}
          handleScreen={() => selectField(item)}
        />
      )
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        <Icon
          name='user' type='font-awesome-5' color={Colors.gray} reverse
          style size={17}
          onPress={() => props.navigation.navigate('Profile')}
        />
      </View>
      <View style={styles.header}>
        <Tts
          text={t('homeScreen.text')} color={Colors.secondary}
          id='homeScreen.text'
        />
      </View>

      <View style={styles.body}>
        {renderContent()}
      </View>
    </View>
  )
}

export default HomeScreen

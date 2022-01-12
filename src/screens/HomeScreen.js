import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Icon } from 'react-native-elements'
import { TTSengine } from '../components/Tts'
import { useTranslation } from 'react-i18next'
import Colors from '../constants/Colors'
import RouteButton from '../components/RouteButton'
import * as data from '../resources/taskData.json'

/**
 * @private
 */
const Tts = TTSengine.component()

/**
 * @private
 */
const styles = StyleSheet.create({
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
    alignItems: 'center',
    flexDirection: 'column'
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
  const { t } = useTranslation()

  /**
   * Renders the RouteButtons for the Homescreen
   */
  const renderButtons = () => {
    return data.dimensions.map((item, key) => {
      return (
        <RouteButton title={item.title} icon={item.icon} key={key} handleScreen={() => props.navigation.navigate('Map')} />
      )
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        <Icon name='user' type='font-awesome-5' color={Colors.gray} reverse style size={17} onPress={() => props.navigation.navigate('Profile')} />
      </View>
      <View style={styles.header}>
        <Tts text={t('homeScreen.text')} color={Colors.secondary} id='homeScreen.text' />
      </View>

      <View style={styles.body}>

        <View style={styles.button}>
          {renderButtons()}
        </View>
      </View>
    </View>
  )
}

export default HomeScreen

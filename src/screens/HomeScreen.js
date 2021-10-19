import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Icon } from 'react-native-elements'
import { TTSengine } from '../components/Tts'
import { useTranslation } from 'react-i18next'
import Colors from '../constants/Colors'
import RouteButton from '../components/RouteButton'
import * as data from '../taskData.json'

const Tts = TTSengine.component()

const HomeScreen = props => {
  const { t } = useTranslation()

  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        <Icon name='user' type='font-awesome-5' color={Colors.gray} reverse style size={17} onPress={() => props.navigation.navigate({ routeName: 'Profile' })} />
      </View>
      <View style={styles.header}>
        <Tts text={t('homeScreen.text')} color={Colors.secondary} id={5} testId='homeScreen1' />
      </View>

      <View style={styles.body}>

        <View style={styles.button}>
          <RouteButton title={data.dimensions[0].title} icon={data.dimensions[0].icon} handleScreen={() => props.navigation.navigate({ routeName: 'Overview' })} />
          <RouteButton title={data.dimensions[1].title} icon={data.dimensions[1].icon} handleScreen={() => props.navigation.navigate({ routeName: 'Overview' })} />
          <RouteButton title={data.dimensions[2].title} icon={data.dimensions[2].icon} handleScreen={() => props.navigation.navigate({ routeName: 'Overview' })} />
          <RouteButton title={data.dimensions[3].title} icon={data.dimensions[3].icon} handleScreen={() => props.navigation.navigate({ routeName: 'Overview' })} />

        </View>
      </View>
    </View>
  )
}

HomeScreen.navigationOptions = (navData) => {
  return {
    headerShown: false
  }
}

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

export default HomeScreen

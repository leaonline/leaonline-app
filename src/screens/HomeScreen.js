import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'
import { TTSengine } from '../components/Tts'
import { useTranslation } from 'react-i18next'
import Colors from '../constants/Colors'
import Task from '../components/Task'
import * as data from '../taskData.json'

const Tts = TTSengine.component()

const HomeScreen = props => {
  const { t } = useTranslation()

  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        {/* TODO make it to an component and link it to profileScreen */}
        <Icon name='user' type='font-awesome-5' color={Colors.gray} reverse style size={17} />
      </View>
      <View style={styles.header}>
        <Tts text={t('homeScreen.text')} color={Colors.secondary} id={5} testId='homeScreen1' />
      </View>

      <View style={styles.body}>

        {/* TODO make it to an component */}
        <View style={styles.button}>
          <Task title={data.dimensions[0].title} icon={data.dimensions[0].icon} />
          <Task title={data.dimensions[1].title} icon={data.dimensions[1].icon} />
          <Task title={data.dimensions[2].title} icon={data.dimensions[2].icon} />
          <Task title={data.dimensions[3].title} icon={data.dimensions[3].icon} />

        </View>
      </View>

      <View style={styles.navigationButton}>
        <TouchableOpacity onPress={() => {
          props.navigation.navigate({ routeName: 'Overview' })
        }}
        >
          <Icon style={styles.iconNavigation} name='arrow-alt-circle-right' type='font-awesome-5' size={35} />
        </TouchableOpacity>
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
    flex: 1
  }
})

export default HomeScreen

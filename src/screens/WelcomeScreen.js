/* global ttsIsCurrentlyPlaying */
import React from 'react'
import { Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'
import Colors from '../constants/Colors'
import Tts from '../components/Tts'

/**
 * WelcomeScreen displays the welcome text.
 * @returns {JSX.Element}
 * @constructor
 */
const WelcomeScreen = props => {
  // TODO also here i18n file
  const welcomeText = 'Herzlich Willkommen zu lea online'

  return (

    <View style={styles.container}>

      <View style={styles.header}>
        <Image style={styles.logo} source={{uri:'../assets/logo-footer.png'}} />
      </View>

      <View style={styles.body}>

        <Tts text={welcomeText} color={Colors.primary} id={1} align='center' testId='welcomeScreen1' />

      </View>
      <View style={styles.navigationButton}>
        <TouchableOpacity onPress={() => {
          // TODO get alert message from i18n file
          ttsIsCurrentlyPlaying
            ? Alert.alert('Stop', 'Es wird noch geredet ! \nBitte warten Sie bis zu Ende gespochen wurde oder beenden Sie es vorzeitig')
            : props.navigation.navigate({ routeName: 'TandC' })
        }}
        >
          <Icon style={styles.iconNavigation} name='arrow-right-circle' type='feather' size={35} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

WelcomeScreen.navigationOptions = (navData) => {
  return {
    headerShown: false
  }
}

const styles = StyleSheet.create({
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
  logo: {
    width: 300,
    height: 50

  },
  body: {
    flex: 2,
    flexDirection: 'row'
  },

  icon: {
    paddingBottom: 5

  },
  navigationButton: {
    flexDirection: 'row'
  }
}
)

export default WelcomeScreen

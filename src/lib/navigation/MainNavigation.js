import React, { useEffect } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { WelcomeScreen } from '../screens/auth/WelcomeScreen'
import { TermsAndConditionsScreen } from '../screens/auth/TermsAndConditionsScreen'
import { RegistrationScreen } from '../screens/auth/RegistrationScreen'
import { HomeScreen } from '../screens/home/HomeScreen'
import { MapScreen } from '../screens/map/MapScreen'
import { DimensionScreen } from '../screens/map/DimensionScreen'
import { UnitScreen } from '../screens/unit/UnitScreen'
import { ProfileScreen } from '../screens/profile/ProfileScreen'
import { AchievementsScreen } from '../screens/profile/achievements/AchievementsScreen'
import { CompleteScreen } from '../screens/complete/CompleteScreen'
import { useTranslation } from 'react-i18next'
import { useLogin } from '../hooks/useLogin'
import { useTts } from '../components/Tts'
import { Colors } from '../constants/Colors'
import { Platform } from 'react-native'
import { RestoreScreen } from '../screens/auth/RestoreScreen'
import { ProfileButton } from '../components/ProfileButton'
import { useKeepAwake } from 'expo-keep-awake'
import { BackButton } from '../components/BackButton'
import { CurrentProgress } from '../components/progress/CurrentProgress'
import { InteractionGraph } from '../infrastructure/log/InteractionGraph'
import { createStyleSheet } from '../styles/createStyleSheet'
import { createDevelopmentButton } from '../dev/createDevelopmentButton'
import { DeveloperScreen } from '../dev/DeveloperScreen'
import { UnitDevScreen } from '../dev/UnitDevScreen'
import { MapDevScreen } from '../dev/MapDevScreen'
import { initAppSession } from '../startup/initAppSession'
import { getHeaderOptions } from './getHeaderOptions'
import { LoggingScreen } from '../screens/logging/LoggingScreen'
import { TTSProfileScreen } from '../screens/profile/tts/TTSProfileScreen'

const { AppSessionProvider } = initAppSession()

/**
 * StackNavigator navigates between screens in a push/pop fashion.
 * We use left-to-right / right-to-left transitions as animations.

 * @category  Controller
 * @type {NativeStackNavigator}
 * @component
 * @returns {JSX.Element}
 */
const Stack = createNativeStackNavigator()
const headerStyle = { backgroundColor: Colors.light }
const headerOptions = getHeaderOptions()
const DevelopmentButton = createDevelopmentButton({ route: 'development', icon: 'keyboard' })
const LoggingButton = createDevelopmentButton({ route: 'logging', icon: 'align-left' })

export const MainNavigation = (props) => {
  useKeepAwake()
  const { t } = useTranslation()
  const { state, authContext } = useLogin({ connection: props.connection })
  const { Tts } = useTts()
  const { userToken, isSignout, isDeleted } = state

  const renderTitleTts = text => (
    <Tts align='center' fontStyle={styles.titleFont} text={text} />
  )
  const renderScreens = () => {
    if (userToken && !isSignout && !isDeleted) {
      const headerRight = () => (<ProfileButton route='profile' />)
      const mapScreenTitle = t('mapScreen.title')
      const profileScreenTitle = t('profileScreen.headerTitle')
      const achievementScreenTitle = t('profileScreen.achievements.title')
      const ttsProfileScreenTitle = t('profileScreen.tts.title')
      const screens = [
        <Stack.Screen
          name='home'
          key='home'
          component={HomeScreen}
          options={{
            ...headerOptions,
            headerStyle,
            headerBackVisible: false,
            headerTitleAlign: 'center',
            headerLeft: () => (<><DevelopmentButton /><LoggingButton /></>),
            headerTitle: () => (<></>),
            headerRight
          }}
        />,
        <Stack.Screen
          name='map'
          key='map'
          component={MapScreen}
          options={{
            ...headerOptions,
            headerStyle,
            title: mapScreenTitle,
            headerBackVisible: false,
            headerTitleAlign: 'center',
            headerRight
          }}
        />,
        <Stack.Screen
          name='dimension'
          key='dimension'
          component={DimensionScreen}
          options={{
            ...headerOptions,
            headerStyle,
            title: mapScreenTitle,
            headerBackVisible: false,
            headerTitleAlign: 'center',
            headerRight
          }}
        />,
        <Stack.Screen
          name='unit'
          key='unit'
          component={UnitScreen}
          options={{
            ...headerOptions,
            headerStyle,
            title: t('unitScreen.title'),
            headerBackVisible: false,
            headerTitleAlign: 'center',
            headerRight,
            headerTitle: CurrentProgress
          }}
        />,
        <Stack.Screen
          name='complete'
          key='complete'
          component={CompleteScreen}
          options={{
            ...headerOptions,
            headerStyle,
            title: t('completeScreen.title'),
            headerBackVisible: false,
            headerTitleAlign: 'center',
            headerRight,
            headerTitle: CurrentProgress
          }}
        />,
        <Stack.Screen
          name='profile'
          key='profile'
          component={ProfileScreen}
          options={{
            ...headerOptions,
            headerStyle,
            title: profileScreenTitle,
            headerBackVisible: false,
            headerTitleAlign: 'center',
            headerLeft: () => (<BackButton icon='arrow-left' />),
            headerTitle: () => renderTitleTts(profileScreenTitle),
            headerRight: () => (<></>)
          }}
        />,
        <Stack.Screen
          name='ttsprofile'
          key='ttsprofile'
          component={TTSProfileScreen}
          options={{
            ...headerOptions,
            headerStyle,
            title: ttsProfileScreenTitle,
            headerBackVisible: false,
            headerTitleAlign: 'center',
            headerLeft: () => (<BackButton icon='arrow-left' />),
            headerTitle: () => renderTitleTts(ttsProfileScreenTitle),
            headerRight: () => (<></>)
          }}
        />,
        <Stack.Screen
          name='achievements'
          key='achievements'
          component={AchievementsScreen}
          options={{
            ...headerOptions,
            headerStyle,
            title: achievementScreenTitle,
            headerBackVisible: false,
            headerTitleAlign: 'center',
            headerLeft: () => (<BackButton icon='arrow-left' />),
            headerTitle: () => renderTitleTts(achievementScreenTitle),
            headerRight: () => (<></>)
          }}
        />,
        <Stack.Screen
          name='development'
          key='development'
          component={DeveloperScreen}
          options={{
            ...headerOptions,
            title: 'Dev',
            headerStyle,
            headerBackVisible: false,
            headerTitleAlign: 'center',
            headerLeft: () => (<BackButton icon='arrow-left' />),
            headerRight
          }}
        />,
        <Stack.Screen
          name='logging'
          key='logging'
          component={LoggingScreen}
          options={{
            ...headerOptions,
            title: 'Dev',
            headerStyle,
            headerBackVisible: false,
            headerTitleAlign: 'center',
            headerLeft: () => (<BackButton icon='arrow-left' />),
            headerRight
          }}
        />,
        <Stack.Screen
          name='unitDev'
          key='unitDev'
          component={UnitDevScreen}
          options={{
            ...headerOptions,
            headerStyle,
            title: t('unitScreen.title'),
            headerBackVisible: false,
            headerTitleAlign: 'center',
            headerLeft: () => (<BackButton icon='arrow-left' />),
            headerRight,
            headerTitle: CurrentProgress
          }}
        />,
        <Stack.Screen
          name='mapDev'
          key='mapDev'
          component={MapDevScreen}
          options={{
            ...headerOptions,
            headerStyle,
            title: t('mapScreen.title'),
            headerBackVisible: false,
            headerTitleAlign: 'center',
            headerLeft: () => (<BackButton icon='arrow-left' />),
            headerRight,
            headerTitle: 'Map-Dev'
          }}
        />
      ]

      return screens
    }

    const welcomeTitle = t('welcomeScreen.title')
    const tcTitle = t('TandCScreen.headerTitle')
    const registerTitle = t('registrationScreen.title')
    const restoreTitle = t('restoreScreen.title')

    return (
      <>
        <Stack.Screen
          name='authDecision'
          component={WelcomeScreen}
          options={{
            ...headerOptions,
            title: welcomeTitle,
            headerStyle,
            headerTitleAlign: 'center',
            headerLeft: () => (<LoggingButton />),
            headerTitle: () => renderTitleTts(welcomeTitle)
          }}
        />
        <Stack.Screen
          name='termsAndConditions'
          component={TermsAndConditionsScreen}
          options={{
            ...headerOptions,
            title: tcTitle,
            headerStyle,
            headerTitleAlign: 'center',
            headerBackTitleVisible: false,
            headerTitle: () => renderTitleTts(tcTitle)
          }}
        />
        <Stack.Screen
          name='registration'
          component={RegistrationScreen}
          options={{
            ...headerOptions,
            title: registerTitle,
            headerStyle,
            headerTitleAlign: 'center',
            headerBackTitleVisible: false,
            headerTitle: () => renderTitleTts(registerTitle)
          }}
        />
        <Stack.Screen
          name='restore'
          component={RestoreScreen}
          options={{
            ...headerOptions,
            title: registerTitle,
            headerStyle,
            headerTitleAlign: 'center',
            headerBackTitleVisible: false,
            headerTitle: () => renderTitleTts(restoreTitle)
          }}
        />
        <Stack.Screen
          name='logging'
          key='logging'
          component={LoggingScreen}
          options={{
            ...headerOptions,
            title: 'Dev',
            headerStyle,
            headerBackVisible: false,
            headerTitleAlign: 'center',
            headerLeft: () => (<BackButton icon='arrow-left' />)
          }}
        />
      </>
    )
  }

  const screenOptions = Platform.select({
    ios: {
      cancelButtonText: 'foo',
      contentStyle: {
        padding: 0,
        margin: 0
      }
    },
    android: {
      contentStyle: {
        padding: 0,
        margin: 0
      }
    }
  })

  const screenListeners = {
    focus: (e) => {
      // Do something with the state
      const screen = (e.target || '').split('-')[0]
      InteractionGraph.enterScreen({ screen })
    }
  }

  return (
    <AuthContext.Provider value={authContext}>
      <AppSessionProvider>
        <NavigationContainer onReady={props.onLayout}>
          <Stack.Navigator screenOptions={screenOptions} screenListeners={screenListeners}>
            {renderScreens()}
          </Stack.Navigator>
        </NavigationContainer>
      </AppSessionProvider>
    </AuthContext.Provider>
  )
}

const styles = createStyleSheet({
  titleFont: {
    fontWeight: 'bold'
  }
})

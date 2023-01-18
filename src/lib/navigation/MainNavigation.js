import React from 'react'
import { CardStyleInterpolators } from '@react-navigation/stack'
import { AuthContext } from '../contexts/AuthContext'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { WelcomeScreen } from '../screens/auth/WelcomeScreen'
import TermsAndConditionsScreen from '../screens/auth/TermsAndConditionsScreen'
import { RegistrationScreen } from '../screens/auth/RegistrationScreen'
import HomeScreen from '../screens/home/HomeScreen'
import MapScreen from '../screens/map/MapScreen'
import DimensionScreen from '../screens/map/DimensionScreen'
import UnitScreen from '../screens/unit/UnitScreen'
import ProfileScreen from '../screens/profile/ProfileScreen'
import { AchievementsScreen } from '../screens/profile/achievements/AchievementsScreen'
import CompleteScreen from '../screens/complete/CompleteScreen'
import { useTranslation } from 'react-i18next'
import { useLogin } from '../hooks/useLogin'
import { useTts } from '../components/Tts'
import Colors from '../constants/Colors'
import { Platform } from 'react-native'
import { RestoreScreen } from '../screens/auth/RestoreScreen'
import { ProfileButton } from '../components/ProfileButton'
import { useKeepAwake } from 'expo-keep-awake'
import { BackButton } from '../components/BackButton'
import { CurrentProgress } from '../components/progress/CurrentProgress'
import { InteractionGraph } from '../infrastructure/log/InteractionGraph'
import { AppSession } from '../state/AppSession'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createStyleSheet } from '../styles/createStyleSheet'

const { AppSessionProvider } = AppSession.init({
  storage: AsyncStorage
})

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

export const MainNavigation = (props) => {
  useKeepAwake()
  const { t } = useTranslation()
  const { state, authContext } = useLogin()
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
      return (
        <>
          <Stack.Screen
            name='home'
            component={HomeScreen}
            options={{
              headerStyle,
              headerBackVisible: false,
              headerTitleAlign: 'center',
              headerTitle: () => (<></>),
              headerRight
            }}
          />
          <Stack.Screen
            name='map'
            component={MapScreen}
            options={{
              headerStyle,
              title: mapScreenTitle,
              headerBackVisible: false,
              headerTitleAlign: 'center',
              headerRight
            }}
          />
          <Stack.Screen
            name='dimension'
            component={DimensionScreen}
            options={{
              headerStyle,
              title: mapScreenTitle,
              headerBackVisible: false,
              headerTitleAlign: 'center',
              headerRight
            }}
          />
          <Stack.Screen
            name='unit'
            component={UnitScreen}
            options={{
              headerStyle,
              title: t('unitScreen.title'),
              headerBackVisible: false,
              headerTitleAlign: 'center',
              headerRight,
              headerTitle: CurrentProgress
            }}
          />
          <Stack.Screen
            name='complete'
            component={CompleteScreen}
            options={{
              headerStyle,
              title: t('completeScreen.title'),
              headerBackVisible: false,
              headerTitleAlign: 'center',
              headerRight,
              headerTitle: CurrentProgress
            }}
          />
          <Stack.Screen
            name='profile'
            component={ProfileScreen}
            options={{
              headerStyle,
              title: profileScreenTitle,
              headerBackVisible: false,
              headerTitleAlign: 'center',
              headerLeft: () => (<BackButton icon='arrow-left' />),
              headerTitle: () => renderTitleTts(profileScreenTitle),
              headerRight: () => (<></>)
            }}
          />
          <Stack.Screen
            name='achievements'
            component={AchievementsScreen}
            options={{
              headerStyle,
              title: achievementScreenTitle,
              headerBackVisible: false,
              headerTitleAlign: 'center',
              headerLeft: () => (<BackButton icon='arrow-left' />),
              headerTitle: () => renderTitleTts(achievementScreenTitle),
              headerRight: () => (<></>)
            }}
          />
        </>
      )
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
            title: welcomeTitle,
            headerStyle,
            headerTitleAlign: 'center',
            headerTitle: () => renderTitleTts(welcomeTitle)
          }}
        />
        <Stack.Screen
          name='termsAndConditions'
          component={TermsAndConditionsScreen}
          options={{
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
            title: registerTitle,
            headerStyle,
            headerTitleAlign: 'center',
            headerBackTitleVisible: false,
            headerTitle: () => renderTitleTts(restoreTitle)
          }}
        />
      </>
    )
  }

  const screenOptions = Platform.select({
    ios: {
      cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
      cancelButtonText: 'foo',
      contentStyle: {
        padding: 0,
        margin: 0
      }
    },
    android: {
      cardStyleInterpolator: CardStyleInterpolators.forRevealFromBottomAndroid,
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

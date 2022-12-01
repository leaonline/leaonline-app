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
  const { userToken } = state

  const renderScreens = () => {
    if (userToken) {
      const headerRight = () => (<ProfileButton route='profile' />)
      const mapScreenTitle = t('mapScreen.title')
      const profileScreenTitle = t('profileScreen.headerTitle')
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
              headerTitle: () => (<Tts align='center' text={profileScreenTitle} />),
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
          options={{ title: welcomeTitle, headerStyle, headerTitle: () => (<Tts text={welcomeTitle} />) }}
        />
        <Stack.Screen
          name='termsAndConditions'
          component={TermsAndConditionsScreen}
          options={{
            title: tcTitle,
            headerStyle,
            headerBackTitleVisible: false,
            headerTitle: () => (<Tts align='center' text={tcTitle} />)
          }}
        />
        <Stack.Screen
          name='registration'
          component={RegistrationScreen}
          options={{
            title: registerTitle,
            headerStyle,
            headerBackTitleVisible: false,
            headerTitle: () => (<Tts align='center' text={registerTitle} />)
          }}
        />
        <Stack.Screen
          name='restore'
          component={RestoreScreen}
          options={{
            title: registerTitle,
            headerStyle,
            headerBackTitleVisible: false,
            headerTitle: () => (<Tts align='center' text={restoreTitle} />)
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
      <NavigationContainer onReady={props.onLayout}>
        <Stack.Navigator screenOptions={screenOptions} screenListeners={screenListeners}>
          {renderScreens()}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  )
}

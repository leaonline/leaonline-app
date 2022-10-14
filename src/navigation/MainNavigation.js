import React from 'react'
import { CardStyleInterpolators } from '@react-navigation/stack'
import { AuthContext } from '../contexts/AuthContext'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { AuthDecisionScreen } from '../screens/auth/AuthDecisionScreen'
import TermsAndConditionsScreen from '../screens/auth/TermsAndConditionsScreen'
import RegistrationScreen from '../screens/auth/RegistrationScreen'
import HomeScreen from '../screens/home/HomeScreen'
import MapScreen from '../screens/map/MapScreen'
import DimensionScreen from '../screens/map/DimensionScreen'
import UnitScreen from '../screens/unit/UnitScreen'
import ProfileScreen from '../screens/profile/ProfileScreen'
import CompleteScreen from '../screens/CompleteScreen'
import { useTranslation } from 'react-i18next'
import { useLogin } from '../hooks/useLogin'
import { TTSengine } from '../components/Tts'

const Tts = TTSengine.component()

/**
 * StackNavigator navigates between screens in a push/pop fashion.
 * We use left-to-right / right-to-left transitions as animations.

 * @category  Controller
 * @type {StackNavigator}
 * @component
 * @returns {JSX.Element}
 */
const Stack = createNativeStackNavigator()

export const MainNavigation =  (props) => {
  const { t } = useTranslation()
  const { state, authContext } = useLogin()
  const { userToken } = state
  const welcomeTitle = t('welcomeScreen.title')

  const renderScreens = () => {
    if (userToken) return (
      <>
        <Stack.Screen name='Home' component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name='Map' component={MapScreen} options={{ headerShown: false }} />
        <Stack.Screen name='Dimension' component={DimensionScreen} options={{ headerShown: false }} />
        <Stack.Screen name='Unit' component={UnitScreen} options={{ headerShown: false }} />
        <Stack.Screen name='Profile' component={ProfileScreen} options={{ title: t('profileScreen.headerTitle') }} />
        <Stack.Screen name='Complete' component={CompleteScreen} options={{ headerShown: false }} />
      </>
    )

    return (
      <>
        <Stack.Screen
          name='authDecision'
          component={AuthDecisionScreen}
          options={{ title: welcomeTitle,  headerTitle: () => (<Tts text={welcomeTitle} align='center' />) }}
        />
        <Stack.Screen
          name='termsAndConditions'
          component={TermsAndConditionsScreen}
          options={{ headerTitle: () => (<Tts text={t('TandCScreen.headerTitle')} />) }}
        />
      </>
    )
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer onReady={props.onLayout}>
        <Stack.Navigator screenOptions={{ cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS }}>
          {renderScreens()}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  )
}

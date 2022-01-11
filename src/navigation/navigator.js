import React from 'react'
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'

import WelcomeScreen from '../screens/WelcomeScreen'
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen'
import HomeScreen from '../screens/HomeScreen'
import MapScreen from '../screens/MapScreen'
import DimensionScreen from '../screens/DimensionScreen'
import UnitScreen from '../screens/UnitScreen'
import RegistrationScreen from '../screens/RegistrationScreen'
import ProfileScreen from '../screens/ProfileScreen'
import CompleteScreen from '../screens/CompleteScreen'

import { useTranslation } from 'react-i18next'

/**
 * AppNavigator navigates between screens.
 * @type {NavigationNavigator}
 * @component
 */
const Stack = createStackNavigator()

export default function navigator () {
  const { t } = useTranslation()
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
      }}
      >
        <Stack.Screen name='Welcome' component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name='TandC' component={TermsAndConditionsScreen} options={{ title: t('TandCScreen.headerTitle'), headerLeft: () => null }} />
        <Stack.Screen name='Registration' component={RegistrationScreen} options={{ title: t('registrationScreen.headerTitle'), headerLeft: () => null }} />
        <Stack.Screen name='Home' component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name='Map' component={MapScreen} options={{ headerShown: false }} />
        <Stack.Screen name='Dimension' component={DimensionScreen} options={{ headerShown: false }} />
        <Stack.Screen name='Unit' component={UnitScreen} options={{ headerShown: false }} />
        <Stack.Screen name='Profile' component={ProfileScreen} options={{ title: t('profileScreen.headerTitle') }} />
        <Stack.Screen name='Complete' component={CompleteScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

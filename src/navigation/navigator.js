import React from 'react'
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'

import WelcomeScreen from '../screens/WelcomeScreen'
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen'
import HomeScreen from '../screens/home/HomeScreen'
import MapScreen from '../screens/map/MapScreen'
import DimensionScreen from '../screens/map/DimensionScreen'
import UnitScreen from '../screens/unit/UnitScreen'
import RegistrationScreen from '../screens/RegistrationScreen'
import ProfileScreen from '../screens/profile/ProfileScreen'
import CompleteScreen from '../screens/complete/CompleteScreen'

import { useTranslation } from 'react-i18next'

/**
 * StackNavigator navigates between screens in a push/pop fashion.
 * We use left-to-right / right-to-left transitions as animations.

 * @category  Controller
 * @type {StackNavigator}
 * @component
 * @returns {JSX.Element}
 */
const Stack = createStackNavigator()

export default function navigator (props) {
  const { t } = useTranslation()

  // TODO use https://reactnavigation.org/docs/auth-flow

  if (props.loggedIn) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
        }}
        >
          <Stack.Screen name='Home' component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name='Map' component={MapScreen} options={{ headerShown: false }} />
          <Stack.Screen name='Dimension' component={DimensionScreen} options={{ headerShown: false }} />
          <Stack.Screen name='Unit' component={UnitScreen} options={{ headerShown: false }} />
          <Stack.Screen name='Profile' component={ProfileScreen} options={{ title: t('profileScreen.headerTitle') }} />
          <Stack.Screen name='Complete' component={CompleteScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    )
  } else {
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
}

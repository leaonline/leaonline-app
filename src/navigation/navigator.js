import { createStackNavigator } from 'react-navigation-stack'
import { createAppContainer } from 'react-navigation'

import SplashScreen from '../screens/SplashScreen'
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen'
import HomeScreen from '../screens/HomeScreen'
import MapScreen from '../screens/MapScreen'
import UnitScreen from '../screens/UnitScreen'
import RegistrationScreen from '../screens/RegistrationScreen'
import ProfileScreen from '../screens/ProfileScreen'
import CompleteScreen from '../screens/CompleteScreen'

/**
 * WizardNavigator navigates between screens.
 * @type {NavigationNavigator}
 * @component
 */
const WizardNavigator = createStackNavigator({
  SplashScreen: SplashScreen,
  TandC: TermsAndConditionsScreen,
  Registration: RegistrationScreen,
  Home: HomeScreen,
  Map: MapScreen,
  Unit: UnitScreen,
  Profile: ProfileScreen,
  Complete: CompleteScreen
},
{ transparentCard: true })

export default createAppContainer(WizardNavigator)

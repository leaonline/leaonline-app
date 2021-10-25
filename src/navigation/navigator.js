import { createStackNavigator } from 'react-navigation-stack'
import { createAppContainer } from 'react-navigation'

import WelcomeScreen from '../screens/WelcomeScreen'
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen'
import HomeScreen from '../screens/HomeScreen'
import OverviewScreen from '../screens/OverviewScreen'
import TaskScreen from '../screens/TaskScreen'
import RegistrationScreen from '../screens/RegistrationScreen'
import ProfileScreen from '../screens/ProfileScreen'

/**
 * WizardNavigator navigates between screens.
 * @type {NavigationNavigator}
 * @component
 */
const WizardNavigator = createStackNavigator({
  WelcomeScreen: WelcomeScreen,
  TandC: TermsAndConditionsScreen,
  Registration: RegistrationScreen,
  Home: HomeScreen,
  Overview: OverviewScreen,
  Task: TaskScreen,
  Profile: ProfileScreen
})

export default createAppContainer(WizardNavigator)

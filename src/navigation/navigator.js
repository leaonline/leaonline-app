import { createStackNavigator } from 'react-navigation-stack'
import { createAppContainer } from 'react-navigation'

import WelcomeScreen from '../screens/WelcomeScreen'
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen'
import RegistrationScreen from '../screens/RegistrationScreen'

/**
 * WizardNavigator navigates between screens.
 * @type {NavigationNavigator}
 * @component
 */
const WizardNavigator = createStackNavigator({
  WelcomeScreen: WelcomeScreen,
  TandC: TermsAndConditionsScreen,
  Registration: RegistrationScreen
})

export default createAppContainer(WizardNavigator)

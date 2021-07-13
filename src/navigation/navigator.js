import { createStackNavigator } from 'react-navigation-stack'
import { createAppContainer } from 'react-navigation'

import WelcomeScreen from '../screens/WelcomeScreen'
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen'
import RegistrationScreen from '../screens/RegistrationScreen'

const WizardNavigator = createStackNavigator({
  WelcomeScreen: WelcomeScreen,
  TandC: TermsAndConditionsScreen,
  Registration: RegistrationScreen
})

export default createAppContainer(WizardNavigator)

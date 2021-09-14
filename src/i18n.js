import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: {
      // Alert message
      'alert message title': 'Stop',
      'alert message navigation': 'Please wait until the end of the recording or end it prematurely',
      'alert message checkBox': 'You must accept the terms and conditions to continue',
      // WelcomeScreen
      'Welcome to lea': 'Welcome to lea online',
      // TandCScreen
      'TandC HeaderTitle': 'General terms and conditions',
      'TandC Text': 'I hereby agree to the following conditions ...',
      'CheckBox Text': 'I have read and agree to the general terms and conditions',
      // RegistrationScreen
      'RegistrationScreen HeaderTitle': 'Registration'
    }
  },
  de: {
    translation: {
      // Alert message
      'alert message title': 'Stop',
      'alert message navigation': 'Bitte warten Sie bis zu Ende gesprochen wurde oder beenden Sie es vorzeitig',
      'alert message checkBox': 'Sie müssen die Allgemeinen Geschäftsbedingungen akzeptieren, um fortzufahren',
      // WelcomeScreen
      'Welcome to lea': 'Herzlich Willkommen zu lea online',
      // TandCScreen
      'TandC HeaderTitle': 'Allgemeine Geschäftsbedingungen',
      'TandC Text': 'Hiermit stimme ich folgenden Bedingungen zu ...',
      'CheckBox Text': 'Ich habe die allgemeinen Geschäftsbedingungen gelesen und stimme ihnen zu',
      // RegistrationScreen
      'RegistrationScreen HeaderTitle': 'Registrierung'
    }
  }
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'de', // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  })

export default i18n

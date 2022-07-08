import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)

/**
 * @private
 */
const resources = {
  en: {
    alert: {
      title: 'Stop',
      navText: 'Please wait until the end of the recording or end it prematurely',
      checkBox: 'You must accept the terms and conditions to continue'
    },
    welcomeScreen: {
      text: 'Welcome to lea online'
    },
    registrationScreen: {
      headerTitle: 'Create user account',
      form: {
        text: 'To use the lea app, you need to create an account. However, it is completely anonymous. You can delete your account at any time.',
        placeholder: 'Your email address',
        register: 'Create my account now'
      },
      registering: 'Your account is created',
      complete: 'Your account has been created successfully. To restore your account, you can write down the following codes. You can also retrieve the codes later in your profile.'
    },
    TandCScreen: {
      headerTitle: 'General terms and conditions',
      text: 'I hereby agree to the following conditions ...',
      checkBoxText: 'I have read and agree to the general terms and conditions'
    },
    homeScreen: {
      text: 'Welcome! Please select an area.'
    },
    profileScreen: {
      headerTitle: 'Your Profile',
      progress: 'Overall progress',
      title: 'My successes'
    },
    mapScreen: {
      stage: 'Stage'
    },
    unitScreen: {
      story: {
        continue: 'Start task'
      },
      actions: {
        check: 'Check',
        next: 'Continue',
        complete: 'Go to next task'
      },
      abort: {
        question: 'Do you really want to abort this exercise?',
        abort: 'Cancel',
        continue: 'Continue'
      }
    },
    completeScreen: {}
  },
  de: {
    alert: {
      title: 'Stop',
      navText: 'Bitte warten Sie bis zu Ende gesprochen wurde oder beenden Sie es vorzeitig',
      checkBox: 'Sie müssen die Allgemeinen Geschäftsbedingungen akzeptieren, um fortzufahren'
    },
    welcomeScreen: {
      text: 'Herzlich Willkommen zu lea online'
    },
    registrationScreen: {
      headerTitle: 'Nutzerkonto anlegen',
      form: {
        text: 'Um die lea App nutzen zu können, müssen Sie ein Konto anlegen. Es ist jedoch vollkommen anonym. Sie können ihr Konto jederzeit wieder löschen.',
        placeholder: 'Ihre Email-Addresse',
        register: 'Mein Konto jetzt anlegen'
      },
      registering: 'Ihr Konto wird angelegt',
      complete: 'Ihr Konto wurde erfolgreich angelegt. Zur Wiederherstellung Ihres Kontos können Sie sich die folgenden Codes notieren. Sie können die Codes auch später noch in Ihrem Profil abrufen.'
    },
    TandCScreen: {
      headerTitle: 'Allgemeine Geschäftsbedingungen',
      text: 'Hiermit stimme ich folgenden Bedingungen zu ...',
      checkBoxText: 'Ich habe die allgemeinen Geschäftsbedingungen gelesen und stimme ihnen zu'
    },
    homeScreen: {
      text: 'Herzlich Willkommen! Bitte wähle einen Bereich.'
    },
    profileScreen: {
      headerTitle: 'Dein Profil',
      progress: 'Gesamter Fortschritt',
      title: 'Meine Erfolge'
    },
    mapScreen: {
      stage: 'Level'
    },
    unitScreen: {
      story: {
        continue: 'Aufgabe starten'
      },
      actions: {
        check: 'Überprüfen',
        next: 'Weiter',
        complete: 'Zur nächsten Aufgabe'
      },
      abort: {
        question: 'Willst du diese Übung wirklich abbrechen?',
        abort: 'Abbrechen',
        continue: 'Fortsetzen'
      }
    },
    completeScreen: {}
  }
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    compatibilityJSON: 'v3',
    resources,
    keySeparator: false,
    nsSeparator: '.',
    lng: 'de', // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  })

/**
 * @private
 */
export default i18n

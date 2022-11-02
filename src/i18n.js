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
    common: {
      yes: 'Yes',
      no: 'No',
      continue: 'Continue'
    },
    connecting: {
      title: 'You are offline. I\'m trying to connect.'
    },
    actions: {
      back: 'Back',
      close: 'Close'
    },
    alert: {
      title: 'Stop',
      navText: 'Please wait until the end of the recording or end it prematurely',
      checkBox: 'You must accept the terms and conditions to continue',
      approve: 'Ok'
    },
    welcomeScreen: {
      text: 'Welcome to lea.\u00ADonline'
    },
    registrationScreen: {
      headerTitle: 'Create user account',
      form: {
        text: 'To use the lea app, you need to create an account. However, it is completely anonymous. You can delete your account at any time.',
        placeholder: 'Your email address',
        email: 'The email address is optional and will only be used to restore the account',
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
      headerTitle: 'My account',
      progress: 'Overall progress',
      title: 'My achievements'
    },
    accountInfo: {
      whyRestore: 'Use these codes to restore your account. If you lose access to your device you can continue with them.',
      signOut: 'Sign out',
      delete: 'Delete my account'
    },
    mapScreen: {
      title: 'Übersicht',
      stage: 'Stage',
      notAvailable: 'The overview cannot be downloaded currently.'
    },
    dimensionScreen: {
      instructions: 'Please select a topic'
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
        abort: 'Abort exercise',
        continue: 'Continue exercise'
      },
      allTrue: 'Great!'
    },
    completeScreen: {}
  },
  de: {
    common: {
      yes: 'Ja',
      no: 'Nein',
      continue: 'Weiter'
    },
    connecting: {
      title: 'Du bist nicht mit dem Internet verbunden.'
    },
    actions: {
      back: 'Zurück',
      close: 'Schließen'
    },
    alert: {
      title: 'Stop',
      navText: 'Bitte warten Sie bis zu Ende gesprochen wurde oder beenden Sie es vorzeitig',
      checkBox: 'Sie müssen die Allgemeinen Geschäfts\u00ADbedingungen akzeptieren, um fortzufahren',
      approve: 'Ok'
    },
    welcomeScreen: {
      title: 'Willkommen',
      text: 'Herzlich Willkommen zu lea\u00AD.online! Bitte stelle zunächst die Sprach\u00ADausgabe ein.',
      continue: 'Wenn du damit zufrieden bist, tippe auf "weiter".'
    },
    registrationScreen: {
      headerTitle: 'Nutzerkonto anlegen',
      form: {
        text: 'Um die lea App nutzen zu können, müssen Sie ein Konto anlegen. Es ist jedoch vollkommen anonym. Sie können ihr Konto jederzeit wieder löschen.',
        placeholder: 'Ihre Email-Addresse',
        email: 'Die Angabe der Email-Adresse ist optional und wird nur zur Wiederherstellung des Kontos verwendet',
        register: 'Mein Konto jetzt anlegen'
      },
      registering: 'Ihr Konto wird angelegt',
      complete: 'Ihr Konto wurde erfolgreich angelegt. Zur Wiederherstellung Ihres Kontos können Sie sich die folgenden Codes notieren. Sie können die Codes auch später noch in Ihrem Profil abrufen.'
    },
    TandCScreen: {
      headerTitle: 'Nutzungsbedingungen',
      text: 'Bitte nimmt dir kurz etwas Zeit für unsere Nutzungsbedingungen.',
      checkBoxText: 'Ich habe die Nutzungs\u00ADbedingungen verstanden und stimme ihnen zu.',
      agreeResearch: 'Optional: Ich stimme der Nutzung meiner Daten für Forschung und Entwicklung zu.',
      newUser: 'Ich bin neu',
      restoreWithCode: 'Ich habe einen Anmelde\u00ADcode'
    },
    restoreScreen: {
      title: 'Mit Code anmelden',
      instructions: 'Bitte gib hier deine Codes ein, um dein Nutzerkonto wiederherzustellen.',
      checkCode: 'Nutzerkonto wiederherstellen',
      noCode: 'Ich habe keinen Code oder habe ihn vergessen'
    },
    homeScreen: {
      title: 'Startseite',
      text: 'Herzlich Willkommen! Bitte wähle einen Bereich.'
    },
    profileScreen: {
      headerTitle: 'Mein Profil',
      progress: 'Gesamter Fortschritt',
      title: 'Meine Erfolge'
    },
    accountInfo: {
      restoreCodes: 'Profil sichern',
      whyRestore: 'Mit diesen Codes kannst du dein Profil sichern. Notiere sie dir oder mache ein Foto.',
      signOut: 'Profil abmelden',
      delete: 'Profil endgültig löschen'
    },
    mapScreen: {
      stage: 'Level',
      notAvailable: 'Die Übersicht kann derzeit nicht geladen werden.'
    },
    dimensionScreen: {
      instructions: 'Bitte wähle einen Bereich'
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
        abort: 'Übung abbrechen',
        continue: 'Übung fortsetzen'
      },
      allTrue: 'Super!'
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

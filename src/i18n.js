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
    promise: {
      timedOut: 'Could not load content in time.'
    },
    errors: {
      restart: 'Please restart the app.',
      fallback: 'An unknown error occurred.'
    },
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
      title: 'Welcome',
      text: 'Welcome to lea.\u00ADonline. First, configure the language, please.',
      continue: 'Click continue, once the language settings satisfy your needs.'
    },
    registrationScreen: {
      title: 'Create user account',
      creating: 'Your account is created'
    },
    TandCScreen: {
      headerTitle: 'Terms and conditions',
      text: 'Please take your time to investigate our terms and conditions.',
      checkBoxText: 'I understand and agree to the given terms and conditions.',
      agreeResearch: 'Optional: I agree to participate in anonymous research and send research data',
      newUser: 'I am a new user',
      restoreWithCode: 'I have a code'
    },
    restoreScreen: {
      title: 'Sign in with code',
      instructions: 'Please enter your codes to restore your account.',
      checkCode: 'Restore account',
      noCode: 'I have no codes or I lost them'
    },
    restore: {
      failed: 'Restore account failed. Please check your codes.'
    },
    homeScreen: {
      title: 'Home',
      text: 'Welcome! Please select a topic.'
    },
    profileScreen: {
      headerTitle: 'My account',
      progress: 'Overall progress',
      title: 'My achievements'
    },
    accountInfo: {
      title: 'Account options',
      whyRestore: 'Use these codes to restore your account. If you lose access to your device you can continue with them.',
      signOut: 'Sign out',
      delete: 'Delete my account',
      restoreCodes: 'Save my account'
    },
    mapScreen: {
      stage: 'Stage',
      notAvailable: 'The overview cannot be downloaded currently.'
    },
    dimensionScreen: {
      instructions: 'Please select a subject'
    },
    unitScreen: {
      story: {
        continue: 'Start task'
      },
      actions: {
        check: 'Check',
        next: 'Continue',
        complete: 'Go to next task',
        finish: 'Finish'
      },
      abort: {
        question: 'Do you really want to abort this exercise?',
        abort: 'Abort exercise',
        continue: 'Continue exercise'
      },
      allTrue: 'Great!'
    },
    completeScreen: {
      congratulations: 'Congratulations!',
      correctScores: 'You have {{count}} correct answers!',
      continue: 'Continue to the overview map'
    },
    tts: {
      settings: 'My voice settings',
      voice: 'Voice {{value}}',
      speedText: 'I will speak for you {{value}}',
      speed: {
        slow: 'slow',
        medium: 'normal',
        fast: 'fast'
      }
    },
    item: {
      correctResponse: 'The correct answer is: {{value}}'
    }
  },
  de: {
    promise: {
      timedOut: 'Konnte Inhalte nicht laden.'
    },
    errors: {
      restart: 'Bitte schließe die App und starte sie neu.',
      fallback: 'Es ist ein unerwarteter Fehler aufgetreten.'
    },
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
      title: 'Profil anlegen',
      creating: 'Dein Profil wird jetzt angelegt'
    },
    TandCScreen: {
      headerTitle: 'Nutzungsbedingungen',
      text: 'Bitte nimm dir kurz etwas Zeit für unsere Nutzungsbedingungen.',
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
    restore: {
      failed: 'Wiederherstellung fehlgeschlagen. Bitte prüfe, ob dein code richtig geschrieben ist.'
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
      title: 'Profil Optionen',
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
        complete: 'Zur nächsten Aufgabe',
        finish: 'Bearbeitung abschließen'
      },
      abort: {
        question: 'Willst du diese Übung wirklich abbrechen?',
        abort: 'Übung abbrechen',
        continue: 'Übung fortsetzen'
      },
      allTrue: 'Super!'
    },
    completeScreen: {
      congratulations: 'Du hast es geschafft!',
      correctScores: 'Du hast {{count}} richtige Lösungen!',
      continue: 'Weiter zur Aufgabenübersicht'
    },
    tts: {
      settings: 'Meine Spracheinstellungen',
      voice: 'Stimme {{value}}',
      speedText: 'Ich spreche den text für dich {{value}}',
      speed: {
        slow: 'Lang\u00ADsam',
        medium: 'Normal',
        fast: 'Schnell'
      }
    },
    item: {
      correctResponse: 'Die richtige Antwort lautet: {{value}}'
    }
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

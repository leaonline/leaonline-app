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
      close: 'Close',
      cancel: 'Cancel'
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
      restoreWithCode: 'I have a code',
      showTerms: 'Show terms and conditions',
      hideTerms: 'Hide terms and conditions'
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
      restore: {
        title: 'Save my account',
        instructions: 'Use these codes to restore your account. If you lose access to your device you can continue with them.'
      },
      signOut: {
        title: 'Sign out',
        instructions: 'Signs you out. Make sure you have obtained your restore codes via "Save my account", before you continue.'
      },
      deleteAccount: {
        title: 'Delete my account',
        instructions: 'This deletes your account and all files you have produced. Once complete, you will not be able to restore it. Are you sure to delete your account?'
      }
    },
    mapScreen: {
      stage: 'Stage',
      loadData: 'Loading data',
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
      close: 'Schließen',
      cancel: 'Abbrechen'
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
      headerTitle: 'Nutzungs\u00ADbedingungen',
      text: 'Bitte nimm dir kurz etwas Zeit für unsere Nutzungs\u00ADbedingungen.',
      checkBoxText: 'Ich habe die Nutzungs\u00ADbedingungen verstanden und stimme ihnen zu.',
      agreeResearch: 'Optional: Ich stimme der Nutzung meiner Daten für Forschung und Entwicklung zu.',
      newUser: 'Ich bin neu',
      restoreWithCode: 'Ich habe einen Anmelde\u00ADcode',
      showTerms: 'Nutzungs\u00ADbedingungen anzeigen',
      hideTerms: 'Nutzungs\u00ADbedingungen schließen'
    },
    restoreScreen: {
      title: 'Mit Code anmelden',
      instructions: 'Bitte gib hier deine Codes ein, um dein Nutzer\u00ADkonto wiederher\u00ADzustellen.',
      checkCode: 'Nutzer\u00ADkonto wiederher\u00ADstellen',
      noCode: 'Ich habe keinen Code oder habe ihn vergessen'
    },
    restore: {
      failed: 'Wiederher\u00ADstellung fehlge\u00ADschlagen. Bitte prüfe, ob dein code richtig geschrieben ist.'
    },
    homeScreen: {
      title: 'Start\u00ADseite',
      text: 'Herzlich Willkommen! Bitte wähle einen Bereich.'
    },
    profileScreen: {
      headerTitle: 'Mein Profil',
      progress: 'Gesamter Fortschritt',
      achievements: {
        title: 'Meine Erfolge'
      }
    },
    accountInfo: {
      title: 'Profil Optionen',
      restore: {
        title: 'Profil sichern',
        instructions: 'Mit diesen Codes kannst du dein Profil sichern und auf diesem oder einem anderen Gerät wiederher\u00ADstellen. Notiere sie dir oder mache ein Foto.'
      },
      signOut: {
        title: 'Abmelden',
        instructions: 'Meldet dich als aktiver Nutzer ab. Du benötigst zum wieder anmelden drei codes. Diese bekommst du über die Funktion "Profil sichern". Möchtest du dich jetzt abmelden?'
      },
      deleteAccount: {
        title: 'Profil löschen',
        instructions: 'Dein Profil wird zusammen mit deinen Antworten und deinem Fortschritt endgültig gelöscht. Sie können danach nicht wiederher\u00ADgestellt werden. Möchtest diese Daten jetzt löschen?'
      }
    },
    mapScreen: {
      stage: 'Level',
      loadData: 'Daten werden geladen',
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
        question: 'Willst du die Übung wirklich abbrechen?',
        abort: 'Abbrechen',
        continue: 'Fortsetzen'
      },
      allTrue: 'Super!'
    },
    completeScreen: {
      congratulations: 'Du hast es geschafft!',
      correctScores: 'Du hast {{count}} richtige Lösungen!',
      continue: 'Weiter zur Aufgaben\u00ADübersicht'
    },
    tts: {
      settings: 'Meine Sprach\u00ADeinstellungen',
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

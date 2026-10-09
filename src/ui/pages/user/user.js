import { dataTarget } from '../../../utils/dataTarget'
import { createTemplate } from '../../templates/createTemplate'
import { Routes } from '../../routing/Routes'
import '../../components/switch/switch'
import './user.html'

const views = Object.values({
  secure: {
    href: Routes.secureAccount.path(),
    label: Routes.secureAccount.label,
    icon: 'shield'
  }
})

createTemplate({
  template: Template.userProfile,
  tts: true,
  language: true,
  translations: {
    de: () => import('./i18n/de')
  },
  helpers: {
    views () {
      return views
    }
  },
  events: {
    'change .toggle-btn' (event) {
      const target = dataTarget(event)
      const value = event.target.checked
      console.debug({ target, value })
    }
  }
})

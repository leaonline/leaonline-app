import { dataTarget } from '../../../utils/dataTarget'
import { createTemplate } from '../../templates/createTemplate'
import '../../components/switch/switch'
import './user.html'

createTemplate({
  template: Template.userProfile,
  tts: true,
  language: true,
  translations: {
    de: () => import('./i18n/de')
  },
  events: {
    'change .toggle-btn' (event) {
      const target=dataTarget(event)
      const value = event.target.checked
      console.debug({ target, value })
    }
  }
})

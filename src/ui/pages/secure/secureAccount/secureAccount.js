import './secureAccount.html'
import { createTemplate } from '../../../templates/createTemplate'
import { AppStorage } from '../../../storage/AppStorage'

createTemplate({
  template: Template.secureAccount,
  helpers: {
    restoreCode() {
      return AppStorage.get('restore')
    },
  },
})

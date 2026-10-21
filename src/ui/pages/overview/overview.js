import { Template } from 'meteor/templating'
import { Field } from '../../../contexts/content/Field'
import { loadAllContentDocs } from '../../loading/loadAllContentDocs'
import { getLocalCollection } from '../../../api/utils/getLocalCollection'
import '../../components/container/container'
import './overview.scss'
import './overview.html'
import { createTemplate } from '../../templates/createTemplate'

createTemplate({
  debug: console.debug,
  template: Template.overview,
  contexts: [Field],
  language: true,
  tts: true,
  translations: {
    de: () => import('./i18n/de'),
  },
  onDependenciesComplete: async () => {
    await loadAllContentDocs({
      context: Field,
      // unlessExists: true
    })
  },
  helpers: {
    fields() {
      return getLocalCollection(Field.name).find()
    },
  },
})

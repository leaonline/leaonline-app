import { Template } from 'meteor/templating'
import { Field } from '../../../contexts/content/Field'
import { fatal } from '../../components/fatal/fatal'
import { loadAllContentDocs } from '../../loading/loadAllContentDocs'
import { getLocalCollection } from '../../../api/utils/getLocalCollection'
import { dataTarget } from '../../../utils/dataTarget'
import '../../components/container/container'
import './overview.scss'
import './overview.html'

Template.overview.onDestroyed(function () {
  const instance = this
  instance.state.clear()
})

Template.overview.onCreated(function () {
  const instance = this
  instance.initDependencies({
    contexts: [Field],
    language: true,
    tts: true,
    translations: {
      de: () => import('./i18n/de')
    },
    onComplete: async () => {
      try {
        await loadAllContentDocs({
          context: Field,
          // unlessExists: true
        })
      } catch (e) {
        instance.onError(e)
      }
      instance.state.set('dependenciesComplete', true)
    },
    onError: error => {
      fatal({ error })
      instance.state.set('dependenciesComplete', true)
    }
  })
})

Template.overview.helpers({
  loadComplete () {
    return Template.getState('dependenciesComplete')
  },
  error () {
    return Template.getState('error')
  },
  fields () {
    return getLocalCollection(Field.name).find()
  }
})

Template.overview.events({
  'click .field-btn' (event, templateInstance) {
    event.preventDefault()
    const fieldId = dataTarget(event)
    templateInstance.data.onSelected({ fieldId })
  }
})

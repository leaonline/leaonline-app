import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { Legal } from '../../../contexts/legal/Legal' // TODO load dynamic  depending on i18n locale
import settings from '../../../resources/i18n/de/routes'
import legalLanguage from './i18n/legalLanguage'
import { LeaMarkdown } from '../../../api/markdown/LeaMarkdown'
import { legalRenderer } from './markdown/legalRenderer'
import 'meteor/leaonline:ui/components/soundbutton/soundbutton'
import { i18n } from '../../../api/i18n/I18n'
import './legal.html'
import './legal.scss'

const legalRendererName = 'legalRenderer'

LeaMarkdown.addRenderer(legalRendererName, legalRenderer())

Template.legal.onCreated(function () {
  const instance = this

  instance.initDependencies({
    contexts: [Legal],
    translations: legalLanguage,
    tts: true,
    onComplete: () => {
      instance.state.set('dependenciesComplete', true)
    }
  })

  instance.autorun(() => {
    const dependenciesComplete = instance.state.get('dependenciesComplete')
    if (!dependenciesComplete) { return }

    const data = Template.currentData()
    const { type } = data.params
    let originalType

    Object.entries(settings.legal).forEach(([key, value]) => {
      if (type === value) {
        originalType = key
      }
    })

    if (!originalType) {
      instance.state.set({
        error: new Error(i18n.get('pages.legal.unknownKey', { name: originalType }))
      })
    }

    Meteor.call(Legal.methods.get.name, { name: originalType }, (err, res) => {
      if (err) return instance.state.set({ error: err })

      LeaMarkdown.parse({
        input: res,
        renderer: legalRendererName
      })
        .then((content) => instance.state.set({ content }))
        .catch(error => {
          console.error(error)
          instance.state.set({ error })
        })

      instance.state.set({ type: originalType })
    })
  })
})

Template.legal.helpers({
  allComplete () {
    return Template.getState('dependenciesComplete') && Template.getState('content')
  },
  dependenciesComplete () {
    return Template.getState('dependenciesComplete')
  },
  content () {
    return Template.getState('content')
  },
  legalTitle () {
    const type = Template.getState('type')
    return `pages.legal.${type}`
  }
})

Template.legal.events({
  'click .back-button' (/* event, templateInstance */) {
    window.history.back()
  }
})

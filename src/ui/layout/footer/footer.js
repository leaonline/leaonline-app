import { Template } from 'meteor/templating'
import { Legal } from '../../../contexts/legal/Legal'
import { Logos } from '../../../contexts/logos/Logos'
import { createIssuesLink } from './createIssuesLink'
import './footer.html'

const legalRoutes = Object.keys(Legal.schema).map(key => {
  const value = Legal.schema[key]
  return {
    name: key,
    label: value.label
  }
})

Template.footer.onCreated(function () {
  const instance = this
  const params = new URLSearchParams(window.location.search)
  const tts = params.get('tts')
  const ttsIsActive = tts !== '0'

  setTimeout(() => {
    instance.initDependencies({
      tts: ttsIsActive,
      language: true,
      translations: {
        de: () => import('./i18n/de')
      },
      onComplete () {
        instance.state.set('dependenciesComplete', true)
      },
      onError (e) {
        console.error(e)
        instance.state.set('dependenciesComplete', true)
      }
    })
  }, 500)
})

Template.footer.onRendered(function () {
  const instance = this

  // defer logo loading until first rendering occurred
  Logos.methods.get.call((err, logoDoc) => {
    if (err) console.error(err)
    instance.state.set('logoDoc', logoDoc)
  })
})

Template.footer.helpers({
  loadComplete () {
    return Template.getState('dependenciesComplete')
  },
  logos () {
    const logoDoc = Template.getState('logoDoc')
    return logoDoc && logoDoc.footer
  },
  legalRoutes () {
    return legalRoutes
  },
  issuesLink () {
    return createIssuesLink({ url: window.location.href })
  }
})

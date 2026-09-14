import { Template } from 'meteor/templating'
import { fadeOut } from '../../../../utils/animationUtils'
import { dataTarget } from '../../../../utils/dataTarget'
import { asyncTimeout } from '../../../../utils/asyncTimeout'
import '../../../components/container/container'
import './welcome.scss'
import './welcome.html'


Template.welcome.onCreated(function () {
  const instance = this

  instance.initDependencies({
    language: true,
    tts: true,
    translations: {
      de: () => import('./i18n/de')
    },
    onComplete: () => {
      instance.state.set('dependenciesComplete', true)
    },
    onError: e => {
      // instance.data.onFail()
      instance.state.set('dependenciesComplete', true)
    }
  })
    instance.state.set('loadComplete', true)
})

Template.welcome.helpers({
  loadComplete () {
    return Template.instance().state.get('loadComplete')
  },
  dependenciesComplete () {
    return Template.instance().state.get('dependenciesComplete')
  },
  currentLogin () {
    return Template.getState('currentLogin')
  },
  isBeta () {
    return Template.instance().state.get('isBeta')
  },
  betaMessageOpen () {
    return Template.instance().state.get('betaMessageOpen')
  },
  intro () {
    return Template.instance().state.get('intro')
  },
  availableLogins () {
    return Template.instance().availableLogins
  },
  videoRequested () {
    return Template.getState('videoRequested')
  },
  loginTemplateLoaded () {
    return !Template.getState('loadingLoginTemplate')
  },
  loginTemplateData (ctx) {
    return {
      ...ctx,
      onSuccess: Template.instance().data.onSuccess
    }
  }
})

Template.welcome.events({
  'click .lea-login-btn': async (event, templateInstance) => {
    event.preventDefault()
    const type = dataTarget(event)
    const { load, action,...currentLogin } = templateInstance.availableLogins.find(l => l.name === type)
    if (!currentLogin) {
      // raise error
    }

    if (action) {
      const shouldContinue = await action()
      if (!shouldContinue) {
        return false
      }
    }

    const query = currentLogin.name.toLocaleLowerCase().replaceAll(' ', '-')
    setQueryParam({ login: encodeURIComponent(query) })
    templateInstance.state.set({ currentLogin, loadingLoginTemplate: true })
    await asyncTimeout(300)
    const element = templateInstance.$('.lea-login-method-card').get(0)
    try {
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'center' })
    }
    catch (e) {
      console.error(e)
    }
    if (load) { await load() }
    templateInstance.state.set({ loadingLoginTemplate: false })
  },
  'click .lea-cancel-login-btn': async (event, templateInstance) => {
    event.preventDefault()
    templateInstance.state.set({ currentLogin: null })
      setQueryParam({ login: null })
    await asyncTimeout(300)
    const element = templateInstance.$('.lea-login-list-card').get(0)
    try {
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'center' })
    } catch {}
  }
})


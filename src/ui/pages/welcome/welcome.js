import { Template } from 'meteor/templating'
import { fadeOut } from '../../../utils/animationUtils'
import { dataTarget } from '../../../utils/dataTarget'
import { asyncTimeout } from '../../../utils/asyncTimeout'
import '../../components/container/container'
import './welcome.scss'
import './welcome.html'
import { fatal } from '../../components/fatal/fatal'

let originalVideoHeight

const Logins = {
  new: {
    name: 'new',
    icon: 'rocket',
    color: 'primary'
  },
  /*
   qrcode: {
   name: 'qrcode'
   },
   email: {
   name: 'email',
   icon: 'envelope'
   },
   apple: {
   name: 'apple'
   },
   */
  google: {
    name: 'google',
    icon: 'google',
    action: (instance) => {
      Meteor.loginWithGoogle(error => {
        if (error) {
          return fatal({ error })
        }
        instance.data.onSuccess()
      })
    }
  },
  password: {
    name: 'password',
    icon: 'keyboard',
    template: 'loginWithPassword',
    load: () => import('./logins/password/loginWithPassword')
  }
}

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

  instance.availableLogins = Object.values(Logins).map(entry => {
    const label = `pages.welcome.logins.${entry.label ?? entry.name}`
    const info = `pages.welcome.infos.${entry.info ?? entry.name}`
    return {
      ...entry,
      label,
      info,
      tts: entry.tts ? `pages.welcome.logins.${entry.tts}` : label,
      icon: entry.icon ?? entry.name,
      color: entry.color ?? 'secondary',
      template: entry.template ?? 'notFound'
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

    templateInstance.state.set({ currentLogin, loadingLoginTemplate: true })
    await asyncTimeout(300)
    const element = templateInstance.$('.lea-login-method-card').get(0)
    try {
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'center' })
    } catch {}
    if (load) { await load() }
    templateInstance.state.set({ loadingLoginTemplate: false })
  },
  'click .lea-cancel-login-btn': async (event, templateInstance) => {
    event.preventDefault()
    templateInstance.state.set({ currentLogin: null })
    await asyncTimeout(300)
    const element = templateInstance.$('.lea-login-list-card').get(0)
    try {
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'center' })
    } catch {}
  },
  'click .lea-back-button' (event, templateInstance) {
    event.preventDefault()
    templateInstance.wizard.newCode(false)
    templateInstance.state.set('loginFail', false)
    templateInstance.$('.intro-video-container').animate({ height: originalVideoHeight }, 500, 'swing', () => {
      templateInstance.wizard.login(false)
    })
  },
  'click .to-overview-button' (event, templateInstance) {
    fadeOut('.lea-welcome-container', templateInstance, () => {
      templateInstance.data.next()
    })
  },
  'click .toggle-beta' (event, templateInstance) {
    event.preventDefault()

    // prevent multiple clicks here
    if (templateInstance.state.get('betaToggling')) {
      return
    }

    templateInstance.state.get('betaToggling', true)

    const betaMessageOpen = templateInstance.state.get('betaMessageOpen')
    const betaToggleComplete = () => {
      templateInstance.state.set('betaMessageOpen', !betaMessageOpen)
      templateInstance.state.get('betaToggling', false)
    }

    if (betaMessageOpen) {
      templateInstance.api.fadeOut('.beta-content', betaToggleComplete)
    }
    else {
      templateInstance.api.fadeIn('.beta-content', betaToggleComplete)
    }
  }
})


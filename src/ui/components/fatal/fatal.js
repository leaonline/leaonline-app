import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { ReactiveDict } from 'meteor/reactive-dict'
import { Random } from 'meteor/random'
import './fatal.html'
import { initFullTheme } from '../../layout/theme/initFullTheme'

const modalOpen = new ReactiveVar(false)
const errors = new ReactiveDict()

Template.fatal.onCreated(function () {
  const instance = this

  instance.initDependencies({
    language: true,
    translations: {
      de: () => import('./i18n/de')
    },
    loaders: [initFullTheme],
    onComplete: async () => {
      instance.state.set('dependenciesComplete', true)
    },
    onError (err) {
      console.error(err) // silently skip to keep messages displayed
      instance.state.set('dependenciesComplete', true)
    }
  })
})

Template.fatal.onRendered(function () {
  const instance = this

  instance.autorun(() => {
    const open = modalOpen.get()

    if (open && instance.state.get('dependenciesComplete')) {
      instance.$('#fatal-modal').modal('show')
    }
  })
})

Template.fatal.helpers({
  errors () {
    return Object.values(errors.all())
  },
  loadComplete () {
    return Template.getState('dependenciesComplete')
  }
})

Template.fatal.events({
  'hidden.bs.modal' () {
    errors.clear()
    modalOpen.set(false)
  }
})

export const fatal = ({ error, logToConsole }) => {
  const id = Random.id()
  if (logToConsole) console.error(error)
  errors.set(id, {
    message: error.message
  })

  if (!modalOpen.get()) {
    modalOpen.set(true)
  }
}

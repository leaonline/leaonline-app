import { Template } from 'meteor/templating'
import { fatal } from '../components/fatal/fatal'
import { errorToObject } from '../../utils/object/errorToObject'
import { noop } from '../../utils/noop'

/**
 *
 * @param param0 {object}
 * @param param0.template {Template}
 * @param param0.onCreated {function=} hook that runs before / in parallel of dependencies loading
 * @param param0.onDependenciesComplete {function=} hook that is called after dependencies are completed
 * @param param0.onRendered
 * @param param0.helpers
 * @param param0.events
 */
export const createTemplate = ({ template, language, contexts, tts, translations, onCreated, onDependenciesComplete, onError, onRendered, onDestroyed, helpers, events, debug = noop }) => {
  const _debug = (...args) => debug(`debug [${template.viewName}]:`, ...args)
  const handleError = ({ instance, error }) => {
    _debug(error)
    const obj = errorToObject(error)
    instance.state.set({ error: obj })
    fatal({ error })
    if (onError) onError({ instance, error })
  }

  template.onCreated(function () {
    const instance = this
    if (onCreated) {
      _debug('run onCreated hook')
      Promise.resolve(onCreated({ instance })).catch(handleError)
    }

    _debug('init dependencies')
    instance.initDependencies({ debug: _debug, contexts, language, tts, translations,
      onComplete: () => {
      _debug('dependencies complete')
        instance.state.set('dependenciesComplete', true)
        if (onDependenciesComplete) {
          _debug('run onDependenciesComplete hook')
          Promise.resolve(onDependenciesComplete({ instance })).catch(handleError)
        }
      },
      onError: error => {
          _debug('dependencies error')
        instance.state.set({ dependenciesComplete: true })
        handleError({ instance, error })
      }
    })
  })

  template.onRendered(function () {
    const instance = this
    if (onRendered) {
      _debug('run on rendered hook')
      Promise.resolve(onRendered({ instance })).catch(console.error)
    }
  })

  template.onDestroyed(function () {
    const instance = this
    if (onDestroyed) {
      _debug('run on destroyed hook')
      Promise.resolve(onDestroyed({ instance })).catch(console.error)
    }
  })

  template.helpers({
    dependenciesComplete () {
      return Template.getState('dependenciesComplete')
    },
    error () {
      return Template.getState('error')
    },
    ...helpers,
  })

  if (events) template.events(events)
}

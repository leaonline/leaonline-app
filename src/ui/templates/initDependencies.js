import { Blaze } from 'meteor/blaze'
import { Meteor } from 'meteor/meteor'
// if we use the autoload functionality we don't need to explicitly load basic
// and generic (stateless) templates, since they are loaded at runtime using
// dynamic imports.
let autoLoadEnabled = false

/**
 * This is a way to provide a Template-independent way of initializing
 * dependencies like i18n etc. that require a certain loading time.
 * @param translations
 * @param language
 * @param tts
 * @param contexts
 * @param loaders
 * @param onComplete
 * @param onError
 * @return {Blaze.TemplateInstance}
 */

Blaze.TemplateInstance.prototype.initDependencies =
  function ({ translations, tts = false, language = (tts || translations || false), contexts = [], loaders = [], onComplete, onError = e => console.error(e) }) {
    import { Components } from 'meteor/leaonline:ui/components/Components'

    if (!autoLoadEnabled) {
      Components.autoLoad()
      Components.contentPath(Meteor.settings.public.hosts.content.base)
      autoLoadEnabled = true
    }

    import { Router } from '../routing/Router'
    import { fatal } from '../components/fatal/fatal'
    import { initLanguage } from '../../api/i18n/initLanguage'
    import { initializeTTS } from '../../api/tts/initializeTTS'
    import { initClientContext } from '../../api/context/initClientContext'
    import { loadOnce } from '../loading/loadOnce'
    import { createLog } from '../../utils/createInfoLog'
    import { loadAllContentDocs } from '../loading/loadAllContentDocs'
    import { loadContentDoc } from '../loading/loadContentDoc'
    import { fadeOut, fadeIn } from '../../utils/animationUtils'
    import { hasProperty } from '../../utils/object/hasProperty'
    import { isDebugUser } from '../../api/accounts/isDebugUser'
    import { sendError } from '../../contexts/errors/api/sendError'
    import { callMethod } from '../../infrastructure/methods/callMethod'

    const instance = this
    const allComplete = []

    // create api to provide a consistent dev experience across all template
    // instances without tight coupling between the api and Template files
    // TODO maybe dynamically import api using loadOnce, too?
    instance.api = {}
    instance.api.info = createLog({
      name: instance.view.name,
      devOnly: true,
      type: 'info'
    })

    const logDebug = createLog({
      name: instance.view.name,
      type: 'debug',
      devOnly: false
    })

    const errorHandler = onError || createLog({
      name: instance.view.name,
      type: 'error',
      devOnly: false
    })
    instance.onError = errorHandler
    logDebug('initialize', { language, tts, contexts })

    Object.assign(instance.api, {
      queryParam: value => Router.queryParam(value),
      callMethod,
      loadAllContentDocs,
      loadContentDoc,
      hasProperty,
      isDebugUser,
      debug: (...args) => {
        if (isDebugUser()) {
          logDebug(...args)
        }
      },
      fadeOut: function (target, callback) {
        return fadeOut(target, instance, callback)
      },
      fadeIn: function (target, callback) {
        return fadeIn(target, instance, callback)
      },
      sendError: ({ error, isResponse }) => {
        sendError({
          error,
          isResponse,
          template: instance.view.name,
          failure: errorHandler
        })
      }
    })

    // if any context is added we initialize it immediately sync-style
    contexts.forEach(ctx => initClientContext(ctx))

    if (language) {
      allComplete.push(loadOnce(initLanguage, {
        onError: errorHandler,
        name: 'language'
      }))
    }

    if (tts) {
      allComplete.push(loadOnce(initializeTTS, {
        onError: errorHandler,
        name: 'tts'
      }))
    }

    if (loaders.length > 0) {
      allComplete.push(...(loaders.map(loader => loadOnce(loader, {
        onError: errorHandler
      }))))
    }

    if (allComplete.length === 0) {
      return onComplete()
    }

    const addTranslations = async () => {
      const { addToLanguage } = await import('../../api/i18n/addToLanguage')
      return addToLanguage(translations)
    }

    instance.autorun(c => {
      if (allComplete.every(rv => rv.get())) {
        c.stop()
        instance.api.info('call dependencies onComplete')
        if (translations) {
          addTranslations()
            .catch(e => {
              fatal({
                error: {
                  message: 'unknown',
                  original: e.message
                }
              })

              sendError({ error: e })
              errorHandler(e)
            })
            .then(() => {
              onComplete()
            })
        }
        else {
          onComplete()
        }
      }
    })

    return instance
  }

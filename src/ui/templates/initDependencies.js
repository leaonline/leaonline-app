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

Blaze.TemplateInstance.prototype.initDependencies = function ({
  translations,
  tts = false,
  language = tts || translations || false,
  contexts = [],
  loaders = [],
  onComplete,
  onError = (e) => console.error(e),
}) {
  const { Components } = require('meteor/leaonline:ui/components/Components')

  if (!autoLoadEnabled) {
    Components.autoLoad()
    Components.contentPath(Meteor.settings.public.hosts.content.base)
    autoLoadEnabled = true
  }

  const { Router } = require('../routing/Router')
  const { initClientContext } = require('../../api/context/initClientContext')
  const { fatal } = require('../components/fatal/fatal')
  const { initLanguage } = require('../../api/i18n/initLanguage')
  const { initializeTTS } = require('../../api/tts/initializeTTS')
  const { loadOnce } = require('../loading/loadOnce')
  const { createLog } = require('../../utils/createInfoLog')
  const { loadAllContentDocs } = require('../loading/loadAllContentDocs')
  const { loadContentDoc } = require('../loading/loadContentDoc')
  const { fadeOut, fadeIn } = require('../../utils/animationUtils')
  const { hasProperty } = require('../../utils/object/hasProperty')
  const { isDebugUser } = require('../../api/accounts/isDebugUser')
  const { sendError } = require('../../contexts/errors/api/sendError')
  const { callMethod } = require('../../infrastructure/methods/callMethod')
  const { showModal } = require('../utils/showModal')
  const allComplete = []

  // create api to provide a consistent dev experience across all template
  // instances without tight coupling between the api and Template files
  // TODO maybe dynamically import api using loadOnce, too?
  this.api = {}
  this.api.info = createLog({
    name: this.view.name,
    devOnly: true,
    type: 'info',
  })

  const logDebug = createLog({
    name: this.view.name,
    type: 'debug',
    devOnly: false,
  })

  const errorHandler =
    onError ||
    createLog({
      name: this.view.name,
      type: 'error',
      devOnly: false,
    })
  this.onError = errorHandler
  logDebug('initialize', { language, tts, contexts })

  Object.assign(this.api, {
    queryParam: (value) => Router.queryParam(value),
    showModal,
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
    fadeOut: (target, callback) => fadeOut(target, this, callback),
    fadeIn: (target, callback) => fadeIn(target, this, callback),
    sendError: ({ error, isResponse }) => {
      sendError({
        error,
        isResponse,
        template: this.view.name,
        failure: errorHandler,
      })
    },
  })

  // if any context is added we initialize it immediately sync-style
  for (const ctx of contexts) {
    initClientContext(ctx)
  }

  if (language) {
    allComplete.push(
      loadOnce(initLanguage, {
        onError: errorHandler,
        name: 'language',
      }),
    )
  }

  if (tts) {
    allComplete.push(
      loadOnce(initializeTTS, {
        onError: errorHandler,
        name: 'tts',
      }),
    )
  }

  if (loaders.length > 0) {
    allComplete.push(
      ...loaders.map((loader) =>
        loadOnce(loader, {
          onError: errorHandler,
        }),
      ),
    )
  }

  if (allComplete.length === 0) {
    return onComplete()
  }

  const addTranslations = async () => {
    const { addToLanguage } = await import('../../api/i18n/addToLanguage')
    return addToLanguage(translations)
  }

  this.autorun((c) => {
    if (allComplete.every((rv) => rv.get())) {
      c.stop()
      this.api.info('call dependencies onComplete')
      if (translations) {
        addTranslations()
          .catch((e) => {
            fatal({
              error: {
                message: 'unknown',
                original: e.message,
              },
            })

            sendError({ error: e })
            errorHandler(e)
          })
          .then(() => {
            onComplete()
          })
      } else {
        onComplete()
      }
    }
  })

  return this
}

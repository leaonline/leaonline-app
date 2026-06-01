import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { Session } from '../../../contexts/session/Session'
import { Response } from '../../../contexts/response/Response'
import { UnitSet } from '../../../contexts/unitSet/UnitSet'
import { Dimension } from '../../../contexts/Dimension'
import { Level } from '../../../contexts/Level'
import { Unit } from '../../../contexts/Unit'
import { ResponseCache } from './cache/ResponseCache'
import { UnitPageCache } from './cache/UnitPageCache'
import { initTaskRenderers } from '../../renderers/initTaskRenderers'
import { isCurrentUnit } from '../../../contexts/session/utils/isCurrentUnit'
import { createItemLoad } from './item/createItemLoad'
import { createItemInput } from './item/createItemInput'
import { createItemSubmit } from './item/createItemSubmit'
import { createSessionLoader } from '../../loading/createSessionLoader'
import { sessionIsComplete } from '../../../contexts/session/utils/sessionIsComplete'
import '../../components/container/container'
import '../../layout/navbar/navbar'
import '../../templates/initMarkdownRenderer'
import './unit.html'

const renderersLoaded = initTaskRenderers()
const responseCache = ResponseCache.create(window.localStorage)
const pageCache = UnitPageCache.create(window.localStorage)
const submitItems = createItemSubmit({
  loadValue: responseDoc => responseCache.load(responseDoc),
  prepare: responseDoc => console.info('[Template.Unit]: submit to server', responseDoc),
  onSuccess: (result, responseDoc) => {
    const cleared = responseCache.clear(responseDoc)
    console.info('[Template.Unit]: clear storage', cleared, responseDoc)
  },
  onError: (error, responseDoc) => console.error(error, responseDoc)
})

Template.unit.onCreated(function () {
  const instance = this
  instance.state.setDefault('currentPageCount', -1)
  instance.state.setDefault('maxPages', -1)
  instance.dependenciesLoaded = new ReactiveVar(false)

  const { api } = instance.initDependencies({
    language: true,
    tts: true,
    contexts: [Session, Unit, UnitSet, Response, Dimension, Level],
    translations: {
      de: () => import('./i18n/de')
    },
    onComplete () {
      instance.onItemInput = createItemInput({
        cache: responseCache,
        debug: instance.api.debug
      })
      instance.onItemLoad = createItemLoad({
        cache: responseCache,
        debug: instance.api.debug
      })
      instance.onNewPage = ({ action, newPage }, onComplete) => {
        onPageNavUpdate({
          action,
          newPage,
          templateInstance: instance,
          onComplete
        })
      }
      instance.dependenciesLoaded.set(true)
    }
  })

  const { info } = api
  const sessionLoader = createSessionLoader({ info })

  instance.autorun(() => {
    const { params } = Template.currentData()
    const { unitId, sessionId } = params

    // simply skip if these params are not set, and let the router take care
    if (!unitId || !sessionId) {
      info('no unitId/sessionId', { unitId, sessionId })
      return abortUnit(instance)
    }

    const currentPageCount = pageCache.load(params) || 0

    instance.state.clear()
    sessionLoader({ sessionId, unitId })
      .catch(err => {
        info('session loader failed')
        abortUnit(instance, err)
      })
      .then(responseData => {
        if (!responseData) {
          info('response data undefined')
          return abortUnit(instance)
        }

        const {
          sessionDoc,
          unitDoc,
          unitSetDoc,
          dimensionDoc,
          levelDoc,
          color
        } = responseData

        // first we check for all docs, even one left-out doc is not acceptable
        if (!sessionDoc || !unitDoc || !unitSetDoc || !dimensionDoc || !levelDoc) {
          info('response data is incomplete')
          return abortUnit(instance)
        }

        // verify received session doc integrity
        const { currentUnit } = sessionDoc

        // if we encounter a sessionDoc that is already completed, we just
        // skip any further attempts to load units and immediately finish
        if (sessionIsComplete(sessionDoc)) {
          return instance.data.finish({ sessionId })
        }

        // if we encounter a unit, that is different from the sessionDoc's
        // current unit we skip directly to the "next" unit via currentUnit
        if (!isCurrentUnit({ sessionDoc, unitId })) {
          return instance.data.next({ unitId: currentUnit, sessionId })
        }

        if (currentPageCount > 0) {
          sessionDoc.progress += currentPageCount
        }

        // xxx: fix empty docs to be allowed to be skipped
        unitDoc.pages = unitDoc.pages || []

        // otherwise we're good and can continue with the current session
        instance.state.set({
          sessionDoc,
          unitSetDoc,
          dimensionDoc,
          levelDoc,
          color,
          unitDoc,
          currentPageCount,
          maxPages: unitDoc.pages.length,
          hasNext: unitDoc.pages.length > currentPageCount + 1
        })
      })
  })
})

Template.unit.onDestroyed(function () {
  const instance = this
  instance.state.set({
    fadedOut: null
  })
})

Template.unit.helpers({
  loadComplete () {
    const instance = Template.instance()
    return instance.dependenciesLoaded.get() &&
      instance.state.get('unitDoc') &&
      instance.state.get('sessionDoc') &&
      renderersLoaded.get()
  },
  navLoadComplete () {
    const instance = Template.instance()
    return instance.state.get('sessionDoc') &&
      instance.state.get('dimensionDoc') &&
      instance.state.get('levelDoc')
  },
  pageContentData () {
    if (!renderersLoaded.get()) return

    const instance = Template.instance()
    const sessionDoc = instance.state.get('sessionDoc')
    const unitDoc = instance.state.get('unitDoc')
    const color = instance.state.get('color')
    const currentPageCount = instance.state.get('currentPageCount')
    const depsComplete = instance.dependenciesLoaded.get()

    let onInput = () => {}
    let onLoad = () => {}
    let onNewPage = () => {}

    if (depsComplete && instance.state.get('sessionDoc')) {
      onInput = instance.onItemInput
      onLoad = instance.onItemLoad
      onNewPage = instance.onNewPage
    }

    return {
      isPreview: false,
      currentPageCount,
      sessionId: sessionDoc._id,
      doc: unitDoc,
      color,
      onInput,
      onLoad,
      onNewPage,
      onLoadError: err => console.error(err),
      onLoadComplete: () => console.warn('item renderer load complete')
    }
  },
  navbarData () {
    const instance = Template.instance()
    const sessionDoc = instance.state.get('sessionDoc')
    const levelDoc = instance.state.get('levelDoc')
    const unitSetDoc = instance.state.get('unitSetDoc')
    const dimensionDoc = instance.state.get('dimensionDoc')

    return {
      sessionDoc,
      levelDoc,
      unitSetDoc,
      dimensionDoc,
      showProgress: true,
      onExit: instance.data.exit
    }
  }
})

Template.unit.events({
  'click .lea-unit-finishstory-button' (event, templateInstance) {
    event.preventDefault()
    templateInstance.api.fadeOut('.lea-unit-story-container', () => {
      templateInstance.state.set('unitStory', null)
    })
  },
  'click .lea-pagenav-finish-button': async function (event, templateInstance) {
    event.preventDefault()

    // prevent multiple calls by fast-multiple-clicking
    if (templateInstance.state.get('finishing')) return
    templateInstance.state.set('finishing', true)

    const sessionDoc = templateInstance.state.get('sessionDoc')
    const sessionId = sessionDoc._id
    const unitDoc = templateInstance.state.get('unitDoc')
    const unitId = unitDoc._id
    const page = templateInstance.state.get('currentPageCount')

    try {
      await submitItems({ sessionId, unitDoc, page })
    }
    catch (e) {
      console.error(e)
    }

    // make sure we have all storage items deleted
    responseCache.flush()

    let sessionUpdate

    try {
      sessionUpdate = await templateInstance.api.callMethod({
        name: Session.methods.next.name,
        args: { sessionId }
      })
    }
    catch (e) {
      templateInstance.api.info('session update failed')
      return abortUnit(templateInstance, e)
    }

    templateInstance.api.debug('session updated', sessionUpdate)
    const { nextUnit, nextUnitSet, hasStory, completed } = sessionUpdate
    pageCache.clear({ sessionId, unitId })

    // we check if the route will be to another unit
    // se we would fade the navbar only when the
    // result page (or another pahe) will be shown
    const fadeTarget = completed
      ? '.lea-unit-container'
      : '.lea-unit-content-container'

    templateInstance.api.fadeOut(fadeTarget, () => {
      templateInstance.state.set('unitDoc', null)
      templateInstance.state.set('fadedOut', true)
      templateInstance.data.next({
        sessionId,
        unitId: nextUnit,
        unitSetId: nextUnitSet,
        hasStory,
        completed
      })
    })
  }
})

function onPageNavUpdate ({ action, newPage, templateInstance, onComplete }) {
  const unitDoc = templateInstance.state.get('unitDoc')
  const unitId = unitDoc._id
  const sessionDoc = templateInstance.state.get('sessionDoc')
  const sessionId = sessionDoc._id
  const currentPageCount = templateInstance.state.get('currentPageCount')

  pageCache.save({ unitId, sessionId }, newPage.currentPageCount)
  sessionDoc.progress++
  newPage.sessionDoc = sessionDoc

  if (!newPage.currentPage) {
    throw new Error(`Undefined page for current index ${newPage.currentPageCount}`)
  }

  setTimeout(() => {
    submitItems({ sessionId, unitDoc, page: currentPageCount })
      .catch(e => {
        console.error(e)
        onComplete()
      })
      .then(() => {
        templateInstance.state.set(newPage)
        onComplete()
      })
  }, 500)
}

function abortUnit (templateInstance, err) {
  if (err) {
    console.error('Unit aborted')
    console.error(err) // todo sendError
  }

  templateInstance.api.fadeOut('.lea-unit-container', () => {
    // there should be a strategy pattern here so we can easily switch depending
    // on the settings configuration and users needs (tests vs production etc.)
    templateInstance.data.exit()
  })
}

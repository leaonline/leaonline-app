import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { Session } from '../../../contexts/session/Session'
import { Response } from '../../../contexts/response/Response'
import { UnitSet } from '../../../contexts/content/UnitSet'
import { Dimension } from '../../../contexts/content/Dimension'
import { Level } from '../../../contexts/content/Level'
import { Unit } from '../../../contexts/content/Unit'
import { Scoring } from '../../../contexts/Scoring'
import { ResponseCache } from './cache/ResponseCache'
import { UnitPageCache } from './cache/UnitPageCache'
import { initTaskRenderers } from '../../renderers/initTaskRenderers'
import { createItemLoad } from './item/createItemLoad'
import { createItemInput } from './item/createItemInput'
import { createItemSubmit } from './item/createItemSubmit'
import { loadSessionDocs } from '../../loading/createSessionLoader'
import '../../components/container/container'
import '../../layout/navbar/navbar'
// import '../../templates/initMarkdownRenderer'
import './unit.html'
import { EJSON } from 'meteor/ejson'

Scoring.init()
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
    onComplete: async () => {
      instance.onItemInput = createItemInput({
        cache: responseCache,
        debug: instance.api.debug
      })
      instance.onItemLoad = createItemLoad({
        cache: responseCache,
        debug: instance.api.debug,
        createIfMissing: true
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

  instance.autorun(async () => {
    const { params } = Template.currentData()
    const { unitId, unitSetId, sessionId } = params
    // simply skip if these params are not set, and let the router take care
    if (!unitId || !unitSetId || !sessionId) {
      info('no unitId/sessionId', { unitId, sessionId })
      return abortUnit(instance)
    }

    const loadedUnitId = Tracker.nonreactive(() => instance.state.get('loaded'))
    if (unitId === loadedUnitId) {
      return // skip already loaded
    }

    if (!Session.has({ sessionId, unitSetId })) {
      await Session.load({ sessionId, unitSetId })
    }

    const currentPageCount = pageCache.load(params) || 0

    instance.state.clear()
    const sessionData = Tracker.nonreactive(() => Session.data())
    const responseData = await loadSessionDocs(sessionData)
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
    const currentUnit = sessionDoc.unit

    // if we encounter a sessionDoc that is already completed, we just
    // skip any further attempts to load units and immediately finish
    if (Session.isComplete({ sessionDoc, reactive: false })) {
      return instance.data.finish({ sessionId })
    }

    // if we encounter a unit, that is different from the sessionDoc's
    // current unit we skip directly to the "next" unit via currentUnit
    if (!Session.isCurrentUnit({ unitId, reactive: false })) {
      return instance.data.next({ unitId: currentUnit, unitSetId, sessionId })
    }

    if (currentPageCount > 0) {
      sessionDoc.progress += currentPageCount
    }

    // xxx: fix empty docs to be allowed to be skipped
    unitDoc.pages = unitDoc.pages || []

    // otherwise we're good and can continue with the current session
    instance.state.set({
      loaded: unitDoc._id,
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

  /**
   * This allows to evaluate/score items on the client
   * in order to produce immediate feedback.
   * @return {FlatArray<*[], 1>[]}
   */
  instance.onEvaluate = () => {
    const sessionDoc = instance.state.get('sessionDoc')
    const unitDoc = instance.state.get('unitDoc')
    const currentPage = instance.state.get('currentPageCount')
    const responseData = responseCache.all({ sessionId: sessionDoc._id })
    const allResponses = Object.entries(responseData).filter(([key, value]) => {
      // filter out entries from other pages
      return value.page == currentPage
    }).map(([key, value]) => {
      debugger
      const itemId = value.contentId
      const data = { ...value, itemId, unitId: unitDoc._id }
      const itemDefinitions = Unit.getContentElement({
        unit: instance.state.get('unitDoc'),
        contentId: itemId,
        page: Number(currentPage)
      })
      return Scoring.run(itemDefinitions.subtype, itemDefinitions.value, data)
    })

    return allResponses.flat()
  }

  instance.forward = () => {
    const isStory = !!instance.state.get('story')
    const unit = isStory ? null : instance.state.get('unitDoc')
    const allUnits = instance.state.get('unitDocs')
    const currentUnitIndex = allUnits.findIndex(u => u._id === unit?._id)
    const nextUnit = allUnits[currentUnitIndex + 1]

    // always clear everything
    instance.state.set({ unitDoc: null, story: null, currentPageCount: 0 })

    if (nextUnit) {
      setQueryParam({ page: 0 })
      setTimeout(() => {
        instance.state.set({ unitDoc: nextUnit })
      }, 500)
    }
    else {
      // reached end of units, show eval screen
    }
  }
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
    const onEvaluate = instance.onEvaluate

    if (depsComplete && instance.state.get('sessionDoc')) {
      onInput = instance.onItemInput
      onLoad = instance.onItemLoad
      onNewPage = instance.onNewPage
    }

    return {
      isPreview: false,
      isLearning: true,
      currentPageCount,
      sessionId: sessionDoc._id,
      doc: unitDoc,
      color,
      onInput,
      onLoad,
      onNewPage,
      onEvaluate,
      onFinish: instance.forward,
      onLoadError: instance.onError,
      // onLoadComplete: () => console.debug('item renderer load complete')
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
      onExit: () => {
        const { fieldId, unitSet } = sessionDoc
        instance.data.exit({ fieldId, unitSetId: unitSet })
      }
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
    const { fieldId } = templateInstance.state.get('sessionDoc')
    templateInstance.data.exit({ fieldId })
  })
}

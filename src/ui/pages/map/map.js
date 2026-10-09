import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Tracker } from 'meteor/tracker'
import { Template } from 'meteor/templating'
import { Field } from '../../../contexts/content/Field'
import { MapData } from '../../../contexts/map/MapData'
import { Level } from '../../../contexts/content/Level'
import { Dimension } from '../../../contexts/content/Dimension'
import { Session } from '../../../contexts/session/Session'
import { Progress } from '../../../contexts/progress/Progress'
import { ColorType } from '../../../contexts/types/ColorType'
import { getLocalCollection } from '../../../api/utils/getLocalCollection'
import { loadContentDoc } from '../../loading/loadContentDoc'
import { loadAllContentDocs } from '../../loading/loadAllContentDocs'
import { callMethod } from '../../../infrastructure/methods/callMethod'
import { createTemplate } from '../../templates/createTemplate'
import { Router } from '../../routing/Router'
import { buildMapModel } from './model'
import { resolvePosition, sessionSelection } from './navigation'
import { loadMapIcons, mapIconsContext } from './data'
import './learnerMap'
import './map.html'
import { mapPercent } from './mapStageChooser'
import '../../components/container/container'

// Ephemeral same-account/field return position. No saved view preference.
let returnPosition
const remember = instance => {
  returnPosition = { userId: instance.userId, fieldId: instance.fieldId, id: instance.state.get('currentId') }
}
const isActive = (instance, generation) => !instance.view.isDestroyed &&
  instance.generation === generation && Meteor.userId() === instance.userId &&
  Router.param('fieldId') === instance.fieldId

const loadMap = async instance => {
  const generation = ++instance.generation
  const active = () => isActive(instance, generation)
  instance.resolveDecision?.('cancel')
  instance.state.set({ ready: false, loadError: null, renderError: null, model: null, sessionError: null, selectedId: null, busy: false, deciding: false })
  try {
    const fieldId = instance.fieldId
    const field = await loadContentDoc({ context: Field, query: { _id: fieldId }, unlessExists: true })
    if (!active()) return
    const topology = await loadContentDoc({ context: MapData, query: { field: fieldId }, unlessExists: true })
    if (!active()) return
    if (!field || topology?.field !== fieldId || !Array.isArray(topology.entries) || !topology.entries.length) throw new Error('map.invalidTopology')
    const dimensions = topology.dimensions?.map(d => d._id) || []
    const levels = topology.levels || []
    await Promise.all([
      loadAllContentDocs({ context: Dimension, ids: dimensions, params: { ids: dimensions }, unlessExists: true }),
      loadAllContentDocs({ context: Level, ids: levels, params: { ids: levels }, unlessExists: true })
    ])
    if (!active()) return
    const [iconsResult, progressResult] = await Promise.allSettled([
      loadMapIcons(fieldId),
      loadContentDoc({ context: Progress, collection: instance.learnerCollection, query: { fieldId } })
    ])
    if (!active()) return
    const cachedSession = Session.data()?.sessionDoc
    // Session.data is the only nonmutating learner-facing Session source today.
    // Fresh browser loads have no current-Session endpoint. Never use the
    // creating Session.get to fill this gap; use the Progress anchor instead.
    const currentSession = cachedSession?.userId === instance.userId && cachedSession.fieldId === fieldId
      ? cachedSession
      : null
    const progressAvailable = progressResult.status === 'fulfilled' &&
      (!progressResult.value || (progressResult.value.userId === instance.userId && progressResult.value.fieldId === fieldId))
    const model = buildMapModel({
      topology,
      dimensions: dimensions.map(_id => {
        const doc = getLocalCollection(Dimension.name).findOne(_id)
        return doc && { ...doc, color: ColorType.byIndex(doc.colorType)?.name }
      }).filter(Boolean),
      levels: levels.map(_id => getLocalCollection(Level.name).findOne(_id)).filter(Boolean),
      icons: iconsResult.status === 'fulfilled' ? iconsResult.value : [],
      progress: progressAvailable ? progressResult.value : null,
      progressAvailable,
      currentSession
    })
    const saved = returnPosition?.userId === instance.userId && returnPosition.fieldId === fieldId ? returnPosition.id : null
    const position = resolvePosition(model, Router.current().queryParams, saved)
    instance.state.set({ field, model, ...position, ready: true, learnerUnavailable: !progressAvailable })
    remember(instance)
    // PWA refresh policy is deferred: page entry/explicit retry only.
    // Completion return relies on the server's existing awaited Progress update.
  }
  catch (error) {
    if (active()) instance.state.set({ ready: true, loadError: 'map.invalidTopology' })
  }
}

const selectStage = (instance, id) => {
  if (!instance.state.get('model')?.stages.some(stage => stage.id === id)) return
  instance.selectionEpoch++
  instance.state.set({ currentId: id, selectedId: id, sessionError: null })
  remember(instance)
  Router.queryParam({ stage: id, unitSet: null })
}
const closeStage = instance => {
  if (instance.view.isDestroyed) return
  instance.selectionEpoch++
  const id = instance.state.get('selectedId') || instance.state.get('currentId')
  instance.state.set({ selectedId: null, sessionError: null })
  Router.src.withReplaceState(() => Router.queryParam({ stage: null, unitSet: null }))
  Tracker.afterFlush(() => {
    if (!instance.view.isDestroyed) instance.findAll('[data-stage]').find(el => el.dataset.stage === id)?.focus({ preventScroll: true })
  })
}

const selectUnitSet = async (instance, unitSetId) => {
  if (instance.state.get('busy') || !Meteor.status().connected) return
  const stage = instance.state.get('model')?.stages.find(s => s.id === instance.state.get('selectedId'))
  if (!stage?.choices.some(c => c._id === unitSetId)) return
  const generation = instance.generation
  const selectionEpoch = instance.selectionEpoch
  const selectedId = stage.id
  const active = () => isActive(instance, generation) && instance.selectionEpoch === selectionEpoch && instance.state.get('selectedId') === selectedId
  instance.state.set({ busy: true, sessionError: null })
  try {
    const result = await sessionSelection({
      unitSetId,
      userId: instance.userId,
      fieldId: instance.fieldId,
      lookup: id => callMethod({ name: Session.methods.get, args: { unitSetId: id } }),
      // Keep the decision in the chooser: exactly one modal focus trap.
      decide: () => new Promise(resolve => {
        instance.resolveDecision = resolve
        instance.state.set('deciding', true)
      }),
      restart: sessionId => callMethod({ name: Session.methods.restart, args: { sessionId } }),
      advance: sessionId => callMethod({ name: Session.methods.update, args: { sessionId } }),
      start: docs => Session.start(docs),
      active
    })
    if (result && active()) {
      remember(instance)
      instance.data.onSelected(result)
    }
  }
  catch (error) {
    if (active()) instance.state.set('sessionError', 'map.sessionFailed')
  }
  finally {
    if (!instance.view.isDestroyed && instance.generation === generation) {
      instance.state.set({ busy: false, deciding: false })
      instance.resolveDecision = null
    }
  }
}

createTemplate({
  template: Template.map,
  contexts: [Field, MapData, mapIconsContext, Dimension, Level, Progress],
  language: true,
  translations: { de: () => import('./i18n/de') },
  onCreated: ({ instance }) => {
    instance.generation = 0
    instance.selectionEpoch = 0
    // Account data never enters a globally shared local collection.
    instance.learnerCollection = new Mongo.Collection(null)
  },
  onDependenciesComplete: ({ instance }) => {
    if (instance.view.isDestroyed) return
    instance.state.set('mode', 'map')
    instance.autorun(() => {
      const userId = Meteor.userId()
      const fieldId = Router.param('fieldId')
      Tracker.nonreactive(() => {
        instance.resolveDecision?.('cancel')
        instance.userId = userId
        instance.fieldId = fieldId
        if (returnPosition && returnPosition.userId !== userId) returnPosition = null
        instance.learnerCollection.remove({})
        if (userId && fieldId) loadMap(instance)
        else { instance.generation++; instance.state.set({ model: null, ready: false, selectedId: null }) }
      })
    })
    instance.autorun(() => {
      const stage = Router.queryParam('stage')
      const unitSet = Router.queryParam('unitSet')
      const model = instance.state.get('model')
      if (!model) return
      Tracker.nonreactive(() => {
        const position = resolvePosition(model, { stage, unitSet }, instance.state.get('currentId'))
        const previous = instance.state.get('selectedId')
        if (position.selectedId !== previous) {
          instance.selectionEpoch++
          instance.resolveDecision?.('cancel')
          if (previous && !position.selectedId) {
            Tracker.afterFlush(() => {
              if (!instance.view.isDestroyed) instance.findAll('[data-stage]').find(el => el.dataset.stage === previous)?.focus({ preventScroll: true })
            })
          }
        }
        instance.state.set(position)
        remember(instance)
      })
    })
  },
  onDestroyed: ({ instance }) => {
    instance.generation++
    instance.resolveDecision?.('cancel')
    instance.learnerCollection.remove({})
  },
  helpers: {
    mapPercent,
    ready: () => Template.getState('ready'),
    loadError: () => Template.getState('loadError') || Template.getState('error')?.message,
    field: () => Template.getState('field'),
    model: () => Template.getState('model'),
    currentId: () => Template.getState('currentId'),
    selectedId: () => Template.getState('selectedId'),
    stageCurrent: id => Template.getState('currentId') === id ? 'step' : false,
    stageSelected: id => Template.getState('selectedId') === id ? 'true' : 'false',
    learnerUnavailable: () => Template.getState('learnerUnavailable'),
    listMode: () => Template.getState('mode') === 'list' || Template.getState('renderError') || !Template.getState('model')?.sceneAvailable,
    sceneUnavailable: () => Template.getState('renderError') || !Template.getState('model')?.sceneAvailable,
    selectStage () { const instance = Template.instance(); return id => selectStage(instance, id) },
    renderError () { const instance = Template.instance(); return () => instance.state.set('renderError', true) },
    chooser () {
      const instance = Template.instance()
      const stage = instance.state.get('model')?.stages.find(s => s.id === instance.state.get('selectedId'))
      if (!stage) return null
      return {
        stage,
        busy: instance.state.get('busy'),
        deciding: instance.state.get('deciding'),
        error: instance.state.get('sessionError'),
        offline: !Meteor.status().connected,
        onClose: () => { instance.resolveDecision?.('cancel'); closeStage(instance) },
        onSelect: id => selectUnitSet(instance, id),
        onDecision: value => instance.resolveDecision?.(value)
      }
    }
  },
  events: {
    'click .map-retry' (event, instance) { loadMap(instance) },
    'click .map-mode' (event, instance) { instance.state.set('mode', event.currentTarget.dataset.mode) },
    'click .map-list-stage' (event, instance) { selectStage(instance, event.currentTarget.dataset.stage) }
  }
})

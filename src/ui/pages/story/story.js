import { Template } from 'meteor/templating'
import { UnitSet } from '../../../contexts/content/UnitSet'
import { Dimension } from '../../../contexts/content/Dimension'
import { Session } from '../../../contexts/session/Session'
import { Level } from '../../../contexts/content/Level'
import { Unit } from '../../../contexts/content/Unit'
import { loadSessionDocs } from '../../loading/createSessionLoader'
import { initTaskRenderers } from '../../renderers/initTaskRenderers'
import '../../components/container/container'
import '../../layout/navbar/navbar'
import './story.html'

const renderersLoaded = initTaskRenderers()

Template.story.onCreated(function () {
  const instance = this
  const { sessionId, unitSetId } = instance.data.params

  instance.initDependencies({
    tts: true,
    language: true,
    translations: {
      de: () => import('./i18n/de')
    },
    contexts: [UnitSet, Session, Dimension, Level, Unit],
    onComplete: async () => {
      if (!Session.has({ sessionId, unitSetId })) {
        await Session.load({ sessionId, unitSetId })
      }
      const sessionDocs = await loadSessionDocs(Session.data())
      instance.state.set({ ...sessionDocs, dependenciesComplete: true })
    }
  })

  instance.autorun(computation => {
    if (renderersLoaded.get()) {
      return computation.stop()
    }
  })
})

Template.story.helpers({
  loadComplete () {
    const instance = Template.instance()
    return instance.state.get('dependenciesComplete') &&
      instance.state.get('sessionDoc') &&
      instance.state.get('unitSetDoc') &&
      instance.state.get('dimensionDoc') &&
      renderersLoaded.get()
  },
  pageContentData () {
    const instance = Template.instance()
    const unitSetDoc = instance.state.get('unitSetDoc')
    const sessionDoc = instance.state.get('sessionDoc')
    const color = instance.state.get('color')

    return {
      isStory: true,
      currentPageCount: -1,
      sessionId: sessionDoc._id,
      doc: unitSetDoc,
      color: color
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
  },
  currentType () {
    const instance = Template.instance()
    return instance.state.get('color')
  }
})

Template.story.events({
  'click .lea-story-finish-button'(event, templateInstance) {
    event.preventDefault()
    debugger
    const sessionDoc = templateInstance.state.get('sessionDoc')
    const unitSetId = sessionDoc.unitSet
    const sessionId = sessionDoc._id

    // If this is the first time we visit the story
    // we have no unit on the session doc and need to update the session.
    // However, users can theoretically rewatch the session story so
    // we would mess things up if we update already updated session here
    if (!sessionDoc.unit) {
      Session.update({
        prepare: () => templateInstance.state.set('updatingSession', true),
        receive: () => templateInstance.state.set('updatingSession', false),
        failure: templateInstance.onError,
        success: unitId => templateInstance.data?.next({ sessionId, unitSetId, unitId })
      })
    } else {
      const unitId = sessionDoc.nextUnit
      templateInstance.data?.next({ sessionId, unitSetId, unitId })
    }
  }
})

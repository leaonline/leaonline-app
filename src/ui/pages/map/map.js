import { Template } from 'meteor/templating'
import { Field } from '../../../contexts/content/Field'
import { MapData } from '../../../contexts/map/MapData'
import { Level } from '../../../contexts/content/Level'
import { Dimension } from '../../../contexts/content/Dimension'
import { fatal } from '../../components/fatal/fatal'
import { getLocalCollection } from '../../../api/utils/getLocalCollection'
import { dataTarget } from '../../../utils/dataTarget'
import { loadContentDoc } from '../../loading/loadContentDoc'
import { loadAllContentDocs } from '../../loading/loadAllContentDocs'
import '../../components/container/container'
import './map.html'
import { postProcessMap } from './postProcessMap'
import { callMethod } from '../../../infrastructure/methods/callMethod'
import { Session } from '../../../contexts/session/Session'

Template.map.onDestroyed(function () {
  const instance = this
  instance.state.clear()
})

Template.map.onCreated(function () {
  const instance = this
  const { fieldId } = instance.data.params

  instance.initDependencies({
    contexts: [Field, MapData, Dimension, Level],
    language: true,
    tts: true,
    translations: {
      de: () => import('./i18n/de')
    },
    onComplete: async () => {
      try {
        await loadContentDoc({
          context: Field,
          query: { _id: fieldId },
          unlessExists: true
        })
        const { _id, field, ...mapData } = await loadContentDoc({
          context: MapData,
          query: { field: fieldId },
          unlessExists: true
        })

        const dimensionIds = mapData.dimensions.map(d => d._id)
        await loadAllContentDocs({
          context: Dimension,
          query: { ids: dimensionIds },
          unlessExists: true
        })

        await loadAllContentDocs({
          context: Level,
          query: { ids: mapData.levels },
          unlessExists: true
        })

        const entries = postProcessMap(mapData)
        instance.state.set({ entries })
      } catch (e) {
        instance.onError(e)
      }
      instance.state.set('dependenciesComplete', true)
    },
    onError: error => {
      fatal({ error, logToConsole: true })
      instance.state.set('dependenciesComplete', true)
    }
  })
})

Template.map.helpers({
  loadComplete () {
    return Template.getState('dependenciesComplete')
  },
  error () {
    return Template.getState('error')
  },
  field () {
    const { fieldId } = Template.instance().data.params
    return getLocalCollection(Field.name).findOne({ _id: fieldId })
  },
  entries () {
    return Template.getState('entries')
  },
  loadingSession () {
    return Template.getState('loadingSession')
  }
})

Template.map.events({
  'click .unitset-btn' (event, templateInstance) {
    event.preventDefault()
    const unitSetId = dataTarget(event)

    // three scenarios here
    // A. start a new session
    // B. session exists with current unit
    // → B.1 continue
    // → B.2 restart
    // for B.1 and B.2 we need to display a decision dialog

    templateInstance.state.set('loadingSession', unitSetId)

    callMethod({
      name: Session.methods.get,
      args: { unitSetId },
      receive: () => templateInstance.state.set('loadingSession', null),
      failure: templateInstance.onError,
      success: ({ sessionDoc, unitSetDoc }) => {
        if (!sessionDoc || !unitSetDoc) {
          return templateInstance.onError(new Error('session.loadFailed'))
        }

        // A. session is new, just start the story mode
        if (!sessionDoc.unit) {
          Session.start({ sessionDoc, unitSetDoc })
          const sessionId = sessionDoc._id
          const unitSetId = unitSetDoc._id
          const showStory = true
          return templateInstance.data.onSelected({ sessionId, unitSetId, showStory })
        }
      }
    })
  }
})

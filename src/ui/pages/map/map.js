import { Template } from 'meteor/templating'
import { Field } from '../../../contexts/content/Field'
import { MapData } from '../../../contexts/map/MapData'
import { Level } from '../../../contexts/content/Level'
import { Dimension } from '../../../contexts/content/Dimension'
import { Session } from '../../../contexts/session/Session'
import { Progress } from '../../../contexts/progress/Progress'
import { fatal } from '../../components/fatal/fatal'
import { getLocalCollection } from '../../../api/utils/getLocalCollection'
import { dataTarget } from '../../../utils/dataTarget'
import { loadContentDoc } from '../../loading/loadContentDoc'
import { loadAllContentDocs } from '../../loading/loadAllContentDocs'
import { postProcessMap } from './postProcessMap'
import { callMethod } from '../../../infrastructure/methods/callMethod'
import { requestDecision } from '../../components/decision/decision'
import '../../components/container/container'
import '../../components/decision/decision'
import './map.html'

Template.map.onDestroyed(function () {
  const instance = this
  instance.state.clear()
})

Template.map.onCreated(function () {
  const instance = this
  const { fieldId } = instance.data.params

  instance.initDependencies({
    contexts: [Field, MapData, Dimension, Level, Progress],
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

        // while rendering the map we fetch the progress
        const progressDoc = await loadContentDoc({
          context: Progress,
          query: { fieldId }
        })


        const entries = postProcessMap(mapData, progressDoc)
        console.debug({ entries })
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
  },
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
      success: async ({ sessionDoc, unitSetDoc }) => {
        if (!sessionDoc || !unitSetDoc) {
          return templateInstance.onError(new Error('session.loadFailed'))
        }

        const sessionId = sessionDoc._id
        const unitSetId = unitSetDoc._id

        // A. session is new, just start the story mode
        if (!sessionDoc.unit) {
          Session.start({ sessionDoc, unitSetDoc })
          const showStory = true
          return templateInstance.data.onSelected({ sessionId, unitSetId, showStory })
        }

        if (sessionDoc.unit) {
          const { decision } = await requestDecision({
            title: 'pages.map.decideContinue',
            options: [
              {
                value: 'restart',
                label: 'common.restart',
                icon: 'undo',
                iconPos: 'right'
              },
              {
                value: 'continue',
                label: 'common.continue',
                icon: 'arrow-right',
                iconPos: 'right',
                type: 'primary'
              }
            ]
          })

          if (decision === 'continue') {
            const unitId = sessionDoc.unit
            return templateInstance.data.onSelected({ sessionId, unitSetId, unitId })
          }

          if (decision === 'restart') {
            // restart session and then load story
            await Session.restart({ sessionId })
            const showStory = true
            return templateInstance.data.onSelected({ sessionId, unitSetId, showStory })
          }

          // ignore cancel decision
        }
      }
    })
  }
})

import { Template } from 'meteor/templating'
import { Field } from '../../../contexts/content/Field'
import { MapData } from '../../../contexts/map/MapData'
import { Level } from '../../../contexts/content/Level'
import { Dimension } from '../../../contexts/content/Dimension'
import { Session } from '../../../contexts/session/Session'
import { Progress } from '../../../contexts/progress/Progress'
import { getLocalCollection } from '../../../api/utils/getLocalCollection'
import { dataTarget } from '../../../utils/dataTarget'
import { loadContentDoc } from '../../loading/loadContentDoc'
import { loadAllContentDocs } from '../../loading/loadAllContentDocs'
import { postProcessMap } from './postProcessMap'
import { callMethod } from '../../../infrastructure/methods/callMethod'
import { requestDecision } from '../../components/decision/decision'
import { createTemplate } from '../../templates/createTemplate'
import '../../components/container/container'
import '../../components/decision/decision'
import './map.html'

createTemplate({
  debug: console.debug,
  template: Template.map,
  contexts: [Field, MapData, Dimension, Level, Progress],
  language: true,
  tts: true,
  translations: {
    de: () => import('./i18n/de')
  },
  onDependenciesComplete: async ({ instance, debug }) => {
    const { fieldId } = instance.data.params

    await loadContentDoc({
      context: Field,
      query: { _id: fieldId },
      unlessExists: true,
      debug
    })
    const { _id, field, ...mapData } = await loadContentDoc({
      context: MapData,
      query: { field: fieldId },
      unlessExists: true,
      debug
    })
    const dimensionIds = mapData.dimensions.map(d => d._id)
    await loadAllContentDocs({
      context: Dimension,
      query: { ids: dimensionIds },
      unlessExists: true,
      debug
    })

    await loadAllContentDocs({
      context: Level,
      query: { ids: mapData.levels },
      debug
    })

    // while rendering the map we fetch the progress
    const progressDoc = await loadContentDoc({
      context: Progress,
      query: { fieldId },
      clean: doc => {
        doc.unitSets = doc.unitSets ?? []
        doc.unitSets.forEach(entry => {
          if (Number.isNaN(entry.progress)) entry.progress = 0
          if (Number.isNaN(entry.competencies)) entry.competencies = 0
        })
        return doc
      },
      debug
    })


    const entries = postProcessMap(mapData, progressDoc)
    instance.state.set({ entries })
  },
  helpers: {
    loadComplete () {
      return Template.getState('dependenciesComplete')
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
  },
  events: {
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
  }
})


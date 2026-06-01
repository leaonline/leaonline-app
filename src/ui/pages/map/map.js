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
  }
})

Template.map.events({
  'click .unitset-btn' (event, templateInstance) {
    event.preventDefault()
    const unitSetId = dataTarget(event)

    // three scenarios here
    // A. no session exists, then start a new one
    // B. session exists, continue
    // C. session exists, restart
    // for B and C we need to display a modal
    // that asks for continue or restart

  }
})

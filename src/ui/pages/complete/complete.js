import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { Dimension } from '../../../contexts/Dimension'
import { Session } from '../../../contexts/session/Session'
import { Thresholds } from '../../../contexts/thresholds/Thresholds'
import { Competency } from '../../../contexts/Competency'
import { createSessionLoader } from '../../loading/createSessionLoader'
import { sessionIsComplete } from '../../../contexts/session/utils/sessionIsComplete'
import { AlphaLevel } from '../../../contexts/AlphaLevel'
import { Response } from '../../../contexts/response/Response'
import { Unit } from '../../../contexts/Unit'
import { truncatePercent } from './helpers/truncatePercent'
import { translate } from '../../../api/i18n/translate'
import '../../components/container/container'
import '../../layout/navbar/navbar'
import './complete.scss'
import './complete.html'

const states = {
  showResults: 'showResults',
  showDecision: 'showDecision',
  showFailed: 'showFailed'
}

const stateValues = Object.values(states)

Template.complete.onCreated(function () {
  const instance = this
  const { sessionId } = instance.data.params
  const { api } = instance.initDependencies({
    language: true,
    tts: true,
    translations: {
      de: () => import('./i18n/de')
    },
    contexts: [Dimension, Session, Competency, Thresholds, AlphaLevel, Response, Unit],
    onComplete: async function () {
      instance.state.set({
        dependenciesComplete: true
      })
    }
  })

  const { queryParam, callMethod, loadAllContentDocs, info, debug, hasProperty } = api
  const onFailed = e => {
    instance.state.set({
      competenciesLoaded: true,
      sessionLoaded: true,
      failed: e
        ? { error: e.error, reason: e.reason || e.message }
        : true
    })
  }

  loadAllContentDocs(Thresholds, undefined, debug)
    .catch(e => onFailed(e))
    .then(() => {
      const thresholdDoc = Thresholds.collection().findOne()
      instance.state.set(thresholdDoc)

      // TODO refactor into own method
      callMethod({
        name: Session.methods.results,
        args: { sessionId },
        failure: err => onFailed(err),
        success: results => {
          if (!results) {
            return onFailed(new Meteor.Error('test 1')) // TODO fallback with a message "we can't eval right now..."
          }

          const { competencies, alphaLevels } = results

          // GET request to content server to fetch competency documents
          // which are required to display the related texts
          const competencyIds = competencies.map(c => c.competencyId)

          // by default this is true, but it will be set to false, once
          // we have at least one graded competency
          let noScoredCompetencies = true

          loadAllContentDocs(Competency, { ids: competencyIds })
            .catch(error => onFailed(error))
            .then(competencyDocs => {
              if (competencyDocs.length === 0) {
                instance.state.set('competenciesLoaded', true)
                return onFailed(new Meteor.Error('test 2'))
              }

              console.debug({ competencyIds, competencies })
              const CompetencyCollection = Competency.collection()
              const aggregatedResults = competencies
                .map(resultDoc => {
                  const { competencyId } = resultDoc
                  const competencyDoc = CompetencyCollection.findOne(competencyId)

                  if (noScoredCompetencies && resultDoc.gradeIndex > -1) {
                    noScoredCompetencies = false
                  }

                  if (!competencyDoc) {
                    return console.warn('Found no competency doc for _id', competencyId)
                  }

                  resultDoc.shortCode = competencyDoc.shortCode
                  resultDoc.description = competencyDoc.descriptionSimple
                  resultDoc.gradeLabel = `thresholds.${resultDoc.gradeName}`

                  const percentValue = Number(resultDoc.perc ?? 0) * 100
                  resultDoc.perc = truncatePercent(percentValue)

                  console.debug({ resultDoc })
                  return resultDoc
                })
                .sort((a, b) => a.shortCode.localeCompare(b.shortCode))

              debug({ aggregatedResults })
              instance.state.set({
                aggregatedResults,
                noScoredCompetencies,
                competenciesLoaded: true
              })
            })

          const alphaLevelIds = alphaLevels.map(c => c.alphaLevelId)

          let noScoredAlphas = true

          loadAllContentDocs(AlphaLevel, { ids: alphaLevelIds })
            .catch(error => onFailed(error))
            .then(alphaLevelDocs => {
              if (alphaLevelDocs.length === 0) {
                instance.state.set('alphaLevelsLoaded', true)
                return onFailed(new Meteor.Error('test 3'))
              }

              const AlphaLevelCollection = AlphaLevel.collection()
              const aggregatedAlphaLevels = alphaLevels.map(alpha => {
                const { alphaLevelId } = alpha
                const alphaLevelDoc = AlphaLevelCollection.findOne(alphaLevelId)

                if (noScoredAlphas && alpha.gradeIndex > -1) {
                  noScoredAlphas = false
                }

                if (!alphaLevelDoc) {
                  return console.warn('Found no alphaLevel doc for _id', alphaLevelId)
                }

                const dimension = Dimension.collection().findOne(alphaLevelDoc.dimension)
                alpha.dimension = dimension && `${dimension.title} ${alphaLevelDoc.level}`
                alpha.level = alphaLevelDoc.level
                alpha.shortCode = alphaLevelDoc.shortCode
                alpha.description = alphaLevelDoc.description
                alpha.gradeLabel = `thresholds.${alpha.gradeName}`

                const percentValue = Number(alpha.perc ?? 0) * 100
                alpha.perc = truncatePercent(percentValue)

                return alpha
              })
                .sort((a, b) => a.shortCode.localeCompare(b.shortCode))

              debug({ aggregatedAlphaLevels })
              instance.state.set({
                noScoredAlphas,
                alphaLevels: aggregatedAlphaLevels,
                alphaLevelsLoaded: true
              })
            })
        }
      })
    })

  // we use the session loader to simply the loading of the session dependencies
  // such as Dimension, Level, UnitSet, Colors, Unit etc.
  const sessionLoader = createSessionLoader({ info })
  sessionLoader({ sessionId })
    .catch(err => onFailed(err))
    .then(sessionData => {
      debug(sessionData)

      if (!sessionData) {
        return console.warn('no session data!')
      }
      else {
        console.debug('session data loaded')
      }

      const { sessionDoc, unitSetDoc, dimensionDoc, levelDoc, color } = sessionData
      // first we check for all docs, even one left-out doc is not acceptable
      if (!sessionDoc || !unitSetDoc || !dimensionDoc || !levelDoc) {
        return // we can safely skip since this information is not viable
      }

      // if we encounter a sessionDoc that is not completed, we just
      // skip any further attempts to load and immediately exit
      if (!sessionIsComplete(sessionDoc)) {
        return instance.data.exit({ sessionId })
      }

      // otherwise we're good and can continue with the current session
      instance.state.set({
        sessionDoc,
        dimensionDoc,
        levelDoc,
        unitSetDoc,
        color,
        sessionLoaded: true
      })
    })

  // basic routes / state handling
  instance.autorun(() => {
    const v = queryParam('v') || 0
    const currentView = stateValues[parseInt(v, 10)]

    if (currentView && hasProperty(states, currentView)) {
      instance.state.set('view', currentView)
    }

    else {
      instance.state.set('view', states.showResults)
    }
  })

  // if we have a debug user we can ask for her responses in detail so our
  // team members can see their response-scoring in detail
  instance.autorun(() => {
    const user = Meteor.user()
    if (!user?.debug || instance.state.get('callingResponses')) {
      return
    }

    callMethod({
      name: Response.methods.getMy,
      args: { sessionId },
      prepare: () => instance.state.set('callingResponses', true),
      failure (err) {
        console.error(err)
      },
      success (responses) {
        debug({ responses })

        const unitIds = new Set()
        responses.forEach(doc => unitIds.add(doc.unitId))

        const ids = Array.from(unitIds)
        loadAllContentDocs(Unit, { ids }, debug)
          .catch(e => console.error(e))
          .then(() => {
            const mapped = responses.map(doc => {
              doc.unit = Unit.collection().findOne(doc.unitId) || { shortCode: '?' }
              return doc
            })

            responses.sort((a, b) => a.unit.shortCode.localeCompare(b.unit.shortCode))
            instance.state.set({ responses: mapped })
          })
      }
    })
  })
})

Template.complete.helpers({
  loadComplete () {
    const instance = Template.instance()
    return instance.state.get('dependenciesComplete') &&
      // instance.state.get('competenciesLoaded') &&
      instance.state.get('sessionLoaded')
  },
  failed () {
    return Template.getState('failed')
  },
  feedbackComplete () {
    return Template.getState('competenciesLoaded') &&
      Template.getState('alphaLevelsLoaded')
  },
  competenciesLoaded () {
    return Template.getState('competenciesLoaded')
  },
  alphaLevelsLoaded () {
    return Template.getState('alphaLevelsLoaded')
  },
  competencies () {
    return Template.getState('aggregatedResults')
  },
  alphaLevels () {
    return Template.getState('alphaLevels')
  },
  getCompetency (_id) {
    const competencyDoc = Competency.collection().findOne(_id)
    if (competencyDoc) {
      return {
        shortCode: competencyDoc.shortCode,
        description: competencyDoc.descriptionSimple || competencyDoc.description,
        example: competencyDoc.example
      }
    }

    return { description: _id }
  },
  minCountCompetency () {
    return Template.getState('minCountCompetency')
  },
  printOptions () {
    return Template.getState('printOptions')
  },
  evaluationResults () {
    return Template.getState('results')
  },
  showThanks () {
    const viewState = Template.getState('view')
    const failed = Template.getState('failed')
    return viewState === states.showResults || failed
  },
  showResults () {
    const instance = Template.instance()
    const failed = instance.state.get('failed')
    return instance.state.get('view') === states.showResults && !failed
  },
  showDecision () {
    const instance = Template.instance()
    const failed = instance.state.get('failed')
    return !failed &&
      instance.state.get('sessionDoc') &&
      instance.state.get('view') === states.showDecision
  },
  showCompetencies () {
    return Template.getState('showCompetencies')
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
      showProgress: false,
      showUsername: true
    }
  },
  currentType () {
    return Template.instance().state.get('color')
  },
  getPercent (doc = {}) {
    const percent = String(doc.perc ?? 0)
    return translate('pages.complete.percent', { percent })
  },
  // ///////////////////////////////////////////////////////////////////////////
  // DEBUG-USER-ONLY!
  // ///////////////////////////////////////////////////////////////////////////
  responses () {
    return Template.getState('responses')
  },
  stringify (obj) {
    return JSON.stringify(obj, null, 0)
  },
  isScored (entry) {
    return entry === 'true' || entry === true
  },
  showExtended (isGraded, isDemoUser) {
    return isGraded || isDemoUser
  },
  noScoredCompetencies () {
    return Template.getState('noScoredCompetencies')
  },
  noScoredAlpha () {
    return Template.getState('noScoredAlphas')
  }
})

Template.complete.events({
  'click .lea-showresults-forward-button' (event, templateInstance) {
    event.preventDefault()
    const { queryParam } = templateInstance.api
    queryParam({ v: stateValues.indexOf(states.showDecision) })
  },
  'click .lea-showdecision-back-button' (event, templateInstance) {
    event.preventDefault()
    const { queryParam } = templateInstance.api
    queryParam({ v: stateValues.indexOf(states.showResults) })
  },
  'click .print-simple' (event) {
    event.preventDefault()
    // printHTMLElement('lea-complete-print-root')
    window.print()
  },
  'click .lea-end-button' (event, templateInstance) {
    event.preventDefault()
    templateInstance.api.fadeOut('.lea-complete-container', () => templateInstance.data?.end())
  },
  'click .lea-continue-button' (event, templateInstance) {
    event.preventDefault()
    templateInstance.api.fadeOut('.lea-complete-container', () => templateInstance.data?.next())
  },
  'click .lea-to-overview-button' (event, templateInstance) {
    event.preventDefault()
    templateInstance.api.fadeOut('.lea-complete-container', () => templateInstance.data?.next())
  },
  'click .toggle-competency-display' (event, templateInstance) {
    event.preventDefault()
    const showCompetencies = templateInstance.state.get('showCompetencies')

    if (showCompetencies) {
      templateInstance.state.set('showCompetencies', false)
      templateInstance.api.fadeOut('.competencies-body', () => {})
    }

    else {
      templateInstance.state.set('showCompetencies', true)
      templateInstance.api.fadeIn('.competencies-body', () => {})
    }
  }
})

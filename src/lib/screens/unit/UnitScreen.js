import React, { useEffect, useRef, useContext, useReducer } from 'react'
import { Log } from '../../infrastructure/Log'
import { Colors } from '../../constants/Colors'
import { AppSessionContext } from '../../state/AppSessionContext'
import { ScreenBase } from '../BaseScreen'
import { InteractionGraph } from '../../infrastructure/log/InteractionGraph'
import { useDocs } from '../../meteor/useDocs'
import { loadUnitData } from './loadUnitData'
import { ActionButton } from '../../components/ActionButton'
import { useTranslation } from 'react-i18next'
import { completeUnit } from './completeUnit'
import { Confirm } from '../../components/Confirm'
import { shouldRenderStory } from './shouldRenderStory'
import { sendResponse } from './sendResponse'
import { toArrayIfNot } from '../../utils/toArrayIfNot'
import { getDimensionColor } from './getDimensionColor'
import { UnitRenderer } from './renderer/UnitRenderer'
import { checkResponse } from './createResponseDoc'
import { UnitSetRenderer } from './renderer/UnitSetRenderer'
import './registerComponents'
import './registerInstructions'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Layout } from '../../constants/Layout'

const log = Log.create('UnitScreen')

const initialState = () => ({
  page: 0,
  scored: -1,
  show: true,
  allTrue: false
})

const reducer = (prevState, nextState) => {
  switch (nextState.type) {
    case 'to-page':
      return {
        ...prevState,
        page: nextState.page,
        allTrue: false
      }
    case 'scored':
      return {
        ...prevState,
        allTrue: nextState.allTrue,
        scored: nextState.scored
      }
    case 'reset':
      return {
        ...prevState,
        show: false,
        scored: nextState.scored,
        allTrue: false
      }
    case 'show':
      return {
        ...prevState,
        show: true
      }
  }
}

export const UnitScreen = props => {
  const { t } = useTranslation()
  const responseRef = useRef({})
  const scoreRef = useRef({})
  const [state, dispatch] = useReducer(reducer, initialState(), undefined)
  const { page, show, scored, allTrue } = state
  const [session, sessionActions] = useContext(AppSessionContext)
  const { unitSet, dimension } = session
  const docs = useDocs({ fn: () => loadUnitData(unitSet) })

  // ---------------------------------------------------------------------------
  // Navigation updates
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // If users attempt to cancel we surely first show a modal
    // and ask if cancelling was intended.
    const cancelUnit = async () => {
      // todo send cancel information silently to server
      InteractionGraph.goal({
        type: 'cancel',
        target: unitDoc?.shortCode
      })

      await sessionActions.multi({
        unit: null,
        unitSet: null,
        progress: null,
        page: null
      })

      const navState = props.navigation.getState()
      const dimensionRoute = navState.routes.find(r => r.name === 'dimension')

      if (!dimensionRoute) {
        props.navigation.navigate('dimension')
      }
      else {
        props.navigation.navigate({ key: dimensionRoute.key })
      }
    }

    props.navigation.setOptions({
      headerLeft: () => (
        <Confirm
          id='unit-screen-confirm'
          pressable
          question={t('unitScreen.abort.question')}
          approveText={t('unitScreen.abort.abort')}
          approveIcon='times'
          denyText={t('unitScreen.abort.continue')}
          denyIcon='edit'
          onApprove={() => cancelUnit()}
          onDeny={() => {}}
          icon='times'
          tts={false}
          style={styles.confirm}
        />
      )
    })
  }, [])

  // ---------------------------------------------------------------------------
  // Prevent backwards functionality
  // ---------------------------------------------------------------------------
  // hitting the back-button should only be executed, when the modal has been
  // confirmed. Otherwise we first trigger the modal.
  useEffect(() => {
    const unsubscribeBeforeRemove = props.navigation.addListener('beforeRemove', (e) => {
      // GO_BACK is the action type from the device's back button
      // where we launch the modal and prevent the event from firing
      if (e.data.action.type === 'GO_BACK') {
        e.preventDefault()
        // trigger modal
      }
    })

    // remove listeners on destroy
    return () => {
      unsubscribeBeforeRemove()
    }
  }, [props.navigation])

  // ---------------------------------------------------------------------------
  // SKip early
  // ---------------------------------------------------------------------------
  if (!docs.data || docs.error) {
    return (<ScreenBase {...docs} />)
  }

  const { unitSetDoc, unitDoc, sessionDoc } = docs.data
  const dimensionColor = getDimensionColor(dimension)

  // ---------------------------------------------------------------------------
  // finish --> NAVIGATION
  // ---------------------------------------------------------------------------

  /**
   * Completes the unit and awaits the server response.
   * Based on the returned route it either cycles into the next unit
   * or navigates to the resulting route (usually complete screen).
   */
  const finish = async () => {
    const nextUnitId = await completeUnit({ unitSetDoc, sessionDoc, unitDoc })
    await sessionActions.multi({
      progress: session.progress + 1,
      unit: nextUnitId,
      page: 0
    })
    return nextUnitId
      ? props.navigation.push('unit')
      : props.navigation.navigate('complete')
  }

  const submitResponse = async ({ responses, data }) => {
    log('item submit', data.contentId, responses)
    responseRef.current[page] = { responses, data }
  }

  const checkScore = async () => {
    // get scoring method
    const currentResponse = responseRef.current[page]
    log('check score', { currentResponse })

    const checked = await checkResponse({ currentResponse })
    scoreRef.current[page] = checked.scoreResult
    dispatch({
      type: 'scored',
      allTrue: checked.allTrue,
      scored: page
    })

    // submit everything (in the background)
    const responseDoc = {}
    responseDoc.sessionId = sessionDoc._id
    responseDoc.unitSetId = unitSetDoc._id
    responseDoc.unitId = unitDoc._id
    responseDoc.dimensionId = dimension._id
    responseDoc.page = page
    responseDoc.itemId = currentResponse.data.contentId
    responseDoc.itemType = currentResponse.data.subtype
    responseDoc.scores = checked.scoreResult.map(entry => {
      // some items score single values, others multiple
      // some items have single competencies, others multiple
      // we therefore make all these properties to arrays
      // to comply with the server's defined schema
      const copy = { ...entry }
      copy.competency = toArrayIfNot(copy.competency)
      copy.correctResponse = toArrayIfNot(copy.correctResponse)
      copy.value = toArrayIfNot(copy.value)
      return copy
    })

    let count = 0
    let scored = 0

    responseDoc.scores.forEach(entry => {
      count += entry.competency.length
      scored += entry.score === true
        ? entry.competency.length
        : 0
    })

    const prevCompetencies = session.competencies
    const competencies = {
      max: prevCompetencies.max,
      count: prevCompetencies.count + count,
      scored: prevCompetencies.scored + scored,
      percent: prevCompetencies.percent
    }

    try {
      log('submit response to server', responseDoc)
      await sendResponse({ responseDoc })
    }
    catch (e) {
      log(e.message)
    }

    return sessionActions.update({ competencies })
  }

  const showCorrectResponse = scored === page
  const scoreResult = showCorrectResponse && scoreRef.current[page]
  const nextPage = () => {
    dispatch({ type: 'to-page', page: page + 1 })
    setTimeout(() => {
      sessionActions.multi({
        page: page + 1,
        progress: session.progress + 1
      })
    }, 500)
  }

  // ---------------------------------------------------------------------------
  // STORY DISPLAY
  // ---------------------------------------------------------------------------

  // if this is the very beginning of this unit set AND
  // we have a story to render, let's do it right now

  if (shouldRenderStory({ sessionDoc, unitSetDoc })) {
    log('render story', unitSetDoc.shortCode)
    return (
      <ScreenBase {...docs} style={styles.container}>
        <UnitSetRenderer
          unitSetDoc={unitSetDoc}
          dimensionColor={dimensionColor}
        />

        {/* -------- continue button ---------  */}
        <ActionButton
          block
          tts={t('unitScreen.story.continue')}
          color={dimensionColor}
          onPress={finish}
        />
      </ScreenBase>
    )
  }

  const renderTaskPageActions = () => {
    const hasNextPage = page < unitDoc.pages.length - 1
    const isLast = (session.progress ?? 0) === (session.unitSet?.progress ?? 1)

    if (!showCorrectResponse) {
      return (
        <ActionButton
          block
          align='center'
          tts={t('unitScreen.actions.check')}
          color={dimensionColor}
          icon='edit'
          onPress={checkScore}
        />
      )
    }

    if (isLast) {
      return (
        <ActionButton
          block
          align='center'
          tts={t('unitScreen.actions.finish')}
          color={dimensionColor}
          onPress={finish}
        />
      )
    }

    if (hasNextPage) {
      return (
        <ActionButton
          block
          align='center'
          tts={t('unitScreen.actions.next')}
          icon='arrow-right'
          color={dimensionColor}
          onPress={nextPage}
        />
      )
    }

    return (
      <ActionButton
        block
        tts={t('unitScreen.actions.complete')}
        color={dimensionColor}
        onPress={finish}
      />
    )
  }

  return (
    <ScreenBase {...docs} style={styles.container}>
      {show && <UnitRenderer
        unitDoc={unitDoc}
        dimensionColor={dimensionColor}
        page={page}
        showCorrectResponse={showCorrectResponse}
        submitResponse={submitResponse}
        allTrue={allTrue}
        taskPageAction={renderTaskPageActions}
        scoreResult={scoreResult}
        dimension={dimension}
               />}
    </ScreenBase>
  )
}

const styles = createStyleSheet({
  container: {
    ...Layout.container({ margin: '1%' })
  },
  confirm: {
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.dark
  }
})

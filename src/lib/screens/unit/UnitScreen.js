import React, { useState, useEffect, useRef, useContext } from 'react'
import {
  View,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Vibration
} from 'react-native'
import { Log } from '../../infrastructure/Log'
import { Layout } from '../../constants/Layout'
import { useContentElementFactory } from '../../components/factories/UnitContentElementFactory'
import { Icon } from 'react-native-elements'
import Colors from '../../constants/Colors'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { loadDocs } from '../../meteor/loadDocs'
import { loadUnitData } from './loadUnitData'
import { ActionButton } from '../../components/ActionButton'
import { useTranslation } from 'react-i18next'
import { completeUnit } from './completeUnit'
import { getScoring } from '../../scoring/getScoring'
import { Confirm } from '../../components/Confirm'
import { getDimensionColor } from './getDimensionColor'
import { shouldRenderStory } from './shouldRenderStory'
import { sendResponse } from './sendResponse'
import { toArrayIfNot } from '../../utils/toArrayIfNot'
import { useTts } from '../../components/Tts'
import { LeaText } from '../../components/LeaText'
import { AppSessionContext } from '../../state/AppSessionContext'
import { ScreenBase } from '../BaseScreen'
import './registerComponents'
import { InstructionsGraphics } from '../../components/images/InstructionsGraphics'
import { Config } from '../../env/Config'
import { FadePanel } from '../../components/FadePanel'
import { Sound } from '../../env/Sound'
import { useKeyboardVisibilityHandler } from '../../hooks/useKeyboardVisibilityHandler'
import { InteractionGraph } from '../../infrastructure/log/InteractionGraph'
import { mergeStyles } from '../../styles/mergeStyles'

const log = Log.create('UnitScreen')

const RIGHT_ANSWER = 'rightAnswer'
const WRONG_ANSWER = 'wrongAnswer'

Sound.load(RIGHT_ANSWER, () => require('../../assets/audio/right_answer.wav'))
Sound.load(WRONG_ANSWER, () => require('../../assets/audio/wrong_answer.mp3'))

/**
 * On this screen, the respective Unit is displayed and the users can interact
 * with it, by solving the tasks on its pages.
 *
 * If a unit is completed and there is no next unit in the queue, it navigates
 * the users to the {CompleteScreen}.
 *
 * If a next unit exists, it will load this next unit.
 *
 * On cancel, it navigates users back to the {MapScreen}.
 *
 * @category Screens
 * @component
 * @param props {object}
 * @param props.navigation {object} navigation API
 * @returns {JSX.Element}
 */
const UnitScreen = props => {
  // We need to know the Keyboard state in order to show or hide elements.
  // For example: In "editing" mode of a writing item we want to hide the "check" button.
  const [keyboardStatus, setKeyboardStatus] = useState(undefined)
  const [fadeIn, setFadeIn] = useState(-1)

  useKeyboardVisibilityHandler(({ status }) => {
    if (status === 'shown') {
      setKeyboardStatus('shown')
    }
    if (status === 'hidden') {
      setKeyboardStatus('hidden')
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }
  })

  const responseRef = useRef({})
  const scoreRef = useRef({})
  const scrollViewRef = useRef()
  const [scored, setScored] = useState()
  const [allTrue, setAllTrue] = useState()
  const [session, sessionActions] = useContext(AppSessionContext)
  const { unitSet, dimension } = session
  const docs = loadDocs({ fn: () => loadUnitData(unitSet) })
  const { t } = useTranslation()
  const { Tts } = useTts()

  const page = session.page || 0

  // ---------------------------------------------------------------------------r
  // update cards display
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (page === 0) {
      setFadeIn(0)
      const timer1 = setTimeout(() => setFadeIn(1), 500)
      const timer2 = setTimeout(() => setFadeIn(2), 1000)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }

    setFadeIn(2)
  }, [session.page])

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
    return (<ScreenBase {...docs} style={styles.container} />)
  }

  // ---------------------------------------------------------------------------
  // Used to dynamically render elements
  // ---------------------------------------------------------------------------
  const { Renderer } = useContentElementFactory()
  const { unitSetDoc, unitDoc, sessionDoc } = docs.data
  const showCorrectResponse = scored === page
  const dimensionColor = getDimensionColor(dimension)

  // ---------------------------------------------------------------------------
  // NAVIGATION
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

  // ---------------------------------------------------------------------------
  // RENDERING
  // ---------------------------------------------------------------------------

  const renderInstructions = (list) => {
    if (!list?.length) { return null }

    return (
      <InstructionsGraphics source={list[0]} color={dimensionColor} />
    )
  }

  /**
   *  This is the generic content rendering method, which
   *  applies to all content structure across units and unitSets
   *  with their story pages.
   *  Rendering of the elements is delegated to their respective
   *  registered renderer using the {UnitContentElementFactory}
   **/
  const renderContent = (list) => {
    if (!list?.length) { return null }

    return list.map((element, index) => {
      const elementData = { ...element }
      elementData.dimensionColor = dimensionColor

      // item elements are "interactive" beyond tts
      // and require their own view and handlers
      if (element.type === 'item') {
        elementData.submitResponse = submitResponse
        elementData.showCorrectResponse = showCorrectResponse
        elementData.scoreResult = showCorrectResponse && scoreRef.current[page]
        return (
          <KeyboardAvoidingView
            key={index}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.itemContainer}
          >
            <Renderer {...elementData} />
          </KeyboardAvoidingView>
        )
      }

      // all other elements are simply "display" elements
      return (<Renderer key={index} {...elementData} />)
    })
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
        <ScrollView ref={scrollViewRef} style={styles.scrollView} keyboardShouldPersistTaps='always'>
          <View style={mergeStyles(styles.unitCard, dropShadow)}>
            {renderContent(unitSetDoc.story)}
          </View>
        </ScrollView>

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

  // ---------------------------------------------------------------------------
  // TASK DISPLAY
  // ---------------------------------------------------------------------------
  log('render unit', unitDoc._id, unitDoc.shortCode, 'page=', page, 'checked=', scored)

  const submitResponse = async ({ responses, data }) => {
    log('item submit', data.contentId, responses)
    responseRef.current[page] = { responses, data }
  }

  const checkScore = async () => {
    // get scoring method
    const currentResponse = responseRef.current[page]
    log('check score', { currentResponse })

    if (!currentResponse || !currentResponse.data || !currentResponse.responses) {
      throw new Error('Response always needs to exist')
    }

    const { responses, data } = currentResponse
    const { type, subtype, value } = data
    const itemDoc = { type, subtype, ...value }
    const scoreResult = await getScoring(itemDoc, { responses })
    scoreRef.current[page] = scoreResult

    log('score', type, subtype, scoreResult.score)

    // submit everything (in the background)
    const responseDoc = {}

    /*
     userId: String,
     sessionId: String,
     unitSetId: String,
     unitId: String,
     dimensionId: String,
     timeStamp: Date,
     page: Number,
     itemId: String,
     itemType: String,
     scores: Array,
     'scores.$': Object,
     'scores.$.competency': Array,
     'scores.$.competency.$': String,
     'scores.$.correctResponse': Array,
     'scores.$.correctResponse.$': {
     type: oneOf(String, Integer, RegExp)
     },
     'scores.$.isUndefined': Boolean,
     'scores.$.score': Boolean,
     'scores.$.value': Array,
     'scores.$.value.$': {
     type: oneOf(String, Integer)
     }
     */
    responseDoc.sessionId = sessionDoc._id
    responseDoc.unitSetId = unitSetDoc._id
    responseDoc.unitId = unitDoc._id
    responseDoc.dimensionId = dimension._id
    responseDoc.page = page
    responseDoc.itemId = data.contentId
    responseDoc.itemType = data.subtype
    responseDoc.scores = scoreResult.map(entry => {
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

    const competencies = responseDoc.scores.filter(entry => entry.score === true).length
    const prevCompetencies = session.competencies || 0
    sessionActions.competencies(prevCompetencies + competencies)

    log('submit response to server', responseDoc)
    await sendResponse({ responseDoc })

    setScored(page)

    // if all scores are true then we add another box
    // with positive reinforcement
    if (scoreResult.every(entry => entry.score)) {
      setAllTrue(page)
      Vibration.vibrate(500)
      scrollViewRef.current?.scrollToEnd({ animated: true })
      await Sound.play(RIGHT_ANSWER)
    }
    else {
      Vibration.vibrate(100)
      await Sound.play(WRONG_ANSWER)
    }
  }

  const nextPage = () => {
    setFadeIn(1) // fade out content
    setAllTrue(-1)
    setTimeout(() => {
      sessionActions.multi({
        page: page + 1,
        progress: session.progress + 1
      })
    }, 500)
  }

  const renderFooter = () => {
    if (keyboardStatus === 'shown') {
      return null
    }
    return (
      <FadePanel style={styles.navigationButtons} visible={fadeIn >= 2}>
        {renderTaskPageAction()}
      </FadePanel>
    )
  }

  const renderTaskPageAction = () => {
    // if the page has not been checked yet we render a check-action button
    if (!showCorrectResponse) {
      return (
        <ActionButton
          block={true}
          align='center'
          tts={t('unitScreen.actions.check')}
          color={dimensionColor}
          onPress={checkScore}
        />
      )
    }

    // if this page has been scored, we can display a "continue" button
    // which either moves to the next page or completes the unit
    const hasNextPage = page < unitDoc.pages.length - 1
    const isLast = (session.progress ?? 0) === (session.unitSet?.progress ?? 1)

    if (isLast) {
      return (
        <ActionButton
          block={true}
          align='center'
          tts={t('unitScreen.actions.finish')}
          color={dimensionColor}
          onPress={finish}
        />
      )
    }

    if (hasNextPage) {
      log('render next page button')
      return (
        <ActionButton
          block={true}
          align='center'
          tts={t('unitScreen.actions.next')} color={dimensionColor}
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

  const renderAllTrue = () => {
    if (allTrue !== page) {
      return null
    }

    return (
      <View style={{ ...styles.unitCard, ...styles.allTrue }}>
        <Tts color={Colors.success} align='center' iconColor={Colors.success} text={t('unitScreen.allTrue')} />
        <Icon
          testID='alltrue-icon'
          reverse
          color={Colors.success}
          size={20}
          name='thumbs-up'
          type='font-awesome-5'
        />
      </View>
    )
  }

  const renderUnitTitle = () => {
    if (!Config.debug.unit) {
      return
    }

    return (
      <View style={styles.unitCard}>
        <LeaText>{unitDoc.shortCode}</LeaText>
      </View>
    )
  }

  return (
    <ScreenBase {...docs} style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollView}
        persistentScrollbar={true}
        keyboardShouldPersistTaps='always'
      >
        {renderUnitTitle()}

        {/* 1. PART STIMULI */}
        <FadePanel style={mergeStyles(styles.unitCard, dropShadow)} visible={fadeIn >= 0}>
          {renderContent(unitDoc.stimuli)}
        </FadePanel>

        {/* 2. PART INSTRUCTIONS */}
        <FadePanel style={{ ...styles.unitCard, ...dropShadow, paddingTop: 0 }} visible={fadeIn >= 1}>
          <LeaText style={styles.pageText}>
            <Icon
              testID='info-icon'
              reverse
              color={Colors.gray}
              size={10}
              name='info'
              type='font-awesome-5'
            />
          </LeaText>
          {renderInstructions(unitDoc.instructions)}
        </FadePanel>

        {/* 3. PART TASK PAGE CONTENT */}
        <FadePanel style={{ ...styles.unitCard, borderWidth: 3, borderColor: Colors.gray, paddingTop: 0, paddingBottom: 20 }} visible={fadeIn >= 2}>
          <LeaText style={styles.pageText}>{page + 1} / {unitDoc.pages.length}</LeaText>

          {renderContent(unitDoc.pages[page]?.instructions)}

          {renderContent(unitDoc.pages[page]?.content)}
        </FadePanel>

        {renderAllTrue()}

        {renderFooter()}
      </ScrollView>
    </ScreenBase>
  )
}

const dropShadow = Layout.dropShadow()

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  container: {
    ...Layout.container({ margin: '1%' })
  },
  itemContainer: {
    flex: 1,
    marginTop: 10,
    marginBottom: 10
  },
  scrollView: {
    flexGrow: 1
  },
  element: {
    flex: 1,
    alignItems: 'stretch'
  },
  navigationButtons: {
    paddingTop: 7,
    marginBottom: 15,
    marginLeft: 4,
    marginRight: 4,
    alignItems: 'stretch'
  },
  routeButtonContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center'
  },
  unitCard: {
    ...Layout.container(),
    margin: 0,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 5,
    borderColor: Colors.white,
    overflow: 'visible',
    marginTop: 2,
    marginBottom: 10,
    marginLeft: 4,
    marginRight: 4
  },
  pageText: {
    alignSelf: 'center',
    backgroundColor: Colors.gray,
    color: Colors.white,
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 0,
    marginBottom: 4,
    fontSize: 16,
    borderWidth: 0.5,
    borderColor: Colors.gray
  },
  allTrue: {
    flexDirection: 'row',
    alignItems: 'stretch',
    alignContent: 'flex-start',
    justifyContent: 'space-between',
    flexShrink: 1,
    borderColor: Colors.success,
    backgroundColor: '#eaffee',
    borderWidth: 4
  },
  // navbar
  confirm: {
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.dark
  }
})

export default UnitScreen

import React, { useState, useEffect, useRef, useContext } from 'react'
import {
  View,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
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
import { CurrentProgress } from '../../components/CurrentProgress'
import './registerComponents'

const log = Log.create('UnitScreen')

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
  const keyboardDidShow = () => setKeyboardStatus('shown')
  const keyboardDidHide = () => {
    setKeyboardStatus('hidden')
    scrollViewRef.current?.scrollToEnd({ animated: true })
  }

  useEffect(() => {
    const didShowSub = Keyboard.addListener('keyboardDidShow', keyboardDidShow)
    const didHideSub = Keyboard.addListener('keyboardDidHide', keyboardDidHide)

    // cleanup function
    return () => {
      didShowSub.remove()
      didHideSub.remove()
    }
  }, [])

  const responseRef = useRef({})
  const scoreRef = useRef({})
  const scrollViewRef = useRef()
  const [scored, setScored] = useState()
  const [allTrue, setAllTrue] = useState()
  const [session, sessionActions] = useContext(AppSessionContext)
  const { unitSet, dimension } = session
  const docs = loadDocs(() => loadUnitData(unitSet))
  const { t } = useTranslation()
  const { Tts } = useTts()

  const page = session.page || 0

  // ---------------------------------------------------------------------------
  // Navigation updates
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const current = session.progress ?? 0
    const max = session.unitSet?.progress ?? 1
    const value = (current + 1) / (max + 1)

    props.navigation.setOptions({
      headerTitle: () => (<CurrentProgress value={value} dimension={session.dimension}/>)
    })
  }, [session.progress, session.unitSet])

  useEffect(() => {
    //If users attempt to cancel we surely first show a modal
    // and ask if cancelling was intended.
    const cancelUnit = async () => {
      // todo send cancel information silently to server

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
          id="unit-screen-confirm"
          pressable={true}
          question={t('unitScreen.abort.question')}
          approveText={t('unitScreen.abort.abort')}
          denyText={t('unitScreen.abort.continue')}
          onApprove={() => cancelUnit()}
          onDeny={() => {}}
          icon="times"
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
    const beforeGoingBack = (e) => {
      // GO_BACK is the action type from the device's back button
      // where we launch the modal and prevent the event from firing
      if (e.data.action.type === 'GO_BACK') {
        e.preventDefault()
        // trigger modal
      }
    }

    props.navigation.addListener('beforeRemove', beforeGoingBack)

    // remove listeners on destroy
    return () => props.navigation.removeListener('beforeRemove', beforeGoingBack)
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
    sessionActions.progress(session.progress  + 1)
    return nextUnitId
      ? props.navigation.push('unit')
      : props.navigation.navigate('complete')
  }

  // ---------------------------------------------------------------------------
  // RENDERING
  // ---------------------------------------------------------------------------

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
        <ScrollView ref={scrollViewRef} style={styles.scrollView} keyboardShouldPersistTaps="always">
          <View style={styles.unitCard}>
            {renderContent(unitSetDoc.story)}
          </View>
        </ScrollView>

        {/* -------- continue button ---------  */}
        <ActionButton
          block={true}
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
  log('render unit', unitDoc._id, unitDoc.shortCode, 'page', page, 'checked', scored)

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

    console.debug('get competencies')
    const competencies =  responseDoc.scores.filter(entry => entry.score === true).length
    const prevCompetencies = session.competencies || 0
    console.debug({ competencies, prevCompetencies })
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
    }
    else {
      Vibration.vibrate(100)
    }
  }

  const nextPage = () => sessionActions.multi({
    page: page + 1,
    progress: session.progress + 1
  })

  const renderFooter = () => {
    if (keyboardStatus === 'shown') {
      return null
    }
    return (
      <View style={styles.navigationButtons}>
        {renderTaskPageAction()}
      </View>
    )
  }

  const renderTaskPageAction = () => {
    // if the page has not been checked yet we render a check-action button
    if (!showCorrectResponse) {
      return (
        <ActionButton
          block={true}
          tts={t('unitScreen.actions.check')}
          color={dimensionColor}
          onPress={checkScore}
        />
      )
    }

    // if this page has been scored, we can display a "continue" button
    // which either moves to the next page or completes the unit

    const hasNextPage = page < unitDoc.pages.length - 1

    if (hasNextPage) {
      log('render next page button')
      return (
        <ActionButton
          block={true}
          tts={t('unitScreen.actions.next')} color={dimensionColor}
          onPress={nextPage}
        />
      )
    }

    log('render complete unit button')
    return (
      <ActionButton
        block={true}
        tts={t('unitScreen.actions.complete')}
        color={dimensionColor} onPress={finish}
      />
    )
  }

  const renderAllTrue = () => {
    if (allTrue !== page) {
      return null
    }

    return (
      <View style={{ ...styles.unitCard, ...styles.allTrue }}>
        <Tts color={Colors.success} iconColor={Colors.success} text={t('unitScreen.allTrue')}/>
        <Icon
          testID="alltrue-icon"
          reverse
          color={Colors.success}
          size={20}
          name="thumbs-up"
          type="font-awesome-5"
        />
      </View>
    )
  }

  return (
    <ScreenBase {...docs} style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        keyboardShouldPersistTaps="always"
      >

        {/* 1. PART STIMULI */}
        <View style={styles.unitCard}>
          {renderContent(unitDoc.stimuli)}
        </View>

        {/* 2. PART INSTRUCTIONS */}
        <View style={{ ...styles.unitCard, paddingTop: 0 }}>
          <LeaText style={styles.pageText}>
            <Icon
              testID="info-icon"
              reverse
              color={Colors.dark}
              size={10}
              name="info"
              type="font-awesome-5"
            />
          </LeaText>
          {renderContent(unitDoc.instructions)}
        </View>

        {/* 3. PART TASK PAGE CONTENT */}
        <View  style={{ ...styles.unitCard, borderWidth: 4, borderColor: Colors.dark, paddingTop: 0, paddingBottom: 20 }}>
          <LeaText style={styles.pageText}>{page + 1} / {unitDoc.pages.length}</LeaText>

          {renderContent(unitDoc.pages[page].instructions)}

          {renderContent(unitDoc.pages[page].content)}
        </View>

        {renderAllTrue()}

      </ScrollView>
      {renderFooter()}
    </ScreenBase>
  )
}

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  container: {
    ...Layout.container({ margin: '2%' })
  },
  itemContainer: {
    flex: 1,
    marginTop: 10,
    marginBottom: 10,
  },
  scrollView: {
    width: '100%',
  },
  element: {
    flex: 1,
    alignItems: 'stretch'
  },
  navigationButtons: {
    paddingTop: 7,
    borderTopWidth: 0.5,
    borderTop: Colors.gray,
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
    ...Layout.dropShadow(),
    overflow: 'visible',
    marginTop: 2,
    marginBottom: 10,
    marginLeft: 8,
    marginRight: 8
  },
  pageText: {
    alignSelf: 'center',
    backgroundColor: Colors.dark,
    color: Colors.light,
    padding: 3,
    borderColor: Colors.dark
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

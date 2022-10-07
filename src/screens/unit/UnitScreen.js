import React, { useState, useEffect, useRef } from 'react'
import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Vibration
} from 'react-native'
import { Log } from '../../infrastructure/Log'
import { Layout } from '../../constants/Layout'
import { UnitContentElementFactory } from '../../components/factories/UnitContentElementFactory'
import { Config } from '../../env/Config'
import { LinearProgress, Icon } from 'react-native-elements'
import Colors from '../../constants/Colors'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { loadDocs } from '../../meteor/loadDocs'
import { loadUnitData } from './loadUnitData'
import { Loading } from '../../components/Loading'
import { ActionButton } from '../../components/ActionButton'
import { useTranslation } from 'react-i18next'
import { completeUnit } from './completeUnit'
import { getScoring } from '../../scoring/getScoring'
import { Navbar } from '../../components/Navbar'
import { ProfileButton } from '../../components/ProfileButton'
import { Confirm } from '../../components/Confirm'
import { getDimensionColor } from './getDimensionColor'
import { shouldRenderStory } from './shouldRenderStory'
import { sendResponse } from './sendResponse'
import { toArrayIfNot } from '../../utils/toArrayIfNot'
import './registerComponents'
import { TTSengine } from '../../components/Tts'
import { ErrorMessage } from '../../components/ErrorMessage'
import { collectScoreForComplete } from './collectScoreForComplete'

const Tts = TTSengine.component()
/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  container: Layout.containter(),
  body: {
    flex: 2,
    flexDirection: 'row'
  },
  scrollView: {
    marginHorizontal: 20,
    width: '100%'
  },
  safeAreaView: {
    flex: 1,
    width: '100%',
    alignItems: 'center'
  },
  elements: {
    alignItems: 'center',
    flex: 1
  },
  element: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row'
  },
  navigationButtons: {
    flexDirection: 'row'
  },
  routeButtonContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center'
  },
  unitCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    margin: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#fff',
    // dropshadow - ios only
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    // dropshadow - android only
    elevation: 5
  },
  pageText: {
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
  },
  progressContainer: {
    flex: 1,
    flexGrow: 6,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center'
  },
  progressBar: { height: 16, borderRadius: 16, borderWidth: 1 }
})

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

  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const responseRef = useRef({})
  const scoreRef = useRef({})
  const scrollViewRef = useRef()
  const [scored, setScored] = useState()
  const [allTrue, setAllTrue] = useState()
  const docs = loadDocs(loadUnitData)

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

  /**
   * Renders the shortCode of the current unit or unitSet if
   * Config.debug.unit is true.
   */
  const renderDebugTitle = () => {
    if (!Config.debug.unit) {
      return null
    }
    const title = unitDoc
      ? unitDoc.shortCode
      : unitSetDoc.shortCode
    return (<Text>{title}</Text>)
  }

  /**
   * Renders the navbar. Navbar needs to be available early on, because
   * we also render it when we show <Loading> or <ErrorMessage>
   */
  const renderNavBar = ({ dimensionColor, value }) => {
    return (
      <Navbar>
        <Confirm
          id='unit-screen-confirm'
          question={t('unitScreen.abort.question')}
          approveText={t('unitScreen.abort.abort')}
          denyText={t('unitScreen.abort.continue')}
          onApprove={() => cancelUnit()}
          onDeny={() => {}}
          icon='times'
          tts={false}
          style={styles.confirm}
        />
        <View style={styles.progressContainer}>
          <LinearProgress
            style={{ borderColor: dimensionColor, ...styles.progressBar }}
            trackColor='transparent'
            color={dimensionColor} value={value} variant='determinate'
          />
          {renderDebugTitle()}
        </View>
        <ProfileButton onPress={() => props.navigation.navigate('Profile')} />
      </Navbar>
    )
  }

  // ---------------------------------------------------------------------------
  // skip early until docs are fully loaded
  // ---------------------------------------------------------------------------

  if (!docs || docs.loading) {
    return (
      <View style={styles.container}>
        {renderNavBar({ dimensionColor: null, value: 0 })}
        <Loading />
      </View>
    )
  }

  const nodata = docs.data === null || docs.data === undefined
  const loadFailed = !docs.loading && nodata

  if (docs.error || loadFailed) {
    log('no data available, display fallback', { docs })
    return (
      <View style={styles.container}>
        {renderNavBar({ dimensionColor: null, value: 0 })}
        <ErrorMessage
          error={docs.error}
          message={t('unitScreen.notAvailable')}
          label={t('actions.back')}
          onConfirm={() => props.navigation.navigate('Map')}
        />
      </View>
    )
  }

  const { unitSetDoc, unitDoc, sessionDoc } = docs.data
  const showCorrectResponse = scored === page
  const dimensionColor = getDimensionColor(unitSetDoc.dimension)

  // ---------------------------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------------------------

  /**
   * If users attempt to cancel we surely first show a modal
   * and ask if cancelling was intended.
   * This method is called, when users have approved to cancel
   * @return {Promise<void>}
   */
  const cancelUnit = async () => {
    // todo send cancel information silently to server

    const state = props.navigation.getState()
    const dimensionRoute = state.routes.find(r => r.name === 'Dimension')

    if (!dimensionRoute) {
      props.navigation.navigate('Dimension')
    } else {
      props.navigation.navigate({ key: dimensionRoute.key })
    }
  }

  /**
   * Completes the unit and awaits the server response.
   * Based on the returned route it either cycles into the next unit
   * or navigates to the resulting route (usually complete screen).
   */
  const finish = async () => {
    const nextUnitId = await completeUnit({ unitSetDoc, sessionDoc, unitDoc })

    return nextUnitId
      ? props.navigation.push('Unit')
      : props.navigation.navigate('Complete')
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
            style={styles.container}
          >
            <UnitContentElementFactory.Renderer {...elementData} />
          </KeyboardAvoidingView>
        )
      }

      // all other elements are simply "display" elements
      return (
        <View key={index} style={styles.element}>
          <UnitContentElementFactory.Renderer key={index} {...elementData} />
        </View>
      )
    })
  }

  // ---------------------------------------------------------------------------
  // STORY DISPLAY
  // ---------------------------------------------------------------------------

  // if this is the very beginning of this unit set AND
  // we have a story to render, let's do it right now

  if (shouldRenderStory({ sessionDoc, unitSetDoc })) {
    log('render story', unitSetDoc.shortCode)
    const currentProgress = 1 / unitSetDoc.progress
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeAreaView}>
          <ScrollView
            ref={scrollViewRef} style={styles.scrollView}
            keyboardShouldPersistTaps='always'
          >
            {renderNavBar({ dimensionColor, value: currentProgress })}
            <View style={styles.elements}>
              {renderContent(unitSetDoc.story)}
            </View>
          </ScrollView>
        </SafeAreaView>

        {/* -------- continue button ---------  */}
        <View style={styles.navigationButtons}>
          <ActionButton
            tts={t('unitScreen.story.continue')}
            color={dimensionColor} onPress={finish}
          />
        </View>
      </View>
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
    responseDoc.dimensionId = unitSetDoc.dimension
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

    responseDoc.scores.forEach(entry => collectScoreForComplete(entry.score))

    log('submit response to server', responseDoc)
    await sendResponse({ responseDoc })

    setScored(page)

    // if all scores are true then we add another box
    // with positive reinforcement
    if (scoreResult.every(entry => entry.score)) {
      setAllTrue(page)
      Vibration.vibrate(500)
      scrollViewRef.current?.scrollToEnd({ animated: true })
    } else {
      Vibration.vibrate(100)
    }
  }

  const nextPage = () => setPage(page + 1)

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
      log('render check button')
      return (
        <ActionButton
          tts={t('unitScreen.actions.check')} color={dimensionColor}
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
          tts={t('unitScreen.actions.next')} color={dimensionColor}
          onPress={nextPage}
        />
      )
    }

    log('render complete unit button')
    return (
      <ActionButton
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
        <Tts color={Colors.success} iconColor={Colors.success} text={t('unitScreen.allTrue')} />
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

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaView}>
        {renderNavBar({ dimensionColor, value: 0.5 })}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          keyboardShouldPersistTaps='always'
        >

          {/* 1. PART STIMULI */}
          <View style={styles.unitCard}>
            {renderContent(unitDoc.stimuli)}
          </View>

          {/* 2. PART INSTRUCTIONS */}
          <View style={{ ...styles.unitCard, paddingTop: 0 }}>
            <Text style={styles.pageText}>
              <Icon
                testID='info-icon'
                reverse
                color={Colors.dark}
                size={8}
                name='info'
                type='font-awesome-5'
              />
            </Text>
            {renderContent(unitDoc.instructions)}
          </View>

          {/* 3. PART TASK PAGE CONTENT */}
          <View style={{ ...styles.unitCard, borderWidth: 4, borderColor: Colors.dark, paddingTop: 0, paddingBottom: 20 }}>
            <Text style={styles.pageText}>{page + 1} / {unitDoc.pages.length}</Text>

            {renderContent(unitDoc.pages[page].instructions)}

            {renderContent(unitDoc.pages[page].content)}
          </View>

          {renderAllTrue()}

        </ScrollView>
      </SafeAreaView>
      {/* -------- continue button ---------  */}
      {renderFooter()}
    </View>
  )
}

export default UnitScreen

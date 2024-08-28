import React, { useRef, useEffect, useState } from 'react'
import { KeyboardAvoidingView, ScrollView, Vibration, View } from 'react-native'
import { FadePanel } from '../../../components/FadePanel'
import { mergeStyles } from '../../../styles/mergeStyles'
import { LeaText } from '../../../components/LeaText'
import { Icon } from 'react-native-elements'
import { Colors } from '../../../constants/Colors'
import { createStyleSheet } from '../../../styles/createStyleSheet'
import { InstructionsGraphicsRenderer } from './InstructionsGraphicsRenderer'
import { useTranslation } from 'react-i18next'
import { TTSengine, useTts } from '../../../components/Tts'
import { Layout } from '../../../constants/Layout'
import { useKeyboardVisibilityHandler } from '../../../hooks/useKeyboardVisibilityHandler'
import { Sound } from '../../../env/Sound'
import { unitCardStyles } from './unitCardStyles'
import { ContentRenderer } from './ContentRenderer'
import { useItemSubType } from '../useItemSubType'
import { Log } from '../../../infrastructure/Log'
import { isIOS } from '../../../utils/isIOS'

const PureContentRenderer = React.memo(ContentRenderer)
const debug = Log.create('UnitRenderer', 'debug')
/**
 * Renders the Unit, independent of the surrounding
 * environment.
 *
 * Includes all components, necessary to display elements
 * and interact with them but contains no neither logic
 * for loading data, nor on processing and evaluating inputs.
 *
 * Still, keep in mind, that it's not a PureComponent!
 *
 * @param props {object}
 * @component
 */
export const UnitRenderer = props => {
  const [keyboardStatus, setKeyboardStatus] = useState(undefined)
  const [fadeIn, setFadeIn] = useState(-1)
  const { t } = useTranslation()
  const { Tts } = useTts()
  const scrollViewRef = useRef()
  const lastScrollPos = useRef({ x: 0, y: 0 }).current

  const {
    unitDoc,
    dimensionColor,
    page,
    submitResponse,
    showCorrectResponse,
    scoreResult,
    allTrue,
    taskPageAction
  } = props
  const unitId = unitDoc?._id
  const itemSubtype = useItemSubType({ unitDoc, page })

  // We need to know the Keyboard state in order to show or hide elements.
  // For example: In "editing" mode of a writing item we want to hide the "check" button.
  useKeyboardVisibilityHandler(({ status }) => {
    debug('keyboard visibility changed', status)

    if (status === 'shown') {
      setKeyboardStatus('shown')
    }
    if (status === 'hidden') {
      setKeyboardStatus('hidden')
      // scrollViewRef.current?.scrollToEnd({ animated: true })
      scrollViewRef.current?.scrollTo({
        x: lastScrollPos.x,
        y: lastScrollPos.y,
        animated: true
      })
    }
  })

  const updateLastScrollPos = e => {
    const { contentOffset } = e.nativeEvent
    lastScrollPos.x = contentOffset.x
    lastScrollPos.y = contentOffset.y
  }

  // we want to have our cards appearing in intervals
  useEffect(() => {
    let timer1
    let timer2

    if (page === 0) {
      setFadeIn(0)
      timer1 = setTimeout(() => setFadeIn(1), 500)
      timer2 = setTimeout(() => setFadeIn(2), 1000)
    }

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [page])

  useEffect(() => {
    if (showCorrectResponse) {
      const handleResponse = async () => {
        if (allTrue) {
          Vibration.vibrate(500)
          scrollViewRef.current?.scrollToEnd({ animated: true })
          TTSengine.stop()
          await Sound.play(RIGHT_ANSWER)
        }
        else {
          Vibration.vibrate(100)
          TTSengine.stop()
          await Sound.play(WRONG_ANSWER)
        }
      }
      handleResponse().catch(Log.error)
    }
  }, [showCorrectResponse, allTrue])

  const renderInstructions = () => {
    const instructions = (unitDoc.pages[page]?.instructions ?? unitDoc.instructions)?.[0]

    if (!instructions) {
      return null
    }

    return (
      <FadePanel style={mergeStyles(unitCardStyles, styles.instructionStyles)} visible={fadeIn >= 1}>
        <View style={styles.pageText}>
          <Icon
            testID='info-icon'
            reverse
            color={Colors.gray}
            size={10}
            name='info'
            type='font-awesome-5'
          />
        </View>
        <InstructionsGraphicsRenderer
          subtype={itemSubtype.subtype}
          text={instructions.value}
          color={dimensionColor}
          page={page}
        />
      </FadePanel>
    )
  }

  const renderAllTrue = () => {
    if (!showCorrectResponse || !allTrue) {
      return null
    }

    return (
      <View style={{ ...unitCardStyles, ...styles.allTrue }}>
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

  const renderFooter = () => {
    if (keyboardStatus === 'shown') {
      return null
    }
    return (
      <FadePanel style={styles.navigationButtons} visible={fadeIn >= 2}>
        {taskPageAction()}
      </FadePanel>
    )
  }

  return (
    <KeyboardAvoidingView keyboardVerticalOffset={50} behavior={isIOS() ? 'padding' : 'position'}>
      <ScrollView
        ref={scrollViewRef}
        onMomentumScrollEnd={updateLastScrollPos}
        contentContainerStyle={styles.scrollView}
        persistentScrollbar
        keyboardDismissMode='none'
        contentInset={{ bottom: 20 }}
        keyboardShouldPersistTaps='always'
        automaticallyAdjustKeyboardInsets
      >
        {/* 1. PART STIMULI */}
        <FadePanel style={mergeStyles(unitCardStyles, dropShadow)} visible={fadeIn >= 0}>
          <PureContentRenderer
            elements={unitDoc.stimuli}
            keyPrefix={`${unitId}-stimuli`}
            dimensionColor={dimensionColor}
          />
        </FadePanel>

        {/* 2. PART INSTRUCTIONS */}
        {renderInstructions()}

        {/* 3. PART TASK PAGE CONTENT */}
        <FadePanel
          style={{ ...unitCardStyles, borderWidth: 3, borderColor: Colors.gray, paddingTop: 0, paddingBottom: 20 }}
          visible={fadeIn >= 2}
        >
          <LeaText style={styles.pageText}>{page + 1} / {unitDoc.pages.length}</LeaText>

          <PureContentRenderer
            elements={unitDoc.pages[page]?.content}
            keyPrefix={`${unitId}-${page}`}
            scoreResult={showCorrectResponse && scoreResult}
            showCorrectResponse={showCorrectResponse}
            dimensionColor={dimensionColor}
            submitResponse={submitResponse}
          />
        </FadePanel>

        {renderAllTrue()}

        {renderFooter()}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const RIGHT_ANSWER = 'rightAnswer'
const WRONG_ANSWER = 'wrongAnswer'

Sound.load(RIGHT_ANSWER, () => require('../../../assets/audio/right_answer.wav'))
Sound.load(WRONG_ANSWER, () => require('../../../assets/audio/wrong_answer.mp3'))

const styles = createStyleSheet({
  instructionStyles: {
    ...Layout.dropShadow(),
    paddingTop: 0,
    justifyContent: 'space-between'
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
  scrollView: {
    flexGrow: 1
  },
  navigationButtons: {
    paddingTop: 7,
    marginBottom: 15,
    marginLeft: 4,
    marginRight: 4,
    alignItems: 'stretch'
  }
})

const dropShadow = Layout.dropShadow()

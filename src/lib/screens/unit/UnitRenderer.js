import React, { useRef, useEffect, useState } from 'react'
import { ScrollView, Vibration, View } from 'react-native'
import { FadePanel } from '../../components/FadePanel'
import { mergeStyles } from '../../styles/mergeStyles'
import { LeaText } from '../../components/LeaText'
import { Icon } from 'react-native-elements'
import Colors from '../../constants/Colors'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { useContentElementFactory } from '../../components/factories/UnitContentElementFactory'
import { getDimensionColor } from './getDimensionColor'
import { InstructionsGraphics } from '../../components/images/InstructionsGraphics'
import { useTranslation } from 'react-i18next'
import { useTts } from '../../components/Tts'
import { Layout } from '../../constants/Layout'
import { useKeyboardVisibilityHandler } from '../../hooks/useKeyboardVisibilityHandler'
import { Sound } from '../../env/Sound'

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
 * @param props
 * @component
 */
export const UnitRenderer = props => {
  const [keyboardStatus, setKeyboardStatus] = useState(undefined)
  const [fadeIn, setFadeIn] = useState(-1)
  const { t } = useTranslation()
  const { Tts } = useTts()
  const { Renderer } = useContentElementFactory()
  const scrollViewRef = useRef()

  const { unitDoc, dimension, page, submitResponse, showCorrectResponse, scoreResult, allTrue, taskPageAction } = props
  const dimensionColor = getDimensionColor(dimension)

  // We need to know the Keyboard state in order to show or hide elements.
  // For example: In "editing" mode of a writing item we want to hide the "check" button.
  useKeyboardVisibilityHandler(({ status }) => {
    if (status === 'shown') {
      setKeyboardStatus('shown')
    }
    if (status === 'hidden') {
      setKeyboardStatus('hidden')
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }
  })

  // we want to have our cards appearing in intervals
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
  }, [page])

  useEffect(() => {
    if (showCorrectResponse) {
      const handleResponse = async () => {
        if (allTrue) {
          Vibration.vibrate(500)
          scrollViewRef.current?.scrollToEnd({ animated: true })
          await Sound.play(RIGHT_ANSWER)
        }
        else {
          Vibration.vibrate(100)
          await Sound.play(WRONG_ANSWER)
        }
      }
      handleResponse().catch(console.error)
    }
  }, [showCorrectResponse, allTrue])

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
        elementData.scoreResult = showCorrectResponse && scoreResult
      }

      // all other elements are simply "display" elements
      return (<Renderer key={index} style={styles.contentElement} {...elementData} />)
    })
  }

  const renderInstructions = (list) => {
    if (!list?.length) { return null }

    return (
      <InstructionsGraphics source={list[0]} color={dimensionColor} />
    )
  }

  const renderAllTrue = () => {
    if (!showCorrectResponse || !allTrue) {
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
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={styles.scrollView}
      persistentScrollbar
      keyboardShouldPersistTaps='always'
    >
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
      <FadePanel
        style={{ ...styles.unitCard, borderWidth: 3, borderColor: Colors.gray, paddingTop: 0, paddingBottom: 20 }}
        visible={fadeIn >= 2}
      >
        <LeaText style={styles.pageText}>{page + 1} / {unitDoc.pages.length}</LeaText>

        {renderContent(unitDoc.pages[page]?.instructions)}

        {renderContent(unitDoc.pages[page]?.content)}
      </FadePanel>

      {renderAllTrue()}

      {renderFooter()}
    </ScrollView>
  )
}

const RIGHT_ANSWER = 'rightAnswer'
const WRONG_ANSWER = 'wrongAnswer'

Sound.load(RIGHT_ANSWER, () => require('../../assets/audio/right_answer.wav'))
Sound.load(WRONG_ANSWER, () => require('../../assets/audio/wrong_answer.mp3'))

const styles = createStyleSheet({
  contentElement: {
    margin: 5
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

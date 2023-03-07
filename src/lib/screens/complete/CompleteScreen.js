import React, { useContext, useEffect, useState } from 'react'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Layout } from '../../constants/Layout'
import { AppSessionContext } from '../../state/AppSessionContext'
import { ScreenBase } from '../BaseScreen'
import { useTranslation } from 'react-i18next'
import { useDocs } from '../../meteor/useDocs'
import { loadCompleteData } from './loadCompleteData'
import { useTts } from '../../components/Tts'
import { getDimensionColor } from '../unit/getDimensionColor'
import { ActionButton } from '../../components/ActionButton'
import { Celebrate } from './Celebrate'
import { Vibration, View } from 'react-native'
import { Sound } from '../../env/Sound'
import { Log } from '../../infrastructure/Log'
import { generateFeedback } from './generateFeedback'

const COMPLETE = 'complete'

Sound.load(COMPLETE, () => require('../../assets/audio/trophy_animation.mp3'))

/**
 * This screen is shown, when no Units are in the queue anymore and the
 * user is to be informed about their overall progress.
 *
 * Navigates always back to the {MapScreen}.
 *
 * @category Screens
 * @component
 * @param props {object}
 * @param props.navigation {object} navigation API
 * @returns {JSX.Element}
 */
export const CompleteScreen = props => {
  const [percent, setPercent] = useState(-1)
  const [phrase, setPhrase] = useState()
  const { t } = useTranslation()
  const { Tts } = useTts()
  const [session, sessionActions] = useContext(AppSessionContext)
  const docs = useDocs({ fn: () => loadCompleteData(session) })
  const dimensionColor = getDimensionColor(session.dimension)

  // ---------------------------------------------------------------------------
  // Navigation updates
  // ---------------------------------------------------------------------------
  useEffect(() => {
    Vibration.vibrate(1000)
    Sound.play(COMPLETE).catch(Log.error)

    return () => Sound.unload()
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

  useEffect(() => {
    if (!session.competencies || !docs.data) {
      return
    }

    const threshold = session.competencies.scored / session.competencies.max
    const { feedbackDocs } = docs.data
    const feedback = generateFeedback({ threshold, feedbackDocs })
    setPhrase(feedback.phrase)
    setPercent(feedback.percent)
  }, [docs.data, session.competencies])

  const moveToMap = () => {
    // clear session variables: unit unitSet progress
    sessionActions.multi({
      unit: null,
      unitSet: null,
      progress: null,
      competencies: null,
      page: null,
      loadUserData: true
    })

    // clear the navigation stack and move to the map
    props.navigation.navigate('map')
  }

  const renderPhrase = () => {
    if (!phrase) { return null }
    // t('completeScreen.correctScores', { count: percent })
    return (
      <Tts
        align='center'
        text={phrase}
        color={dimensionColor}
        iconColor={dimensionColor}
        style={styles.phrase}
      />
    )
  }

  return (
    <ScreenBase {...docs} style={styles.container}>
      <View style={styles.section}>
        <Tts
          align='center'
          text={t('completeScreen.congratulations')}
          color={dimensionColor}
          iconColor={dimensionColor}
          fontStyle={styles.congrats}
        />
      </View>

      <View style={styles.section}>
        {renderPhrase()}
      </View>

      <View style={{ flex: 2 }}>
        <Celebrate percent={percent > -1 ? percent : null} />
      </View>
      <ActionButton block color={dimensionColor} title={t('completeScreen.continue')} onPress={moveToMap} />
    </ScreenBase>
  )
}

const styles = createStyleSheet({
  container: {
    ...Layout.container()
  },
  count: {
    alignSelf: 'center',
    lineHeight: 100,
    margin: 0,
    padding: 0,
    fontWeight: 'bold'
  },
  body: {
    flex: 2,
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
  congrats: {
    fontWeight: 'bold'
  },
  section: {
    flex: 1,
    justifyContent: 'center'
  }
})

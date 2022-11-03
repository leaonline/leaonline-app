import React, { useContext, useEffect } from 'react'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { CurrentProgress } from '../../components/CurrentProgress'
import { Layout } from '../../constants/Layout'
import { AppSessionContext } from '../../state/AppSessionContext'
import { ScreenBase } from '../BaseScreen'
import { useTranslation } from 'react-i18next'
import { loadDocs } from '../../meteor/loadDocs'
import { loadCompleteData } from './loadCompleteData'
import { useTts } from '../../components/Tts'
import { getDimensionColor } from '../unit/getDimensionColor'
import { LeaText } from '../../components/LeaText'

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
const CompleteScreen = props => {
  const { t } = useTranslation()
  const { Tts } = useTts()
  const [session] = useContext(AppSessionContext)
  const docs = loadDocs(() => loadCompleteData(session))
  const dimensionColor = getDimensionColor(session.dimension)

  // ---------------------------------------------------------------------------
  // Navigation updates
  // ---------------------------------------------------------------------------
  useEffect(() => {
    props.navigation.setOptions({
      headerTitle: () => (<CurrentProgress value={1} dimension={session.dimension}/>)
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

  const count = session.competencies || 0

  return (
    <ScreenBase {...docs} style={styles.container}>
      <Tts
        text={t('completeScreen.congratulations')}
        color={dimensionColor}
        iconColor={dimensionColor} />
      <Tts
        text={t('completeScreen.correctScores', { count })}
        color={dimensionColor}
        iconColor={dimensionColor}
      />
    </ScreenBase>
  )
}

const styles = createStyleSheet({
  container: {
    ...Layout.container()
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
  }
})

export default CompleteScreen

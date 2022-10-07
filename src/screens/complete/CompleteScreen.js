import React from 'react'
import { View } from 'react-native'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { useTranslation } from 'react-i18next'
import { loadDocs } from '../../meteor/loadDocs'
import { loadCompleteData } from './loadCompleteData'
import { Navbar } from '../../components/Navbar'
import { Confirm } from '../../components/Confirm'
import { LinearProgress } from 'react-native-elements'
import { ProfileButton } from '../../components/ProfileButton'
import { TTSengine } from '../../components/Tts'
import { Loading } from '../../components/Loading'
import { ErrorMessage } from '../../components/ErrorMessage'
import { ActionButton } from '../../components/ActionButton'
import { clearTestCycleData } from './clearTestCycleData'
import { Celebrate } from './Celebrate'
import Colors from '../../constants/Colors'
import { Layout } from '../../constants/Layout'

const Tts = TTSengine.component()

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  container: Layout.containter(),
  body: {
    flex: 1,
    flexDirection: 'row'
  },
  navigationButtons: {
    flex: 1,
    flexDirection: 'row'
  },
  routeButtonContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center'
  },
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

/**
 * This screen is shown, when no Units are in the queue anymore and the
 * user is to be informed about their overall progress.
 *
 * Structures as the following:
 *
 * on-top
 * - renders the cancel button, but it does not "cancel" the unit anymore
 * - renders the unitSet progress, at this time as complete/full bar
 * - renders the user profile button
 *
 * content
 * - displays a message "you did it!"
 * - renders the amount of correct solutions
 * - renders an animation with a trophy, falling stars and an applause sound
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
  const docs = loadDocs(loadCompleteData)

  /**
   * Renders the navbar. Navbar needs to be available early on, because
   * we also render it when we show <Loading> or <ErrorMessage>
   */
  const renderNavBar = ({ dimensionColor }) => {
    return (
      <Navbar>
        <Confirm
          id='complete-screen-confirm'
          question={t('unitScreen.abort.question')}
          approveText={t('unitScreen.abort.abort')}
          denyText={t('unitScreen.abort.continue')}
          onApprove={() => {}}
          onDeny={() => {}}
          icon='times'
          tts={false}
          style={styles.confirm}
          disabled
        />
        <View style={styles.progressContainer}>
          <LinearProgress
            style={{ borderColor: dimensionColor, ...styles.progressBar }}
            trackColor='transparent'
            color={dimensionColor} value={1} variant='determinate'
          />
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

  // ---------------------------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------------------------
  const { dimensionColor, count } = docs.data
  const finish = () => {
    props.navigation.navigate('Map')
    return clearTestCycleData()
  }

  return (
    <View style={styles.container}>
      {renderNavBar({ dimensionColor })}
      <Celebrate>
        <View>
          <Tts
            text={t('completeScreen.congratulations')}
            color={dimensionColor}
            iconColor={dimensionColor}
          />
          {count > 0
            ? (<Tts
                text={t('completeScreen.correctScores', { count })}
                color={dimensionColor}
                iconColor={dimensionColor}
               />)
            : null}
        </View>
      </Celebrate>
      <View style={styles.navigationButtons}>
        <ActionButton
          tts={t('completeScreen.continue')}
          color={dimensionColor} onPress={finish}
        />
      </View>
    </View>
  )
}

export default CompleteScreen

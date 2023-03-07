import React, { useCallback, useContext } from 'react'
import { useTts } from '../../components/Tts'
import { useTranslation } from 'react-i18next'
import { useDocs } from '../../meteor/useDocs'
import { loadHomeData } from './loadHomeData'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Colors } from '../../constants/Colors'
import { ScreenBase } from '../BaseScreen'
import { AppSessionContext } from '../../state/AppSessionContext'
import { Layout } from '../../constants/Layout'
import { ActionButton } from '../../components/ActionButton'
import { Fill } from '../../components/layout/Fill'
import { ScrollView, View } from 'react-native'
import { useSync } from '../sync/useSync'
import { SyncScreen } from '../sync/SyncScreen'

/**
 * The main screen for registered users. From here they can navigate to their
 * profile ({ProfileScreen}) or select a field of work to start new units (which navigates them
 * to the {MapScreen}.
 *
 * @category Screens
 * @component
 * @param props {object}
 * @param props.navigation {object} navigation API
 * @returns {JSX.Element}
 */
export const HomeScreen = props => {
  const { t } = useTranslation()
  const { Tts } = useTts()
  const [/* session */, sessionActions] = useContext(AppSessionContext)
  const { syncRequired, complete, progress } = useSync()
  const { data, error, loading } = useDocs({ fn: loadHomeData })
  const selectField = useCallback(async value => {
    const { _id, title } = value
    await sessionActions.multi({
      field: { _id, title },
      loadUserData: true
    })
    props.navigation.navigate('map')
  }, [sessionActions])

  /**
   * Renders the RouteButtons for the Homescreen
   */
  const renderButtons = useCallback(() => {
    return (data || []).map((item, key) => {
      return (
        <ActionButton
          key={key}
          title={item.title}
          icon={item.icon}
          iconColor={Colors.primary}
          block
          containerStyle={styles.buttonContainer}
          titleStyle={styles.buttonLabel}
          onPress={() => selectField(item)}
        />
      )
    })
  }, [data])

  if (syncRequired) {
    return (
      <SyncScreen progress={progress} complete={complete} />
    )
  }

  return (
    <ScreenBase data={data} loading={loading} error={error} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.textContainer}>
          <Tts
            id='homeScreen.text'
            text={t('homeScreen.text')}
            color={Colors.secondary}
            block
            align='flex-start'
          />
        </View>
        <View style={styles.buttons}>
          {renderButtons()}
        </View>
        <Fill />
      </ScrollView>
    </ScreenBase>
  )
}

const styles = createStyleSheet({
  container: {
    flex: 1,
    alignItems: 'stretch'
  },
  scrollContainer: {
    ...Layout.container(),
    flexGrow: 1,
    flex: 0
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  buttons: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 1
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 10
  },
  buttonLabel: {
    fontWeight: 'bold'
  }
})

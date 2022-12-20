import React, { useContext } from 'react'
import { useTts } from '../../components/Tts'
import { useTranslation } from 'react-i18next'
import { loadDocs } from '../../meteor/loadDocs'
import { loadHomeData } from './loadHomeData'
import { createStyleSheet } from '../../styles/createStyleSheet'
import Colors from '../../constants/Colors'
import { ScreenBase } from '../BaseScreen'
import { AppSessionContext } from '../../state/AppSessionContext'
import { Layout } from '../../constants/Layout'
import { ActionButton } from '../../components/ActionButton'
import { Fill } from '../../components/layout/Fill'

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
const HomeScreen = props => {
  const { t } = useTranslation()
  const { Tts } = useTts()
  const [/* session */, sessionActions] = useContext(AppSessionContext)
  const { data, error, loading } = loadDocs({ fn: loadHomeData })

  const selectField = async value => {
    const { _id, title } = value
    await sessionActions.multi({
      field: { _id, title },
      loadUserData: true
    })
    props.navigation.navigate('map')
  }

  /**
   * Renders the RouteButtons for the Homescreen
   */
  const renderButtons = () => {
    return (data || []).map((item, key) => {
      return (
        <ActionButton
          key={key}
          title={item.title}
          icon={item.icon}
          iconColor={Colors.primary}
          block={true}
          containerStyle={styles.buttonContainer}
          titleStyle={styles.buttonLabel}
          onPress={() => selectField(item)}
        />
      )
    })
  }

  return (
    <ScreenBase data={data} loading={loading} error={error} style={styles.container}>
      <Tts
        id='homeScreen.text'
        text={t('homeScreen.text')}
        color={Colors.secondary}
        block={true}
      />
      <Fill />
      {renderButtons()}
      <Fill />
    </ScreenBase>
  )
}

export default HomeScreen

const styles = createStyleSheet({
  container: Layout.container(),
  buttonContainer: {
    marginTop: 10,
    marginBottom: 10
  },
  buttonLabel: {
    color: '#890',
    fontWeight: 'bold'
  }
})

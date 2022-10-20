import React from 'react'
import { useTts } from '../../components/Tts'
import { useTranslation } from 'react-i18next'
import RouteButton from '../../components/RouteButton'
import { loadDocs } from '../../meteor/loadDocs'
import { loadHomeData } from './loadHomeData'
import { AppState } from '../../state/AppState'
import { createStyleSheet } from '../../styles/createStyleSheet'
import Colors from '../../constants/Colors'
import { ScreenBase } from '../BaseScreen'

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
  const { data, error, loading } = loadDocs(loadHomeData)

  const selectField = async value => {
    await AppState.field(value)
    props.navigation.navigate('Map')
  }

  /**
   * Renders the RouteButtons for the Homescreen
   */
  const renderButtons = () => {
    return (data || []).map((item, key) => {
      return (
        <RouteButton
          title={item.title} icon={item.icon} key={key}
          block
          handleScreen={() => selectField(item)}
        />
      )
    })
  }

  return (
    <ScreenBase data={data} loading={loading} error={error} style={styles.container}>
      <Tts
        text={t('homeScreen.text')} color={Colors.secondary}
        block
        id='homeScreen.text'
      />
      {renderButtons()}
    </ScreenBase>
  )
}

export default HomeScreen

const styles = createStyleSheet({
  container: {
    flex: 1,
    margin: '10%',
    alignItems: 'stretch',
    justifyItems: 'stretch',
    justifyContent: 'space-around'
  }
})

import React, { useContext, useEffect } from 'react'
import RouteButton from '../../components/RouteButton'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { loadDocs } from '../../meteor/loadDocs'
import { loadDimensionData } from './loadDimensionData'
import { ColorTypeMap } from '../../constants/ColorTypeMap'
import { Layout } from '../../constants/Layout'
import { Config } from '../../env/Config'
import { AppSessionContext } from '../../state/AppSessionContext'
import { ScreenBase } from '../BaseScreen'
import { useTts } from '../../components/Tts'
import { useTranslation } from 'react-i18next'
import { BackButton } from '../../components/BackButton'

/**
 * On this screen the users select a current Dimension to work with,
 * which can be reading, writing etc.
 *
 * This navigates the user to the {UnitScreen}, once the corresponding Unit
 * has been loaded.
 *
 * On cancel, it navigates back to the {MapScreen}
 *
 * @category Screens
 * @component
 * @param props {object}
 * @param props.navigation {object} navigation API
 * @returns {JSX.Element}
 */
const DimensionScreen = props => {
  const { t } = useTranslation()
  const { Tts } = useTts()
  const [session, sessionActions] = useContext(AppSessionContext)
  const docs = loadDocs(() => loadDimensionData(session.stage))

  useEffect(() => {
    const dimensionScreenTitle = session.field?.title ?? t('dimensionScreen.title')
    props.navigation.setOptions({
      title: dimensionScreenTitle,
      headerTitle: () => (<Tts align='center' text={dimensionScreenTitle} />)
    })
  }, [session.field])

  useEffect(() => {
    props.navigation.setOptions({
      headerLeft: () => (<BackButton icon='arrow-left' onPress={() => sessionActions.stage(null)} />)
    })
  }, [])

  const selectUnitSet = async unitSetDoc => {
    const { dimension, ...unitSet } = unitSetDoc
    await sessionActions.multi({ unitSet, dimension })
    props.navigation.navigate('unit')
  }

  const renderDimensions = () => {
    if (!docs?.data?.unitSets?.length) {
      return null
    }

    return docs.data.unitSets.map((unitSet, index) => {
      const color = ColorTypeMap.get(unitSet.dimension.colorType)
      const title = Config.debug.map
        ? unitSet.dimension.title + ' ' + unitSet.code
        : unitSet.dimension.title
      return (
        <RouteButton
          key={index}
          color={color}
          title={title}
          titleStyle={{ color }}
          block
          icon={unitSet.dimension.icon}
          handleScreen={() => selectUnitSet(unitSet)}
        />
      )
    })
  }

  return (
    <ScreenBase {...docs} style={styles.container}>
      <Tts text={t('dimensionScreen.instructions')} />
      {renderDimensions()}
    </ScreenBase>
  )
}

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  container: Layout.container(),
  instructions: {
    flex: 1
  },
  dimensionContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  iconNavigation: {
    paddingBottom: 5,
    padding: 100
  },
  routeButtonContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center'
  }
})

export default DimensionScreen

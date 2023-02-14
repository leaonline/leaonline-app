import React, { useContext, useEffect } from 'react'
import { RouteButton } from '../../components/RouteButton'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { useDocs } from '../../meteor/useDocs'
import { loadDimensionData } from './loadDimensionData'
import { ColorTypeMap } from '../../constants/ColorTypeMap'
import { Layout } from '../../constants/Layout'
import { Config } from '../../env/Config'
import { AppSessionContext } from '../../state/AppSessionContext'
import { ScreenBase } from '../BaseScreen'
import { useTts } from '../../components/Tts'
import { useTranslation } from 'react-i18next'
import { BackButton } from '../../components/BackButton'
import { View } from 'react-native'
import { Colors } from '../../constants/Colors'
import { StaticCircularProgress } from '../../components/progress/StaticCircularProgress'
import { Fill } from '../../components/layout/Fill'

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
export const DimensionScreen = props => {
  const { t } = useTranslation()
  const { Tts } = useTts()
  const [session, sessionActions] = useContext(AppSessionContext)
  const docs = useDocs({
    fn: () => loadDimensionData(session.stage),
    runArgs: [session.stage],
    allArgsRequired: true
  })

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
        <View style={styles.dimension} key={index}>
          <RouteButton
            color={color}
            title={title}
            block
            containerStyle={styles.buttonContainer}
            titleStyle={{ color, fontWeight: 'bold' }}
            icon={unitSet.dimension.icon}
            handleScreen={() => selectUnitSet(unitSet)}
          />
          <StaticCircularProgress
            value={unitSet.progressPercent ?? 0}
            maxValue={100}
            textColor={color}
            activeStrokeColor={color}
            inActiveStrokeColor={Colors.white}
            fillColor={Colors.white}
            inActiveStrokeOpacity={1}
            inActiveStrokeWidth={5}
            activeStrokeWidth={5}
            showProgressValue
            fontSize={12}
            valueSuffix='%'
            radius={20}
          />
        </View>
      )
    })
  }

  return (
    <ScreenBase {...docs} style={styles.container}>
      <Tts text={t('dimensionScreen.instructions')} block align='center' />
      {renderDimensions()}
      <Fill />
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
  dimension: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 10,
    marginBottom: 10
  },
  buttonContainer: {
    flexGrow: 1,
    flex: 1,
    marginRight: 5
  }
})

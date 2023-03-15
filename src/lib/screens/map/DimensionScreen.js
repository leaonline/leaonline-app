import React, { useContext, useEffect } from 'react'
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
import { ActionButton } from '../../components/ActionButton'
import { useProgress } from '../../hooks/useProgress'
import { useScreenIsActive } from '../../hooks/screenIsActive'

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
  const { progressDoc } = useProgress({ fieldId: session.field?._id })
  const docs = useDocs({
    fn: () => loadDimensionData(session.stage),
    runArgs: [session.stage],
    allArgsRequired: true
  })

  const { isActive } = useScreenIsActive()

  useEffect(() => {
    const dimensionScreenTitle = session.field?.title ?? t('dimensionScreen.title')
    props.navigation.setOptions({
      title: dimensionScreenTitle,
      headerTitle: () => (<Tts align='center' text={dimensionScreenTitle} />)
    })
  }, [session.field])

  useEffect(() => {
    props.navigation.setOptions({
      headerLeft: () => (<BackButton icon='arrow-left' onPress={() => sessionActions.update({ stage: null })} />)
    })
  }, [])

  if (!isActive) { return null }

  const selectUnitSet = async unitSetDoc => {
    const { dimension, competencies, ...unitSet } = unitSetDoc
    const initialCompetencies = {
      max: competencies,
      count: 0,
      scored: 0,
      percent: 0
    }
    await sessionActions.multi({ unitSet, dimension, competencies: initialCompetencies })
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

      const userProgress = progressDoc?.unitSets?.[unitSet._id]?.progress ?? unitSet.userProgress
      const progress = Math.round(
        (userProgress ?? 0) / (unitSet.progress ?? 1) * 100
      )
      return (
        <View style={styles.dimension} key={index}>
          <ActionButton
            color={color}
            title={title}
            block
            containerStyle={styles.buttonContainer}
            titleStyle={{ color, fontWeight: 'bold' }}
            icon={unitSet.dimension.icon}
            onPress={() => selectUnitSet(unitSet)}
          />
          <StaticCircularProgress
            value={progress ?? 0}
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
      <View style={styles.textContainer}>
        <Tts text={t('dimensionScreen.instructions')} block align='center' />
      </View>
      <View style={styles.textContainer}>
        {renderDimensions()}
      </View>
      <Fill />
    </ScreenBase>
  )
}

/**
 * @private
 */
const styles = createStyleSheet({
  container: {
    ...Layout.container()
  },
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
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

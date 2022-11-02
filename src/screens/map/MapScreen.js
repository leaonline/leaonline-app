import React, { useContext, useEffect } from 'react'
import { View, FlatList } from 'react-native'
import RouteButton from '../../components/RouteButton'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { loadDocs } from '../../meteor/loadDocs'
import { loadMapData } from './loadMapData'
import { Log } from '../../infrastructure/Log'
import { ColorTypeMap } from '../../constants/ColorTypeMap'
import { Layout } from '../../constants/Layout'
import Colors from '../../constants/Colors'
import { useTranslation } from 'react-i18next'
import { LeaText } from '../../components/LeaText'
import { StaticCircularProgress } from '../../components/StaticCircularProgress'
import { AppSessionContext } from '../../state/AppSessionContext'
import { ScreenBase } from '../BaseScreen'
import { useTts } from '../../components/Tts'
import { BackButton } from '../../components/BackButton'

const log = Log.create('MapScreen')

/**
 * The MapScreen displays available "stages" (levels) of difficulty
 * in form of a bottom-up Map.
 *
 * Selecting a stage will navigate the user to the {DimensionScreen}.
 * Going back will navigate the user to the {HomeScreen}.
 *
 * @category Screens
 * @component
 * @param props {object}
 * @param props.navigation {object} navigation API
 * @returns {JSX.Element}
 */
const MapScreen = props => {
  const { t } = useTranslation()
  const { Tts } = useTts()
  const [session, sessionActions] = useContext(AppSessionContext)
  const mapDocs = loadDocs(() => loadMapData(session.field))
  const mapData = mapDocs.data

  useEffect(() => {
    const mapScreenTitle = session.field?.title ?? t('mapScreen.title')
    props.navigation.setOptions({
      title: mapScreenTitle,
      headerTitle: () => (<Tts block={true} text={mapScreenTitle}/>)
    })
  }, [session.field])

  useEffect(() => {
    props.navigation.setOptions({
      headerLeft: () => (<BackButton icon="arrow-left" onPress={() => sessionActions.field(null)}/>)
    })
  }, [])

  /* expected mapData structure:
   *
   * {
   *   _id: String,
   *   field: String,
   *   dimensions: [String],
   *   levels: [String]
   *   entries: [{
   *     level: Number,               // index within levels array,
   *     type: 'stage'|'milestone',   // type of the entry
   *
   *     // only for stages
   *     progress: Number,            // overall progress for this stage
   *     unitSets: [{
   *       _id: String,               // unitSet docId
   *       competencies: Number,      // achievable competencies
   *       dimension: Number,         // index within dimensions array
   *     }],
   *
   *     // only for milestones
   *     competencies: [{
   *        dimension: Number,        // index within levels array,
   *        max: Number               // achievable competencies in this ms
   *     }]
   *   }]
   * }
   */

  const selectStage = async stage => {
    stage.level = mapData.levels[stage.level]
    stage.unitSets.forEach(unitSet => {
      unitSet.dimension = mapData.dimensions[unitSet.dimension]
    })

    await sessionActions.stage(stage)
    console.debug('move to dimension')
    props.navigation.navigate('dimension')
  }

  const renderListItem = ({ index, item: entry }) => {
    if (entry.type === 'stage') {
      return renderStage(entry, index)
    }

    if (entry.type === 'milestone') {
      return renderMilestone(entry, index)
    }

    // at this point we need to be fail-resistant
    log('unexpected entry type', entry.type)
    return null
  }

  const renderList = () => {
    if (!mapData?.entries?.length) {
      return null
    }

    return (
      <View style={styles.scrollView}>
        <FlatList
          data={mapData.entries}
          initialNumToRender={10}
          removeClippedSubviews={false}
          renderItem={renderListItem}
          keyExtractor={item => item.key}
        />
      </View>
    )
  }

  const renderStage = (stage, index) => {
    const stageIsComplete = stage.userProgress >= stage.progress
    const icon = stageIsComplete ? 'flag' : 'edit'
    const iconColor = stageIsComplete ? Colors.success : Colors.primary
    const progress = 100 * (stage.userProgress || 0) / stage.progress
    const title = `${t('mapScreen.stage')} ${index + 1}`

    return (
      <View style={styles.stage}>
        <RouteButton style={{ height: 100 }} title={title} icon={icon} iconColor={iconColor}
                     handleScreen={() => selectStage(stage)} noTts/>

        <StaticCircularProgress
          duration={0}
          value={progress}
          radius={60}
          maxValue={100}
          textColor={Colors.secondary}
          activeStrokeColor={Colors.secondary}
          inActiveStrokeColor="#fff"
          inActiveStrokeOpacity={0.5}
          inActiveStrokeWidth={5}
          activeStrokeWidth={5}
          showProgressValue
          valueSuffix="%"
        />
        {renderUnitSets(stage.unitSets)}
      </View>
    )
  }

  const renderMilestone = (milestone) => {
    const progress = 100 * milestone.userProgress / milestone.maxProgress
    return (
      <View>
        <View style={styles.stage}>
          <LeaText>Milestone {milestone.level + 1}</LeaText>
          <StaticCircularProgress
            value={progress}
            radius={23}
            valueSuffix="%"
            textColor={Colors.primary}
            activeStrokeColor={Colors.primary}
          />
        </View>
      </View>
    )
  }

  const renderUnitSets = (unitSets) => {
    if (!unitSets?.length) { return null }

    return unitSets.map(({ _id, dimension, userCompetencies, competencies }, index) => {
      const dimensionDoc = mapData.dimensions[dimension]
      if (!dimensionDoc) { return null }

      const color = ColorTypeMap.get(dimensionDoc.colorType) || Colors.info
      const progress = Math.round(((userCompetencies || 0) / competencies) * 100)
      // <LinearProgress key={_id} color={color} value={progress} variant="determinate" />
      return (
        <StaticCircularProgress
          key={`dimension-progress-${index}`}
          value={progress}
          radius={23}
          textColor={color}
          duration={0}
          activeStrokeColor={color}
          inActiveStrokeColor="#fff"
          inActiveStrokeOpacity={0.5}
          inActiveStrokeWidth={5}
          activeStrokeWidth={5}
          showProgressValue
          maxValue={100}
          valueSuffix="%"
        />
      )
    })
  }

  return (
    <ScreenBase {...mapDocs} style={styles.container}>
      {renderList()}
    </ScreenBase>
  )
}

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  container: Layout.container(),
  scrollView: {
    marginHorizontal: 20,
    width: '100%'
  },
  stage: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 2
  },
  title: {
    fontSize: 32
  }
})

export default MapScreen

import React from 'react'
import { SafeAreaView, View, Text, FlatList } from 'react-native'
import RouteButton from '../../components/RouteButton'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Loading } from '../../components/Loading'
import { loadDocs } from '../../meteor/loadDocs'
import { loadMapData } from './loadMapData'
import { Log } from '../../infrastructure/Log'
import { AppState } from '../../state/AppState'
import { ColorTypeMap } from '../../constants/ColorTypeMap'
import { Layout } from '../../constants/Layout'
import { Confirm } from '../../components/Confirm'
import Colors from '../../constants/Colors'
import { ProfileButton } from '../../components/ProfileButton'
import { Navbar } from '../../components/Navbar'
import { useTranslation } from 'react-i18next'
import { TTSengine } from '../../components/Tts'
import { ErrorMessage } from '../../components/ErrorMessage'
import { StaticCircularProgress } from '../../components/StaticCircularProgress'

const log = Log.create('MapScreen')

/**
 * @private TTS Ref
 */
const Tts = TTSengine.component()

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  container: Layout.containter(),
  body: {
    flex: 2,
    flexDirection: 'row'
  },
  stage: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 2
  },
  scrollView: {
    marginHorizontal: 20,
    width: '100%'
  },
  safeAreaView: {
    flex: 1,
    width: '100%',
    alignItems: 'center'
  },
  routeButtonContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center'
  },
  loading: {
    flex: 2,
    alignItems: 'center'
  },
  buttons: {
    alignItems: 'center',
    flex: 1
  },
  // examples
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16
  },
  title: {
    fontSize: 32
  }
})

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
  const mapDocs = loadDocs(loadMapData)

  const renderNavbar = () => {
    return (
      <Navbar>
        <Confirm
          id='map-screen-confirm'
          noConfirm
          onApprove={() => props.navigation.navigate('Home')}
          icon='home'
          tts={false}
          style={{
            borderRadius: 2,
            borderWidth: 1,
            borderColor: Colors.dark
          }}
        />
        <View style={{ width: '50%' }}>
          <Tts text='Map' color={Colors.secondary} id='mapScreen.headerTitle' paddingTop={10} smallButton />
        </View>
        <ProfileButton onPress={() => props.navigation.navigate('Profile')} />
      </Navbar>
    )
  }

  if (!mapDocs || mapDocs.loading) {
    return (
      <View style={styles.container}>
        {renderNavbar()}
        <Loading />
      </View>
    )
  }

  const nodata = mapDocs.data === null || mapDocs.data === undefined
  const loadFailed = !mapDocs.loading && nodata

  // if we have loaded but there was no MapData available,
  // we display an error message with a button to go back to the home screen
  if (mapDocs.error || loadFailed) {
    log('no data available, display fallback', { error: mapDocs.error, loadFailed })
    return (
      <View style={styles.container}>
        {renderNavbar()}
        <ErrorMessage
          error={mapDocs.error}
          message={t('mapScreen.notAvailable')}
          label={t('actions.back')}
          onConfirm={() => props.navigation.navigate('Home')}
        />
      </View>
    )
  }

  const mapData = mapDocs.data

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

    await AppState.stage(stage)
    props.navigation.navigate('Dimension')
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
        <RouteButton style={{ height: 100 }} title={title} icon={icon} iconColor={iconColor} handleScreen={() => selectStage(stage)} noTts />

        <StaticCircularProgress
          duration={0}
          value={progress}
          radius={60}
          maxValue={100}
          textColor={Colors.secondary}
          activeStrokeColor={Colors.secondary}
          inActiveStrokeColor='#fff'
          inActiveStrokeOpacity={0.5}
          inActiveStrokeWidth={5}
          activeStrokeWidth={5}
          showProgressValue
          valueSuffix='%'
        />
        {renderUnitSets(stage.unitSets)}
      </View>
    )
  }

  const renderMilestone = (milestone) => {
    const progress = 100 * milestone.userProgress / milestone.maxProgress
    return (
      <View>
        <View style={styles.body}>
          <Text>Milestone {milestone.level + 1}</Text>
          <StaticCircularProgress
            value={progress}
            radius={23}
            valueSuffix='%'
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
          inActiveStrokeColor='#fff'
          inActiveStrokeOpacity={0.5}
          inActiveStrokeWidth={5}
          activeStrokeWidth={5}
          showProgressValue
          maxValue={100}
          valueSuffix='%'
        />
      )
    })
  }

  return (
    <View style={styles.container}>
      {renderNavbar()}
      <SafeAreaView style={styles.safeAreaView}>{renderList()}</SafeAreaView>
    </View>
  )
}

export default MapScreen

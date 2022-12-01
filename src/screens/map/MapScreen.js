import React, { useContext, useEffect } from 'react'
import { View, FlatList } from 'react-native'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { loadDocs } from '../../meteor/loadDocs'
import { loadMapData } from './loadMapData'
import { Log } from '../../infrastructure/Log'
import { Layout } from '../../constants/Layout'
import { useTranslation } from 'react-i18next'
import { AppSessionContext } from '../../state/AppSessionContext'
import { ScreenBase } from '../BaseScreen'
import { useTts } from '../../components/Tts'
import { BackButton } from '../../components/BackButton'
import { Stage } from './components/Stage'
import { MapFinish } from './components/Finish'
import { Milestone } from './components/Milestone'

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
  const mapDocs = loadDocs(() => loadMapData({
    fieldDoc: session.field,
    loadUserData: session.loadUserData,
    onUserDataLoaded: () => sessionActions.loadUserData(null)
  }), {
    runArgs: [session.field, session.loadUserData]
  })
  const mapData = mapDocs.data

  useEffect(() => {
    const mapScreenTitle = session.field?.title ?? t('mapScreen.title')
    props.navigation.setOptions({
      title: mapScreenTitle,
      headerTitle: () => (<Tts align='center' text={mapScreenTitle} />)
    })
  }, [session.field])

  useEffect(() => {
    props.navigation.setOptions({
      headerLeft: () => (<BackButton icon='arrow-left' onPress={() => sessionActions.field(null)} />)
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
    const newStage = { ...stage }
    newStage.level = mapData.levels[newStage.level]
    newStage.unitSets = stage.unitSets.map(doc => ({ ...doc }))
    newStage.unitSets.forEach(unitSet => {
      unitSet.dimension = mapData.dimensions[unitSet.dimension]
    })

    await sessionActions.stage(newStage)
    props.navigation.navigate('dimension')
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
          removeClippedSubviews
          renderItem={renderListItem}
          keyExtractor={item => item.key}
        />
      </View>
    )
  }

  const renderListItem = ({ index, item: entry }) => {
    if (entry.type === 'stage') {
      return renderStage(entry, index)
    }

    if (entry.type === 'milestone') {
      return renderMilestone(entry, index)
    }

    if (entry.type === 'finish') {
      return (
        <MapFinish key='finish' />
      )
    }

    // at this point we need to be fail-resistant
    log('unexpected entry type', entry.type)
    return null
  }

  const renderStage = (stage, index) => {
    const progress = 100 * (stage.userProgress || 0) / stage.progress
    const key = `stage-${index}`
    return (
      <View style={styles.stage}>
        <Stage
          key={key}
          onPress={() => selectStage(stage)}
          unitSets={stage.unitSets}
          dimensions={mapData.dimensions}
          text={index + 1}
          progress={progress}
        />
      </View>
    )
  }

  const renderMilestone = (milestone, index) => {
    const progress = 100 * milestone.userProgress / milestone.maxProgress
    const key = `milestone-${index}`
    return (
      <Milestone key={key} progress={progress} />
    )
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
  container: {
    ...Layout.container()
  },
  scrollView: {
    width: '100%'
  },
  stage: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'flex-start',
    justifyContent: 'space-between',
    justifyItems: 'flex-start',
    height: 150
  },
  stageButton: {
    width: 150
  },
  title: {
    fontSize: 32
  }
})

export default MapScreen

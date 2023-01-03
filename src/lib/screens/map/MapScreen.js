import React, { useContext, useEffect, useState } from 'react'
import { View, FlatList, InteractionManager } from 'react-native'
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
import { MapStart } from './components/Start'
import { MapFinish } from './components/Finish'
import { Milestone } from './components/Milestone'
import { LeaText } from '../../components/LeaText'
import { mergeStyles } from '../../styles/mergeStyles'
import { Connector } from './components/Connector'
import { loadMapIcons } from './loadMapIcons'
import nextFrame from 'next-frame'

const log = Log.create('MapScreen')
const ITEM_HEIGHT = 100

loadMapIcons() // TODO defer loading these to a much later point as they are not crucial
const MemoConnector = React.memo(Connector)

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
  const [listWidth, setListWidth] = useState(null)
  const [session, sessionActions] = useContext(AppSessionContext)
  const mapDocs = loadDocs({
    runArgs: [session.field, session.loadUserData],
    allArgsRequired: true,
    fn: () => loadMapData({
      fieldDoc: session.field,
      loadUserData: session.loadUserData,
      onUserDataLoaded: () => sessionActions.loadUserData(null)
    })
  })

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

  const onListLayoutDetected = (event) => {
    const { width } = event.nativeEvent.layout
    setListWidth(width)
  }

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
  const mapData = mapDocs.data

  const selectStage = async stage => {
    await nextFrame()
    InteractionManager.runAfterInteractions(async () => {
      const newStage = { ...stage }
      newStage.level = mapData.levels[newStage.level]
      newStage.unitSets = stage.unitSets.map(doc => ({ ...doc }))
      newStage.unitSets.forEach(unitSet => {
        unitSet.dimension = mapData.dimensions[unitSet.dimension]
      })
      props.navigation.navigate('dimension')
      await nextFrame()
      await sessionActions.stage(newStage)
    })
  }

  const onEndReached = () => {

  }

  const renderList = () => {
    if (!mapData?.entries?.length) {
      return null
    }
    return (
      <View style={styles.scrollView}>
        <FlatList
          onLayout={onListLayoutDetected}
          inverted
          data={mapData.entries}
          onEndReached={onEndReached}
          initialNumToRender={10}
          maxToRenderPerBatch={3}
          getItemLayout={(data, index) => {
            const entry = data[index]
            const length = ['stage', 'milestone'].includes(entry)
              ? ITEM_HEIGHT
              : 59
            return { length, offset: length * index, index }
          }}
          initialScrollIndex={mapData.progressIndex ?? 0}
          removeClippedSubviews={true}
          persistentScrollbar={true}
          updateCellsBatchingPeriod={500}
          renderItem={renderListItem}
          keyExtractor={(item) => item.entryKey}
          viewabilityConfig={{
            minimumViewTime: 250,
            viewAreaCoveragePercentThreshold: 100,
            waitForInteraction: true
          }}
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

    const connectorWidth = listWidth
      ? (listWidth / 2) - ITEM_HEIGHT
      : listWidth

    if (entry.type === 'finish') {
      return (
        <View style={styles.stage}>
          {renderConnector(entry.viewPosition.left, connectorWidth)}
          <MapFinish />
          {renderConnector(entry.viewPosition.right, connectorWidth)}
        </View>
      )
    }

    if (entry.type === 'start') {
      return (
        <View style={styles.stage}>
          {renderConnector(entry.viewPosition.left, connectorWidth)}
          <MapStart size={ITEM_HEIGHT / 2} />
          {renderConnector(entry.viewPosition.right, connectorWidth)}
        </View>
      )
    }

    // at this point we need to be fail-resistant
    log('unexpected entry type', entry.type)
    return null
  }

  const renderStage = (stage, index) => {
    const progress = 100 * (stage.userProgress || 0) / stage.progress
    const justifyContent = positionMap[stage.viewPosition.current]
    const stageStyle = mergeStyles(styles.stage, { justifyContent })
    const connectorWidth = listWidth
      ? listWidth - ITEM_HEIGHT - (ITEM_HEIGHT / 2)
      : listWidth

    const { viewPosition } = stage

    return (
      <View style={stageStyle}>
        {renderConnector(viewPosition.left, connectorWidth, viewPosition.icon)}
        <Stage
          width={ITEM_HEIGHT}
          height={ITEM_HEIGHT}
          onPress={() => selectStage(stage)}
          unitSets={stage.unitSets}
          dimensions={mapData.dimensions}
          text={stage.label}
          progress={progress}
        />
        {renderConnector(viewPosition.right, connectorWidth, viewPosition.icon)}
      </View>
    )
  }

  const renderMilestone = (milestone) => {
    const progress = 100 * milestone.userProgress / milestone.maxProgress
    const connectorWidth = listWidth
      ? (listWidth / 2) - ITEM_HEIGHT
      : listWidth
    return (
      <View style={styles.stage}>
        {renderConnector(milestone.viewPosition.left, connectorWidth)}
        <Milestone progress={progress} level={milestone.level + 1} />
        {renderConnector(milestone.viewPosition.right, connectorWidth)}
      </View>
    )
  }

  return (
    <ScreenBase {...mapDocs} loadMessage={t('mapScreen.loadData')} style={styles.container}>
      {renderList()}
    </ScreenBase>
  )
}

const renderConnector = (connectorId, listWidth, withIcon = -1) => {
  if (connectorId === 'fill') {
    return (
      <LeaText style={{ width: listWidth ?? '100%' }} />
    )
  }

  if (connectorId) {
    const [from, to] = connectorId.split('2')
    return (<MemoConnector from={from} to={to} width={listWidth} icon={withIcon} />)
  }
  return null
}
const positionMap = {
  center: 'center',
  left: 'flex-start',
  right: 'flex-end'
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
    justifyContent: 'center',
    borderColor: '#f0f',
    height: ITEM_HEIGHT
  },
  connector: {
    flexGrow: 1
  },
  stageButton: {
    width: 150
  },
  title: {
    fontSize: 32
  }
})

export default MapScreen

import React, { useCallback, useContext, useEffect, useState } from 'react'
import { View, FlatList } from 'react-native'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { useDocs } from '../../meteor/useDocs'
import { loadMapData } from './loadMapData'
import { Log } from '../../infrastructure/Log'
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
export const MapScreen = props => {
  const { t } = useTranslation()
  const { Tts } = useTts()
  const [stageConnectorWidth, setStageConnectorWidth] = useState(null)
  const [activeStage, setActiveStage] = useState(-1)
  const [connectorWidth, setConnectorWidth] = useState(null)
  const [session, sessionActions] = useContext(AppSessionContext)
  const mapDocs = useDocs({
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
    setStageConnectorWidth(width - ITEM_HEIGHT - (ITEM_HEIGHT / 2))
    setConnectorWidth((width / 2) - ITEM_HEIGHT)
  }

  const selectStage = useCallback(async (stage, index) => {
    setActiveStage(index)
    await nextFrame()
    const newStage = { ...stage }
    newStage.level = mapData.levels[newStage.level]
    newStage.unitSets = stage.unitSets.map(doc => ({ ...doc }))
    newStage.unitSets.forEach(unitSet => {
      unitSet.dimension = mapData.dimensions[unitSet.dimension]
    })
    await sessionActions.stage(newStage)
    props.navigation.navigate('dimension')
  }, [mapDocs])

  const renderListItem = useCallback(({ index, item: entry }) => {
    if (entry.type === 'stage') {
      const isActive = activeStage === index
      return renderStage({
        index,
        stage: entry,
        connectorWidth: stageConnectorWidth,
        selectStage,
        isActive,
        dimensions: mapData?.dimensions
      })
    }

    if (entry.type === 'milestone') {
      return renderMilestone({ milestone: entry, connectorWidth })
    }

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
  }, [connectorWidth, mapDocs])

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

  const renderList = () => {
    if (!mapData?.entries?.length) {
      return null
    }

    // return mapData.entries.map((item, index) => renderListItem({ index, item }))

    return (
      <View style={styles.scrollView}>
        <FlatList
          data={mapData.entries}
          renderItem={renderListItem}
          onLayout={onListLayoutDetected}
          inverted
          decelerationRate='fast'
          disableIntervalMomentum
          initialScrollIndex={mapData.progressIndex ?? 0}
          removeClippedSubviews={false}
          persistentScrollbar
          keyExtractor={flatListKeyExtractor}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={100}
          getItemLayout={flatListGetItemLayout}
        />
      </View>
    )
  }

  return (
    <ScreenBase {...mapDocs} loadMessage={t('mapScreen.loadData')} style={styles.container}>
      {renderList()}
    </ScreenBase>
  )
}

const flatListGetItemLayout = (data, index) => {
  const entry = data[index]
  const length = entry && ['stage', 'milestone'].includes(entry.type)
    ? ITEM_HEIGHT + 10
    : 59
  return { length, offset: length * index, index }
}
const flatListKeyExtractor = (item) => item.entryKey

const renderStage = ({ index, stage, selectStage, connectorWidth, dimensions, isActive }) => {
  const progress = 100 * (stage.userProgress || 0) / stage.progress
  const justifyContent = positionMap[stage.viewPosition.current]
  const stageStyle = mergeStyles(styles.stage, { justifyContent })
  const { viewPosition } = stage
  return (
    <View style={stageStyle}>
      {renderConnector(viewPosition.left, connectorWidth, viewPosition.icon)}
      <Stage
        width={ITEM_HEIGHT}
        height={ITEM_HEIGHT}
        onPress={() => selectStage(stage, index)}
        unitSets={stage.unitSets}
        dimensions={dimensions}
        text={stage.label}
        progress={progress}
        isActive={isActive}
      />
      {renderConnector(viewPosition.right, connectorWidth, viewPosition.icon)}
    </View>
  )
}

const renderMilestone = ({ milestone, connectorWidth }) => {
  const progress = 100 * milestone.userProgress / milestone.maxProgress
  return (
    <View style={styles.stage}>
      {renderConnector(milestone.viewPosition.left, connectorWidth)}
      <Milestone progress={progress} level={milestone.level + 1} />
      {renderConnector(milestone.viewPosition.right, connectorWidth)}
    </View>
  )
}

const renderConnector = (connectorId, listWidth, withIcon = -1) => {
  if (connectorId === 'fill') {
    return (
      <LeaText style={{ width: listWidth ?? '100%' }} />
    )
  }

  if (listWidth !== null && connectorId) {
    const [from, to] = connectorId.split('2')
    return (<Connector from={from} to={to} width={listWidth} icon={withIcon} />)
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
    // ...Layout.container()
  },
  scrollView: {
    width: '100%'
  },
  stage: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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

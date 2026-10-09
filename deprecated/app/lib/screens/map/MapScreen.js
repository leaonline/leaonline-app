import React, { useCallback, useContext, useEffect, useState } from 'react'
import { View, FlatList } from 'react-native'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { useDocs } from '../../meteor/useDocs'
import { loadMapData } from './loadMapData'
import { useRefresh } from '../../hooks/useRefresh'
import { Log } from '../../infrastructure/Log'
import { useTranslation } from 'react-i18next'
import { AppSessionContext } from '../../state/AppSessionContext'
import { ScreenBase } from '../BaseScreen'
import { useTts } from '../../components/Tts'
import { BackButton } from '../../components/BackButton'
import { Stage } from './components/Stage'
import { MapFinish } from './components/Finish'
import { Milestone } from './components/Milestone'
import { LeaText } from '../../components/LeaText'
import { mergeStyles } from '../../styles/mergeStyles'
import { Connector } from './components/Connector'
import nextFrame from 'next-frame'
import { MapIcons } from '../../contexts/MapIcons'
import { Layout } from '../../constants/Layout'

const log = Log.create('MapScreen')
const STAGE_SIZE = 100
const counter = 0.75

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
  const [initialIndex, setInitialIndex] = useState(0)
  const [listData, setListData] = useState([])
  const [reload, refresh] = useRefresh()
  const [connectorWidth, setConnectorWidth] = useState(null)
  const [session, sessionActions] = useContext(AppSessionContext)
  const mapDocs = useDocs({
    runArgs: [session.field, session.loadUserData],
    allArgsRequired: true,
    fn: () => loadMapData({
      fieldDoc: session.field,
      loadUserData: session.loadUserData,
      onUserDataLoaded: () => {
        sessionActions.update({ loadUserData: null })
      }
    }),
    dataRequired: true,
    reload,
    message: 'mapScreen.loadData'
  })

  useEffect(() => {
    const mapScreenTitle = session.field?.title ?? t('mapScreen.title')
    props.navigation.setOptions({
      title: mapScreenTitle,
      headerTitle: () => (<Tts align='center' text={mapScreenTitle} />)
    })
  }, [session.field, props.navigation])

  useEffect(() => {
    props.navigation.setOptions({
      headerLeft: () => (<BackButton icon='arrow-left' onPress={() => sessionActions.update({ field: null })} />)
    })
  }, [props.navigation, sessionActions])

  useEffect(() => {
    const progressIndex = mapDocs?.data?.progressIndex
    const entries = mapDocs?.data?.entries

    if (progressIndex && progressIndex !== initialIndex) {
      setInitialIndex(progressIndex)
    }

    if (entries && listData.length === 0) {
      setListData(entries)
    }
  }, [mapDocs])

  const onListLayoutDetected = useCallback((event) => {
    const { width } = event.nativeEvent.layout
    if (!stageConnectorWidth) {
      setStageConnectorWidth(width - STAGE_SIZE - (STAGE_SIZE / 2))
      setConnectorWidth((width / 2) - STAGE_SIZE)
    }
  }, [])

  const selectStage = useCallback(async (stage, index) => {
    setActiveStage(index)
    await nextFrame()

    const unitSets = stage.unitSets.map(doc => ({ ...doc }))
    unitSets.forEach(unitSet => {
      unitSet.dimension = mapData.dimensions[unitSet.dimension]._id
    })

    await sessionActions.update({ stage: unitSets })
    props.navigation.navigate('dimension')
  }, [mapDocs])

  const renderListItem2 = useCallback(({ index, item: entry }) => {
    if (entry.type === 'stage') {
      const isActive = activeStage === index
      const stageData = {
        index,
        stage: entry,
        connectorWidth: stageConnectorWidth,
        selectStage,
        isActive,
        dimensionOrder: mapData?.dimensionOrder,
        dimensions: mapData?.dimensions
      }
      return (<MapStage {...stageData} />)
    }

    if (entry.type === 'milestone') {
      return (<MapMilestone milestone={entry} connectorWidth={connectorWidth} />)
    }

    if (entry.type === 'finish') {
      return (
        <View style={styles.stage}>
          <MapConnector connectorId={entry.viewPosition.left} listWidth={connectorWidth} />
          <MapFinish />
          <MapConnector connectorId={entry.viewPosition.right} listWidth={connectorWidth} />
        </View>
      )
    }

    if (entry.type === 'start') {
      return (
        <View style={styles.stage}>
          <MapConnector connectorId={entry.viewPosition.left} listWidth={connectorWidth} />
          {MapIcons.render(0)}
          <MapConnector connectorId={entry.viewPosition.right} listWidth={connectorWidth} />
        </View>
      )
    }

    // at this point we need to be fail-resistant
    log('unexpected entry type', entry.type)
    return null
  }, [connectorWidth, mapDocs, session])

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
    if (!listData || !stageConnectorWidth) {
      return null
    }
    return (
      <FlatList
        data={listData}
        renderItem={renderListItem2}
        inverted
        decelerationRate='fast'
        disableIntervalMomentum
        initialScrollIndex={initialIndex}
        removeClippedSubviews
        persistentScrollbar
        keyExtractor={flatListKeyExtractor}
        initialNumToRender={10}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={50}
        getItemLayout={flatListGetItemLayout}
      />
    )
  }
  return (
    <ScreenBase
      {...mapDocs}
      progress={counter}
      onRefresh={refresh}
      style={mapDocs.error ? styles.failedContainer : styles.container}
    >
      <View style={styles.scrollView} onLayout={onListLayoutDetected}>
        {renderList()}
      </View>
    </ScreenBase>
  )
}

const flatListGetItemLayout = (data, index) => {
  // const entry = data[index]
  // const length = entry && ['stage', 'milestone'].includes(entry.type)
  //   ? ITEM_HEIGHT + 10
  //   : 59
  return { length: STAGE_SIZE, offset: STAGE_SIZE * index, index }
}
const flatListKeyExtractor = (item) => item.entryKey

const MapStage = React.memo(({ index, stage, selectStage, connectorWidth, dimensions, dimensionOrder, isActive }) => {
  const progress = 100 * (stage.userProgress || 0) / stage.progress
  const justifyContent = positionMap[stage.viewPosition.current]
  const stageStyle = mergeStyles(styles.stage, { justifyContent })
  const { viewPosition } = stage

  return (
    <View style={stageStyle}>
      <MapConnector connectorId={viewPosition.left} listWidth={connectorWidth} withIcon={viewPosition.icon} />
      <Stage
        width={STAGE_SIZE}
        height={STAGE_SIZE}
        onPress={() => selectStage(stage, index)}
        unitSets={stage.unitSets}
        dimensions={dimensions}
        dimensionOrder={dimensionOrder}
        text={stage.label}
        progress={progress}
        isActive={isActive}
      />
      <MapConnector connectorId={viewPosition.right} listWidth={connectorWidth} withIcon={viewPosition.icon} />
    </View>
  )
})

const MapMilestone = React.memo(({ milestone, connectorWidth }) => {
  const progress = 100 * milestone.userProgress / milestone.maxProgress
  return (
    <View style={styles.stage}>
      <MapConnector connectorId={milestone.viewPosition.left} listWidth={connectorWidth} />
      <Milestone progress={progress} level={milestone.level + 1} />
      <MapConnector connectorId={milestone.viewPosition.right} listWidth={connectorWidth} />
    </View>
  )
})

const MapConnector = React.memo(({ connectorId, listWidth, withIcon = -1 }) => {
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
})

const positionMap = {
  center: 'center',
  left: 'flex-start',
  right: 'flex-end'
}

/**
 * @private
 */
const styles = createStyleSheet({
  container: {
    // ...Layout.container()
    marginLeft: 15,
    marginRight: 15
  },
  failedContainer: {
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
    height: STAGE_SIZE,
    borderColor: 'blue'
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

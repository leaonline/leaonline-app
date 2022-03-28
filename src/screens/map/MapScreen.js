import React from 'react'
import { SafeAreaView, ScrollView, View, Text } from 'react-native'
import RouteButton from '../../components/RouteButton'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Loading } from '../../components/Loading'
import { loadDocs } from '../../meteor/loadDocs'
import { loadMapData } from './loadMapData'
import { Log } from '../../infrastructure/Log'
import { AppState } from '../../state/AppState'
import Colors from '../../constants/Colors'
import { ColorTypeMap } from '../../constants/ColorTypeMap'
import { Layout } from '../../constants/Layout'

const log = Log.create('MapScreen')

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  container: Layout.containter(),
  body: {
    flex: 2,
    flexDirection: 'row'
  },
  scrollView: {
    marginHorizontal: 20,
    width: '100%'
  },
  safeAreaView: {
    flex: 1,
    paddingTop: 50,
    width: '100%',
    alignItems: 'center',
  },
  navigationButtons: {
    flexDirection: 'row'
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
  const docs = loadDocs(loadMapData)

  if (!docs || docs.loading) {
    return (
      <Loading/>
    )
  }

  // if we have loaded but there was no field to be retrieved we
  // go back to the home screen and let users select the field
  if (!docs.loading && docs.data === null) {
    log('no data available, return to HomeScreen')
    props.navigation.navigate('Home')
    return null
  }

  const selectStage = async stage => {
    stage.level = mapData.levels[stage.level]
    stage.unitSets.forEach(unitSet => {
      unitSet.dimension = mapData.dimensions[unitSet.dimension]
    })

    await AppState.stage(stage)
    props.navigation.navigate('Dimension')
  }

  const mapData = docs.data

  /* MAP DATA STRUCTURE:
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

  const renderStages = () => {
    if (!mapData) return (<Loading/>)
    return mapData.entries.map((entry, index) => {
      if (entry.type === 'stage') {
        return renderStage(entry, index)
      }

      if (entry.type === 'milestone') {
        return renderMilestone(entry, index)
      }

      // at this point we need to be fail-resistant
      log('unexpected entry type', entry.type)
      return null
    })
  }

  const renderStage = (stage, index) => {
    return (
      <View key={`entry-${index}`} style={styles.buttons}>
        <View style={styles.body}>
          <Text>Complete: 0 / {stage.progress}</Text>
        </View>
        <View style={styles.body}>{renderUnitSets(stage.unitSets)}</View>
        <RouteButton title={index + 1} icon={'edit'} handleScreen={() => selectStage(stage)} />
      </View>
    )
  }

  const renderMilestone = (milestone, index) => {
    return (
      <RouteButton title={'Milestones'} icon={'edit'} key={`entry-${index}`} handleScreen={() => {}} />
    )
  }

  const renderUnitSets = (unitSets) => {
    if (!unitSets?.length) { return null }

    return unitSets.map(({ _id, dimension, competencies }) => {
      const dimensionDoc = mapData.dimensions[dimension]
      if (!dimensionDoc) { return null }

      const color = ColorTypeMap.get(dimensionDoc.colorType)
      const userCompetencies = 0
      return (<Text key={_id} style={{ color }}>{dimensionDoc.shortCode} ({userCompetencies}/{competencies})</Text>)
    })
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaView}>
        <ScrollView style={styles.scrollView}>
        <View style={styles.buttons}>
          {renderStages()}
        </View>
        </ScrollView>
      </SafeAreaView>
      <View style={styles.navigationButtons}>
        <View style={styles.routeButtonContainer}>
          <RouteButton
            onlyIcon
            icon='arrow-alt-circle-left' handleScreen={() => {
              props.navigation.navigate('Home')
            }}
          />
        </View>

        <View style={styles.routeButtonContainer}>
          <RouteButton
            onlyIcon
            icon='arrow-alt-circle-right' handleScreen={() => {
              props.navigation.navigate('Dimension')
            }}
          />
        </View>
      </View>
    </View>
  )
}

export default MapScreen

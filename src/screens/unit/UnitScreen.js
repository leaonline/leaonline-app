import React from 'react'
import { Text, View } from 'react-native'
import RouteButton from '../../components/RouteButton'
import Colors from '../../constants/Colors'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { loadDocs } from '../../meteor/loadDocs'
import { loadUnitData } from './loadUnitData'
import { Loading } from '../../components/Loading'
import { UnitContentElementFactory } from '../../components/factories/UnitContentElementFactory'
import './registerComponents'

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 30
  },
  body: {
    flex: 2,
    flexDirection: 'row'
  },
  iconNavigation: {
    paddingBottom: 5,
    padding: 50
  },
  navigationButtons: {
    flexDirection: 'row'
  },
  routeButtonContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center'
  }
})

/**
 * On this screen, the respective Unit is displayed and the users can interact
 * with it, by solving the tasks on its pages.
 *
 * If a unit is completed and there is no next unit in the queue, it navigates
 * the users to the {CompleteScreen}.
 *
 * If a next unit exists, it will load this next unit.
 *
 * On cancel, it navigates users back to the {MapScreen}.
 *
 * @category Screens
 * @component
 * @param props {object}
 * @param props.navigation {object} navigation API
 * @returns {JSX.Element}
 */
const UnitScreen = props => {
  const docs = loadDocs(loadUnitData)

  if (!docs || docs.loading) {
    return (
      <Loading/>
    )
  }

  if (docs.data === null) {
    props.navigation.navigate('Map')
    return null
  }

  const { unitSetDoc, unitDoc, sessionDoc } = docs.data
  console.debug(sessionDoc.progress, unitSetDoc.story.length)

  // ---------------------------------------------------------------------------
  // STORY DISPLAY
  // ---------------------------------------------------------------------------

  // if this is the very beginning of this unit set AND
  // we have a story to render, let's do it right now
  if (sessionDoc.progress === 0 && unitSetDoc.story.length > 0) {
    return (
      <View style={styles.container}>
        <View style={styles.body}>
          {unitSetDoc.story.map((element, index) => (<UnitContentElementFactory.Renderer {...element} key={index} />))}
        </View>
      </View>
    )
  }


  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Text>UnitScreen</Text>
      </View>

      <View style={styles.body}>
        <Text>Aufgabe</Text>
      </View>

      <View style={styles.navigationButtons}>
        <View style={styles.routeButtonContainer}>
          <RouteButton
            onlyIcon
            icon='arrow-alt-circle-left' handleScreen={() => {
              props.navigation.navigate('Dimension')
            }}
          />
        </View>

        <View style={styles.routeButtonContainer}>
          <RouteButton
            onlyIcon
            icon='arrow-alt-circle-right' handleScreen={() => {
              props.navigation.navigate('Unit')
            }}
          />
        </View>

        <View style={styles.routeButtonContainer}>
          <RouteButton
            onlyIcon
            iconColor={Colors.success}
            icon='check-circle' handleScreen={() => {
              props.navigation.navigate('Complete')
            }}
          />
        </View>
      </View>
    </View>
  )
}

export default UnitScreen

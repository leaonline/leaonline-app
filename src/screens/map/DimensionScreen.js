import React from 'react'
import { View } from 'react-native'
import RouteButton from '../../components/RouteButton'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { loadDocs } from '../../meteor/loadDocs'
import { Loading } from '../../components/Loading'
import { loadDimensionData } from './loadDimensionData'
import { ColorTypeMap } from '../../constants/ColorTypeMap'
import { Log } from '../../infrastructure/Log'
import { AppState } from '../../state/AppState'
import { Layout } from '../../constants/Layout'
import { Confirm } from '../../components/Confirm'
import Colors from '../../constants/Colors'
import { ProfileButton } from '../../components/ProfileButton'
import { Navbar } from '../../components/Navbar'
import { Config } from '../../env/Config'

const log = Log.create('DimensionScreen')

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  container: Layout.containter(),
  body: {
    flex: 2,
    flexDirection: 'row'
  },
  iconNavigation: {
    paddingBottom: 5,
    padding: 100
  },
  routeButtonContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center'
  }
})

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
const DimensionScreen = props => {
  const docs = loadDocs(loadDimensionData)

  if (!docs || docs.loading) {
    return (
      <Loading />
    )
  }

  if (docs.data === null) {
    props.navigation.navigate('Map')
    return null
  }

  const selectUnitSet = async unitSet => {
    const normalized = { ...unitSet, ...{ dimension: unitSet.dimension._id } }
    log('selected', normalized)
    await AppState.unitSet(normalized)
    props.navigation.navigate('Unit')
  }

  const renderDimensions = () => {
    return docs.data.unitSets.map((unitSet, index) => {
      const color = ColorTypeMap.get(unitSet.dimension.colorType)
      const title = Config.debug.map
        ? unitSet._id + ' ' + unitSet.dimension.title
        : unitSet.dimension.title
      return (
        <RouteButton
          key={index}
          color={color}
          title={title}
          icon={unitSet.dimension.icon}
          handleScreen={() => selectUnitSet(unitSet)}
        />
      )
    })
  }

  return (
    <View style={styles.container}>
      <Navbar>
        <Confirm
          id='unit-screen-confirm'
          noConfirm
          onApprove={() => props.navigation.navigate('Map')}
          icon='arrow-left'
          tts={false}
          style={{
            borderRadius: 2,
            borderWidth: 1,
            borderColor: Colors.dark
          }}
        />
        <ProfileButton onPress={() => props.navigation.navigate('Profile')} />
      </Navbar>
      {renderDimensions()}
    </View>
  )
}

export default DimensionScreen

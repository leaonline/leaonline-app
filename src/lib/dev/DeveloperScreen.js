import React, { useContext, useEffect, useState } from 'react'
import { Button, ScrollView, Text, View } from 'react-native'
import { ListItem } from 'react-native-elements'
import { useDocs } from '../meteor/useDocs'
import { loadDevData } from './loadDevData'
import { ScreenBase } from '../screens/BaseScreen'
import { createStyleSheet } from '../styles/createStyleSheet'
import { Layout } from '../constants/Layout'
import { Colors } from '../constants/Colors'
import { AppSessionContext } from '../state/AppSessionContext'
import { RouteButton } from '../components/RouteButton'
import { resetSyncData } from './resetSyncData'
import { Config } from '../env/Config'

/**
 *
 * @param props
 * @return {JSX.Element}
 * @component
 */
export const DeveloperScreen = props => {
  const [filteredUnits, setFilteredUnits] = useState(null)
  const [shouldThrow, setShouldThrow] = useState(false)
  const [fieldName, setFieldName] = useState(null)
  const [dimensionNum, setDimensionNum] = useState(null)
  const [unitSetCode, setUnitSetCode] = useState(null)
  const [unitSets, setUnitSets] = useState(null)
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [/* session */, sessionActions] = useContext(AppSessionContext)
  const devDocs = useDocs({
    fn: loadDevData
  })

  if (shouldThrow) {
    throw new Error('This is an expected error from the mobile')
  }

  const { fields, dimensions, unitSetCodes, units } = (devDocs?.data ?? {})

  useEffect(() => {
    if (fieldName === null || dimensionNum === null) {
      return
    }

    const selectedUnitSets = unitSetCodes.get(fieldName)
    setUnitSets(
      [...selectedUnitSets.values()].sort().filter(id => {
        return id.charAt(0) === dimensionNum
      })
    )
  }, [fieldName, dimensionNum])

  const selectField = (name) => setFieldName(name)
  const selectDimension = dimensionDoc => setDimensionNum(dimensionDoc.shortNum.toString())
  const selectUnitSet = shortCode => {
    setUnitSetCode(shortCode)
    setFilteredUnits(
      units.filter(unitDoc => {
        const key = `${fieldName}_${shortCode}`
        return unitDoc.shortCode.includes(key)
      })
    )
  }
  const selectUnit = async unitDoc => {
    setSelectedUnit(unitDoc.shortCode)
    const { dimension } = unitDoc
    const unitId = unitDoc._id
    await sessionActions.multi({ unitId, dimension })
    props.navigation.navigate('unitDev')
  }
  const renderFieldList = () => {
    if (!fields) { return null }
    return (
      <View style={styles.fieldList}>
        {
          fields.map((name, index) => (
            <ListItem
              key={index}
              bottomDivider
              containerStyle={[styles.list, name === fieldName ? styles.active : undefined]}
              onPress={() => selectField(name)}
            >
              <ListItem.Content style={styles.listItem}>
                <ListItem.Title style={styles.title}>{name}</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          ))
        }
      </View>
    )
  }

  const renderDimensionList = () => {
    if (!dimensions || !fieldName) { return null }
    return (
      <View style={styles.dimensionsList}>
        {
          dimensions.map((dimensionDoc, index) => (
            <ListItem
              key={index}
              bottomDivider
              containerStyle={[styles.list, String(dimensionDoc.shortNum) === String(dimensionNum) ? styles.active : undefined]}
              onPress={() => selectDimension(dimensionDoc)}
            >
              <ListItem.Content style={styles.listItem}>
                <ListItem.Title style={styles.title}>{dimensionDoc.shortCode}</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          ))
        }
      </View>
    )
  }

  const renderUnitSetList = () => {
    if (!unitSets) { return null }

    return (
      <ScrollView style={styles.unitSetList}>
        {
          unitSets.map((shortCode, index) => (
            <ListItem
              key={index}
              bottomDivider
              containerStyle={[styles.list, shortCode === unitSetCode ? styles.active : undefined]}
              onPress={() => selectUnitSet(shortCode)}
            >
              <ListItem.Content style={styles.listItem}>
                <ListItem.Title style={styles.title}>{shortCode}</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          ))
        }
      </ScrollView>
    )
  }

  const renderUnitList = () => {
    if (!filteredUnits) { return null }
    return (
      <View style={styles.unitList}>
        {
          filteredUnits.map((unitDoc, index) => (
            <ListItem
              key={index}
              bottomDivider
              containerStyle={[styles.list, selectedUnit === unitDoc.shortCode ? styles.active : undefined]}
              onPress={() => selectUnit(unitDoc)}
            >
              <ListItem.Content style={styles.listItem}>
                <ListItem.Title
                  style={styles.title}
                >{unitDoc.shortCode.replace(`${fieldName}_${unitSetCode}_`, '')}
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>
          ))
        }
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScreenBase {...devDocs} style={styles.listContainer}>
        {renderFieldList()}
        {renderDimensionList()}
        {renderUnitSetList()}
        {renderUnitList()}
      </ScreenBase>
      <View style={styles.row}>
        <RouteButton style={styles.button} block route='mapDev' text='Map Screen' icon='map-marker' />
      </View>
      <View style={styles.row}>
        <Text>Server URL: {Config.backend.url}</Text>
      </View>
      <View style={styles.row}>
        <Text>Content URL: {Config.content.url}</Text>
      </View>
      <View style={styles.row}>
        <Button title='Throw error' onPress={() => setShouldThrow(true)} />
      </View>
      <View style={styles.row}>
        <Button
          style={styles.button}
          onPress={resetSyncData}
          title='Reset Sync Data'
          icon='trash'
        />
      </View>
    </View>
  )
}

const styles = createStyleSheet({
  container: {
    ...Layout.container({ margin: 5 })
  },
  button: {
    borderColor: '#00f'
  },
  listContainer: {
    flex: 1,
    ...Layout.container({ margin: 10 }),
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  row: {
    flex: 1,
    flexDirection: 'row'
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50
  },
  list: {
    padding: 0,
    margin: 0
  },
  fieldList: {
    flexGrow: 1,
    maxWidth: '25%'
  },
  dimensionsList: {
    flexGrow: 1,
    maxWidth: '25%'
  },
  unitSetList: {
    flexGrow: 1,
    maxWidth: '25%'
  },
  unitList: {
    flexGrow: 1,
    maxWidth: '25%'
  },
  title: {
    fontSize: 20 / Layout.fontScale()
  },
  listItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0
  },
  active: {
    backgroundColor: Colors.gray
  }
})

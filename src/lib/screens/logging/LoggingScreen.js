import React from 'react'
import { ScreenBase } from '../BaseScreen'
import { ScrollView, Text, View } from 'react-native'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Layout } from '../../constants/Layout'
import { useDocs } from '../../meteor/useDocs'
import { getLogData } from './getLogData'
import { Colors } from '../../constants/Colors'

export const LoggingScreen = () => {
  const docs = useDocs({ fn: getLogData })
  const renderLogData = () => {
    if (!docs || !docs.data) return null

    return docs.data.map((line, index) => {
      const [color, type, timestamp, args] = line
      const bgColor = { backgroundColor: color, color: Colors.white }
      return (
        <Text style={[styles.line, { color }]} key={index}>
          <Text style={[styles.text]}>{timestamp.toString()}</Text>
          <Text style={[styles.text, bgColor]}>{type}</Text>
          <Text style={styles.text}>{args}</Text>
        </Text>
      )
    })
  }

  return (
    <View style={styles.container}>
      <ScreenBase {...docs} style={styles.container}>
        <ScrollView contentContainerStyle={styles.listContainer}>
          {renderLogData()}
        </ScrollView>
      </ScreenBase>
    </View>
  )
}

const styles = createStyleSheet({
  container: {
    ...Layout.container({ margin: 5 })
  },
  listContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  timeStamp: {
    color: Colors.gray
  },
  line: {
    flex: 0,
    fontFamily: 'monospace',
    marginBottom: 2,
    marginTop: 2
  },
  text: {
    paddingLeft: 1,
    paddingRight: 1,
    marginLeft: 1,
    marginRight: 1
  }
})

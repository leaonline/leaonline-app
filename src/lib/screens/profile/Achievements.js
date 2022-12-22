import React, { useState } from 'react'
import { View } from 'react-native'
import { LinearProgress, ListItem, Icon } from 'react-native-elements'
import Colors from '../../constants/Colors'
import { useTranslation } from 'react-i18next'
import profileData from '../../resources/profileData'
import { TTSengine } from '../../components/Tts'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { mergeStyles } from '../../styles/mergeStyles'

const Tts = TTSengine.component()

/**
 * Transforms colors list to use color values from Colors
 * @param list {Array}
 * @return {Array}
 * @example:
 * [{ color: 'primary' }] => [{ type: 'primary', color: '#f59d1d' }]
 */
const changeColor = list => list.map(element => ({
  ...element,
  type: element.color, // primary, secondary
  color: Colors[element.color]
}))

/**
 *
 * @return {*}
 * @constructor
 */
export const Achievements = (props) => {
  const { t } = useTranslation()
  const allDimensions = changeColor(profileData.progress.dimensions)
  const expandedStates = allDimensions.map((/* entry, index */) => useState(false))

  const renderPoints = (item) => {
    return [...Array(item.current)].map((item, key) => {
      return (
        <Icon key={key} name='gem' solid type='font-awesome-5' color={Colors.secondary} />
      )
    })
  }

  const renderMaxPoints = (item) => {
    return [...Array(5 - item.current)].map((item, key) => {
      return (
        <Icon key={key} name='gem' type='font-awesome-5' color={Colors.secondary} />
      )
    })
  }
  const renderProfileProgress = (dimensions) => dimensions.map((current, index) => {
    const [expanded, setExpanded] = expandedStates[index]
    const key = `dimensions-${index}`
    return (
      <ListItem.Accordion
        noIcon
        containerStyle={{ backgroundColor: 'transparent' }}
        key={key}
        content={
          <>
            <Tts text={current.title} color={current.color} id={`${current.title}-tts`} dontShowText />
            <ListItem.Content style={{ alignItems: 'center' }}>
              <ListItem.Title style={{ color: current.color, fontSize: 24, fontFamily: 'semicolon' }}>{current.title}</ListItem.Title>
            </ListItem.Content>
          </>
        }
        isExpanded={expanded}
        onPress={() => {
          setExpanded(!expanded)
        }}
      >
        {expanded && current.fields.map((item, key) => (
          <ListItem key={key} containerStyle={{ backgroundColor: 'transparent' }}>
            <ListItem.Content style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
              <Tts text={item.title} color={Colors.secondary} id={`${item.title}-tts`} dontShowText />
              <ListItem.Title style={{ color: Colors.secondary, fontSize: 18, paddingTop: 10 }}>{item.title}</ListItem.Title>
              <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
                {renderPoints(item)}
                {renderMaxPoints(item)}
              </View>
            </ListItem.Content>
          </ListItem>
        ))}
      </ListItem.Accordion>
    )
  })

  const containerStyle = mergeStyles(styles.container, props.containerStyle)
  return (
    <View style={containerStyle}>
      <Tts text={t('profileScreen.title')} color={Colors.secondary} id='profileScreen.title' />
      {renderProfileProgress(allDimensions)}
      <View style={styles.body} />
      <View style={styles.progressTitle}>
        <Tts text={t('profileScreen.progress')} color={Colors.primary} id='profileScreen.progress' smallButton />
      </View>
      <LinearProgress color={Colors.primary} variant='determinate' value={profileData.progress.global} style={{ borderRadius: 15, height: 15 }} />
    </View>
  )
}

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  container: {
    flex: 1,
    margin: 10,
    paddingBottom: 10
  },
  body: {
    flex: 2,
    flexDirection: 'row'
  },
  progressTitle: {
    alignItems: 'center',
    margin: 10
  }
})

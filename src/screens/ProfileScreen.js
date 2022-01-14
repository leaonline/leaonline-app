import React, { useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View, Button } from 'react-native'
import { LinearProgress, ListItem, Icon } from 'react-native-elements'
import { useTranslation } from 'react-i18next'
import Colors from '../constants/Colors'
import { TTSengine } from '../components/Tts'
import profileData from '../resources/profileData.js'
import { deleteAccount } from '../meteor/deleteAccount'
import { Log } from '../infrastructure/Log'

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

const ProfileScreen = props => {
  const { t } = useTranslation()
  const allDimensions = changeColor(profileData.progress.dimensions)
  const expandedStates = allDimensions.map((entry, index) => useState(false))

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
            <Tts text={current.title} color={current.color} id={6} testId='routeButton' dontShowText />
            <ListItem.Content style={{ alignItems: 'center' }}>
              <ListItem.Title style={{ color: current.color, fontSize: 24 }}>{current.title}</ListItem.Title>
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
              <Tts text={item.title} color={Colors.secondary} id={6} testId='routeButton' dontShowText />
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

  const deleteMeteorAccount = () => {
    const log = Log.create('deleteMeteorAccount')

    deleteAccount({
      prepare: () => log('send delete request'),
      receive: () => log('response receive'),
      success: () => log('successful deleted'),
      failure: error => Log.error(error)
    })
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.container}>
          <View style={{ alignItems: 'center' }}>
            <Tts text={t('profileScreen.title')} color={Colors.secondary} id={7} testId='profilescreen-header' smallButton />
          </View>
          {renderProfileProgress(allDimensions)}
          <View style={styles.body} />
          <View style={styles.progressTitle}>
            <Tts text={t('profileScreen.progress')} color={Colors.primary} id={8} testId='profilescreen-fortschritt' smallButton />
          </View>
          <LinearProgress color={Colors.primary} variant='determinate' value={profileData.progress.global} style={{ borderRadius: 15, height: 15 }} />
        </View>
        <View style={styles.progressTitle}>
          <Tts text='Account löschen' id='delete account' />
          <Button
            onPress={deleteMeteorAccount}
            title='Account löschen'
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
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

export default ProfileScreen

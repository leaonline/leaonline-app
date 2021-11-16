import React, { useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'
import i18n from 'i18next'
import { LinearProgress, ListItem, Icon } from 'react-native-elements'
import { useTranslation } from 'react-i18next'
import Colors from '../constants/Colors'
import { TTSengine } from '../components/Tts'
import * as data from '../profileData.json'

const Tts = TTSengine.component()

function changeColor (list) {
  for (const i in list) {
    if (list[i].color === 'primary') list[i].color = Colors.primary
    if (list[i].color === 'secondary') list[i].color = Colors.secondary
    if (list[i].color === 'light') list[i].color = Colors.light
    if (list[i].color === 'gray') list[i].color = Colors.gray
    if (list[i].color === 'dark') list[i].color = Colors.dark
    if (list[i].color === 'warning') list[i].color = Colors.warning
    if (list[i].color === 'danger') list[i].color = Colors.danger
    if (list[i].color === 'success') list[i].color = Colors.success
    if (list[i].color === 'info') list[i].color = Colors.info
  }
}

const ProfileScreen = props => {
  const { t } = useTranslation()
  const expandedStates = data.progress.dimensions.map((entry, index) => useState(false))
  console.log(expandedStates)

  const myData = data.progress.dimensions
  console.log(myData)

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
  const renderProfileProgress = ({ index, dimensions }) => {
    const current = dimensions[index]
    const [expanded, setExpanded] = expandedStates[index]

    return (
      <ListItem.Accordion
        noIcon
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
          <ListItem key={key}>
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
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.container}>
          <View style={{ alignItems: 'center' }}>
            <Tts text={t('profileScreen.title')} color={Colors.secondary} id={7} testId='profilescreen-header' smallButton />
          </View>
          {renderProfileProgress({ myData })}
          <View style={styles.body} />

          <View style={styles.progressTitle}>
            <Tts text={t('profileScreen.progress')} color={Colors.primary} id={8} testId='profilescreen-fortschritt' smallButton />
          </View>
          <LinearProgress color={Colors.primary} variant='determinate' value={data.progress.global} style={{ borderRadius: 15, height: 15 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

ProfileScreen.navigationOptions = (navData) => {
  return {
    headerTitle: i18n.t('profileScreen.headerTitle')
  }
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

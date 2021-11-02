import React, { useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'
import i18n from 'i18next'
import { LinearProgress, ListItem, Icon } from 'react-native-elements'
import { useTranslation } from 'react-i18next'
import Colors from '../constants/Colors'
import { TTSengine } from '../components/Tts'
import * as data from '../profileData.json'

const Tts = TTSengine.component()

const ProfileScreen = props => {
  const { t } = useTranslation()
  const [isExpanded, setExpanded] = useState(false)

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

  const renderProfileProgress = () => {
    return (data.progress.dimensions.map((item, key) => (
      <ListItem.Accordion
        noIcon
        key={key}
        content={
          <>
            <Tts text={item.title} color={Colors.danger} id={6} testId='routeButton' dontShowText />
            <ListItem.Content style={{ alignItems: 'center' }}>
              <ListItem.Title style={{ color: Colors.danger, fontSize: 22, fontWeight: 'bold' }}>{item.title}</ListItem.Title>
            </ListItem.Content>
          </>
        }
        isExpanded={isExpanded}
        onPress={() => {
          setExpanded(!isExpanded)
        }}
      >
        {item.fields.map((item, key) => (
          <ListItem key={key}>
            <ListItem.Content style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
              <Tts text={item.title} color={Colors.secondary} id={6} testId='routeButton' dontShowText />
              <ListItem.Title style={{ color: Colors.secondary, fontSize: 18, paddingTop: 10 }}>{item.title}</ListItem.Title>
              <View style={{ flexDirection: 'row' }}>
                {renderPoints(item)}
                {renderMaxPoints(item)}
              </View>
            </ListItem.Content>
          </ListItem>
        ))}
      </ListItem.Accordion>
    )))
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.container}>
          <Tts text={t('profileScreen.title')} color={Colors.secondary} id={7} testId='profilescreen-header' smallButton />
          {renderProfileProgress()}
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

/* return (
    <View style={styles.container}>
      <Tts text={t('profileScreen.title')} color={Colors.secondary} id={7} testId='profilescreen-header' smallButton />
      <View style={styles.body}>
        <Text>Mein Profil</Text>
      </View>

      <View style={styles.progressTitle}>
        <Tts text={t('profileScreen.progress')} color={Colors.primary} id={8} testId='profilescreen-fortschritt' smallButton />
      </View>
      <LinearProgress color={Colors.primary} variant='determinate' value={data.progress.global} style={{ borderRadius: 15, height: 15 }} />
    </View>

  )
} */

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
    alignItems: 'center'
  }
})

export default ProfileScreen

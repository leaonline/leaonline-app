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
  const [expanded, setExpanded] = useState(false)
  const [expanded1, setExpanded1] = useState(false)
  const [expanded2, setExpanded2] = useState(false)
  const [expanded3, setExpanded3] = useState(false)

  const myData = data.progress

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

  /* const renderProfileProgress = () => {
    return (myData.dimensions.map((item, key) => (
      <ListItem.Accordion
        noIcon
        key={key}
        content={
          <>
            <Tts text={item.title} color={Colors.danger} id={6} testId='routeButton' dontShowText />
            <ListItem.Content style={{ alignItems: 'center' }}>
              <ListItem.Title style={{ color: Colors.danger, fontSize: 24 }}>{item.title}</ListItem.Title>
            </ListItem.Content>
          </>
        }
        isExpanded={expanded}
        onPress={() => {
          setExpanded(!expanded)
        }}
      >
        {expanded && item.fields.map((item, key) => (
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
    )))
  } */

  const renderProfileProgress = () => {
    return (
      <ListItem.Accordion
        noIcon
        content={
          <>
            <Tts text={myData.dimensions[0].title} color={myData.dimensions[0].color} id={6} testId='routeButton' dontShowText />
            <ListItem.Content style={{ alignItems: 'center' }}>
              <ListItem.Title style={{ color: myData.dimensions[0].color, fontSize: 24 }}>{myData.dimensions[0].title}</ListItem.Title>
            </ListItem.Content>
          </>
        }
        isExpanded={expanded}
        onPress={() => {
          setExpanded(!expanded)
        }}
      >
        {expanded && myData.dimensions[0].fields.map((item, key) => (
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

  const renderProfileProgress1 = () => {
    return (
      <ListItem.Accordion
        noIcon
        content={
          <>
            <Tts text={myData.dimensions[1].title} color={myData.dimensions[1].color} id={6} testId='routeButton' dontShowText />
            <ListItem.Content style={{ alignItems: 'center' }}>
              <ListItem.Title style={{ color: myData.dimensions[1].color, fontSize: 24 }}>{myData.dimensions[1].title}</ListItem.Title>
            </ListItem.Content>
          </>
        }
        isExpanded={expanded1}
        onPress={() => {
          setExpanded1(!expanded1)
        }}
      >
        {expanded1 && myData.dimensions[1].fields.map((item, key) => (
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

  const renderProfileProgress2 = () => {
    return (
      <ListItem.Accordion
        noIcon
        content={
          <>
            <Tts text={myData.dimensions[2].title} color={myData.dimensions[2].color} id={6} testId='routeButton' dontShowText />
            <ListItem.Content style={{ alignItems: 'center' }}>
              <ListItem.Title style={{ color: myData.dimensions[2].color, fontSize: 24 }}>{myData.dimensions[2].title}</ListItem.Title>
            </ListItem.Content>
          </>
        }
        isExpanded={expanded2}
        onPress={() => {
          setExpanded2(!expanded2)
        }}
      >
        {expanded2 && myData.dimensions[2].fields.map((item, key) => (
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

  const renderProfileProgress3 = () => {
    return (
      <ListItem.Accordion
        noIcon
        content={
          <>
            <Tts text={myData.dimensions[3].title} color={myData.dimensions[3].color} id={6} testId='routeButton' dontShowText />
            <ListItem.Content style={{ alignItems: 'center' }}>
              <ListItem.Title style={{ color: myData.dimensions[3].color, fontSize: 24 }}>{myData.dimensions[3].title}</ListItem.Title>
            </ListItem.Content>
          </>
        }
        isExpanded={expanded3}
        onPress={() => {
          setExpanded3(!expanded3)
        }}
      >
        {expanded3 && myData.dimensions[3].fields.map((item, key) => (
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
          {renderProfileProgress()}
          {renderProfileProgress1()}
          {renderProfileProgress2()}
          {renderProfileProgress3()}
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

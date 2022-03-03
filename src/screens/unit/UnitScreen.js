import React, { useState, useEffect } from 'react'
import { Text, View, SafeAreaView, ScrollView, StatusBar } from 'react-native'
import RouteButton from '../../components/RouteButton'
import Colors from '../../constants/Colors'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { loadDocs } from '../../meteor/loadDocs'
import { loadUnitData } from './loadUnitData'
import { Loading } from '../../components/Loading'
import { Layout } from '../../constants/Layout'
import { UnitContentElementFactory } from '../../components/factories/UnitContentElementFactory'
import { ActionButton } from '../../components/ActionButton'
import { useTranslation } from 'react-i18next'
import './registerComponents'
import { completeUnit } from './completeUnit'
import { Log } from '../../infrastructure/Log'

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
    width: '100%',
    alignItems: 'center',
  },
  elements: {
    alignItems: 'center',
    flex: 1
  },
  navigationButtons: {
    flexDirection: 'row'
  },
  routeButtonContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center'
  },
})

const log = Log.create('UnitScreen')
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
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const [scored, setScored] = useState()
  const docs = loadDocs(loadUnitData)

  useEffect(() => {
    props.navigation.addListener('beforeRemove', (e) => {
      // e.preventDefault(); // FIXME add cancel button to top-nav and uncomment this line to prevent going back
    })
  }, [props.navigation])


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

  // ---------------------------------------------------------------------------
  // ALL STATES
  // ---------------------------------------------------------------------------

  // this is the generic content rendering method, which
  // applies to all content structure across units and unitSets

  const renderContent = (list) => {
    if (!list?.length) { return null }
    return list.map((element, index) => {
      return (<UnitContentElementFactory.Renderer key={index} {...element} />)
    })
  }

  const finish = async () => {
    const route = await completeUnit({ unitSetDoc, sessionDoc, unitDoc })

    return route === 'Unit'
      ? props.navigation.push(route)
      : props.navigation.navigate(route)
  }

  // ---------------------------------------------------------------------------
  // STORY DISPLAY
  // ---------------------------------------------------------------------------
  log('display story?', {
    unitDoc: !!unitDoc,
    unit: sessionDoc.unit,
    nextUnit: sessionDoc.nextUnit,
    story: unitSetDoc.story?.length
  })

  // if this is the very beginning of this unit set AND
  // we have a story to render, let's do it right now
  if (!unitDoc && !sessionDoc.unit && sessionDoc.nextUnit && unitSetDoc.story?.length > 0) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeAreaView}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.elements}>
              {renderContent(unitSetDoc.story)}
            </View>
          </ScrollView>
        </SafeAreaView>

        {/* -------- continue button ---------  */}
        <View style={styles.navigationButtons}>
          <ActionButton tts={t('unitScreen.story.continue')} onPress={finish}/>
        </View>
      </View>
    )
  }

  // ---------------------------------------------------------------------------
  // TASK DISPLAY
  // ---------------------------------------------------------------------------
  log('render unit', unitDoc._id, unitDoc.shortCode, 'page', page, 'checked', scored)

  const checkScore = async () => {
    // get response
    // get scoring method
    // get score
    // send score
    // update state
    setScored(page)
  }

  const nextPage = () => {
    setPage(page + 1)
  }

  const renderTaskPageAction = () => {
    const hasScore = scored === page

    // if the page has not been checked yet we render a check-action button
    if (!hasScore) {
      log('render check button')
      return (
        <ActionButton tts={t('unitScreen.story.check')} onPress={checkScore}/>
      )
    }

    // if this page has been scored, we can display a "continue" button
    // which either moves to the next page or completes the unit

    const hasNextPage = page < unitDoc.pages.length - 1

    if (hasNextPage) {
      log('render next page button')
      return (
        <ActionButton tts={t('unitScreen.story.next')} onPress={nextPage}/>
      )
    }

    log('render complete unit button')
    return (
      <ActionButton tts={t('unitScreen.story.complete')} onPress={finish}/>
    )
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaView}>
        <ScrollView style={styles.scrollView}>

          {/* 1. PART STIMULI */}
          <View style={styles.elements}>
            {renderContent(unitDoc.stimuli)}
          </View>

          {/* 2. PART INSTRUCTIONS */}
          <View style={styles.elements}>
            {renderContent(unitDoc.instructions)}
          </View>

          {/* 3. PART TASK */}
          <View style={styles.elements}>
            {renderContent(unitDoc.pages[page].instructions)}
          </View>

          <View style={styles.elements}>
            <Text>{page + 1} / {unitDoc.pages.length}</Text>
          </View>

          {/* 3. PART TASK */}
          <View style={styles.elements}>
            {renderContent(unitDoc.pages[page].content)}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* -------- continue button ---------  */}
      <View style={styles.navigationButtons}>
        {renderTaskPageAction()}
      </View>
    </View>
  )
}

export default UnitScreen

import React, { useCallback } from 'react'
import { ScrollView, View, Image } from 'react-native'
import { LinearProgress } from 'react-native-elements'
import { Colors } from '../../../constants/Colors'
import { useTranslation } from 'react-i18next'
import { useTts } from '../../../components/Tts'
import { createStyleSheet } from '../../../styles/createStyleSheet'
import { useDocs } from '../../../meteor/useDocs'
import { loadAchievementsData } from './loadAchievementsData'
import { ScreenBase } from '../../BaseScreen'
import { Layout } from '../../../constants/Layout'
import { DimensionAchievements } from './DimensionAchievements'
import { Achievements } from '../../../contexts/Achievements'

/**
 * Displays the user's achievements for
 * all given dimensions and the overall
 * progress.
 *
 * @return {*}
 * @component
 */
export const AchievementsScreen = (props) => {
  const { t } = useTranslation()
  const { Tts } = useTts()
  const docs = useDocs({
    fn: () => loadAchievementsData()
  })

  const overallProgress = docs?.data?.overallProgress ?? 0
  const ready = docs?.data?.dimensions?.length && docs?.data?.fields?.length

  const renderTrophies = useCallback(() => {
    return Object.entries(Achievements.trophies).map(([name, trophy]) => {
      const trophyStyle = [styles.image]

      if (overallProgress > trophy.threshold) {
        trophyStyle.push(styles.imageActive)
      }

      return (
        <Image
          key={name}
          source={trophy.src}
          style={trophyStyle}
          accessibilityRole='image'
          resizeMethod='scale'
          resizeMode='stretch'
        />
      )
    })
  }, [overallProgress])

  return (
    <ScreenBase {...docs} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {ready && (<DimensionAchievements {...docs?.data} />)}

        <View style={styles.images}>
          {renderTrophies()}
        </View>

        <View style={styles.headline}>
          <Tts
            text={t('profileScreen.progress')}
            color={Colors.primary}
            fontStyle={styles.headlineText}
            id='profileScreen.progress'
          />
        </View>
        <View style={styles.headline}>
          <LinearProgress
            color={Colors.primary}
            variant='determinate'
            value={docs?.data?.overallProgress ?? 0}
            style={styles.globalProgress}
          />
        </View>
      </ScrollView>
    </ScreenBase>
  )
}

/**
 * @private
 */
const styles = createStyleSheet({
  container: {
    flex: 1,
    alignItems: 'stretch'
  },
  scrollContainer: {
    ...Layout.container(),
    flexGrow: 1,
    flex: 0
  },
  headline: {
    alignItems: 'center',
    fontWeight: 'bold',
    marginTop: 15
  },
  globalProgress: {
    borderRadius: 15,
    height: 15,
    width: '65%'
  },
  images: {
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  image: {
    width: 75,
    height: 150,
    opacity: 0.3,
    marginLeft: 5,
    marginRight: 5
  },
  imageActive: {
    opacity: 1.0
  }
})

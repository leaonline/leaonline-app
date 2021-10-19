import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import i18n from 'i18next'

const ProfileScreen = props => {
  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Text>Dein Profil</Text>
      </View>
    </View>

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
    alignItems: 'center',
    margin: 30
  },
  body: {
    flex: 2,
    flexDirection: 'row'
  }
})

export default ProfileScreen

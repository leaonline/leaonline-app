import React from 'react'
import { StyleSheet, Text, View, Button } from 'react-native'

class HomeScreen extends React.Component {
  render () {
    return (
      <View style={styles.container}>
        <Text>Welcome</Text>

        <Button
          title='About this app'
          onPress={() =>
            this.props.navigation.navigate('About')}
        />

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default HomeScreen

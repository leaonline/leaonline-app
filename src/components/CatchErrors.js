import React from 'react'
import { View } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'
import { Layout } from '../constants/Layout'
import { ErrorMessage } from './ErrorMessage'
import { Log } from '../infrastructure/Log'

export class CatchErrors extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      error: false,
      message: ''
    }
  }

  componentDidCatch (err, errInfo) {
    Log.error(err)
    this.setState({
      error: true,
      message: errInfo.componentStack.toString()
    })
  }

  render () {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <ErrorMessage error={this.state.error} />
          <ErrorMessage message={this.state.message} />
        </View>
      )
    }
    return this.props.children
  }
}

const styles = createStyleSheet({
  container: {
    ...Layout.container()
  }
})

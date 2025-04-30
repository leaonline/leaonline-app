import React from 'react'
import { View } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'
import { Layout } from '../constants/Layout'
import { ErrorMessage } from './ErrorMessage'
import { ErrorReporter } from '../errors/ErrorReporter'
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
    const stack = errInfo.componentStack.toString()
    const message = err.reason ?? err.message
    this.setState({
      error: true,
      originalError: err,
      message,
      stack
    })

    ErrorReporter.send({ error: err, stack }).catch(Log.error)
  }

  render () {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <ErrorMessage error={this.state.originalError} message={this.state.message} />
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

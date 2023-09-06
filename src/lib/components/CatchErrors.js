import React from 'react'
import { View } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'
import { Layout } from '../constants/Layout'
import { ErrorMessage } from './ErrorMessage'
import { InteractionGraph } from '../infrastructure/log/InteractionGraph'

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
    InteractionGraph.problem({
      type: 'catched',
      error: err,
      details: { ...err.details, stack }
    })
    const message = err.reason ?? err.message
    this.setState({
      error: true,
      originalError: err,
      message,
      stack
    })
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

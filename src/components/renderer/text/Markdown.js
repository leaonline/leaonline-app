import React, { useState, useEffect } from 'react'
import { SafeAreaView, ScrollView, StatusBar } from 'react-native'
import Markdown from 'react-native-markdown-display'

const renderer = {
  heading (text, levle) {

  }
}

export const MarkdownRenderer = props => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={{height: '100%'}}>
          <Markdown>{props.value}</Markdown>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}

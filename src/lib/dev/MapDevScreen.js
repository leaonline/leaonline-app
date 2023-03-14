import React from 'react'
import { View } from 'react-native'
import { Colors } from '../constants/Colors'
import { createStyleSheet } from '../styles/createStyleSheet'
import { Layout } from '../constants/Layout'
import { ClozeRenderer } from '../items/cloze/ClozeRenderer'

const clozeData = {
  text: '2 || 7 || 2 || 2 || : || 9 || = || {{blanks$[3]$$pattern=0123456789}} || {{blanks$[0]$$pattern=0123456789}} || {{blanks$[2]$$pattern=0123456789}}  ||Rest || {{blanks$[4]$$pattern=0123456789}}\n\n{{empty$[e]$$cellBorder=bottom&pattern=0123456789}} || <<>> || <<>> || <<>> || <<>> || <<>> || <<>>|| <<>> || <<>>|| <<>> || <<>> \n\n\n{{empty$[e]$$pattern=0123456789}} || {{empty$[e]$$pattern=0123456789}} || <<>> || <<>> || <<>> || <<>> || <<>>|| <<>> || <<>> || <<>>|| <<>>|| <<>> \n\n{{empty$[e]$$cellBorder=bottom&pattern=0123456789}} || {{empty$[e]$$cellBorder=bottom&pattern=0123456789}} || <<>> || <<>> || <<>> || <<>> || <<>>|| <<>> || <<>> || <<>> || <<>> || <<>> \n\n<<>> ||{{empty$[e]$$pattern=0123456789}} || {{empty$[e]$$pattern=0123456789}} || <<>> || <<>> || <<>> || <<>> || <<>>|| <<>> || <<>>|| <<>> || <<>> \n\n<<>> ||{{empty$[e]$$cellBorder=bottom&pattern=0123456789}} || {{empty$[e]$$cellBorder=bottom&pattern=0123456789}} || <<>> || <<>> || <<>> || <<>> || <<>>|| <<>> || <<>> || <<>> || <<>> \n\n<<>> || <<>> || {{empty$[e]$$pattern=0123456789}} || {{empty$[e]$$pattern=0123456789}} || <<>> || <<>> || <<>> || <<>> || <<>>|| <<>> || <<>> || <<>> \n<<>> || <<>> || {{empty$[e]$$cellBorder=bottom&pattern=0123456789}} || {{empty$[e]$$cellBorder=bottom&pattern=0123456789}} || <<>> || <<>> || <<>> || <<>> || <<>>|| <<>>|| <<>> || <<>> \n\n<<>> || <<>> ||<<>> || {{empty$[e]$$pattern=0123456789}} || <<>> || <<>> || <<>> || <<>> || <<>>|| <<>> || <<>>',
  isTable: true,
  hasTableBorder: false,
  scoring: []
}

export const MapDevScreen = () => {
  return (
    <View style={styles.container}>
      <ClozeRenderer
        value={clozeData}
        dimensionColor='#0ff'
        contentId='123213213'
        submitResponse={() => {}}
      />
    </View>
  )
}

const styles = createStyleSheet({
  container: {
    flex: 1,
    margin: 20
  },
  root: {
    ...Layout.container(),
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    borderColor: '#f00'
  },
  section: { flex: 1 },
  dot: {
    width: 4,
    height: 4,
    backgroundColor: Colors.primary
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: window.width,
    height: '100%',
    borderColor: '#0ff'
  },
  svg: {
    flex: 0,
    position: 'absolute',
    borderColor: '#ff0',
    borderWidth: 1
  }
})

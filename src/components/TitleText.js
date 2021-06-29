import React from 'react';
import {Text, StyleSheet} from 'react-native';

const TitleText = props => <Text style={{ ...styles.body, ...props.style}}>{props.text}</Text>

const styles = StyleSheet.create({
    body: {
        fontFamily: 'semicolon',
        fontSize:18,
        textAlign: 'center',

    }
});

export default TitleText;
import React, {useState} from 'react'
import {Button, Image, StyleSheet, View} from "react-native";
import * as Speech from 'expo-speech';

import {Icon} from "react-native-elements";
import TitleText from "./TitleText";

const Tts = props => {
    const [currentlyPlaying, setCurrentlyPlaying] = useState(false);
    const [ttsText, setTtsText] = useState(props.text)
    const speak = () => {
        if(!currentlyPlaying) {
            Speech.speak(props.text, {
                language: 'ger',
                pitch: 1,
                rate: 1,
                onStart: () => setCurrentlyPlaying(true),
                onDone: () => setCurrentlyPlaying(false)
            });
        } else {
            Speech.stop();
            setCurrentlyPlaying(false)
        }
    };

        return (
            <View style={styles.body}>
                <Icon style={styles.icon} color={props.color} marginonPress={speak} name={"volume-2"}
                      type={"feather"} onPress={speak}></Icon>
                <TitleText style={{color: props.color, paddingLeft: 5}} text={ttsText}></TitleText>
            </View>

        );

}

const styles = StyleSheet.create({
    body: {
        flex: 2,
        flexDirection: 'row',
        marginHorizontal: 32
    },
    icon: {
        paddingBottom: 5,
    }
});

export default Tts;
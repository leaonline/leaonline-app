import React, {useState} from 'react'
import {Button, Image, StyleSheet, View} from "react-native";
import * as Speech from 'expo-speech';

import {Icon} from "react-native-elements";
import TitleText from "./TitleText";
import Colors from "../constants/Colors";

const Tts = props => {
    const [ttsText, setTtsText] = useState(props.text)
    const [isCurrentyPlaying, setCurrentyPlaying] = useState(false)
    const [ttsColorIcon, setTtsColorIcon] = useState(Colors.primary)
    const speak = () => {

        Speech.speak(props.text, {
            language: 'ger',
            pitch: 1,
            rate: 1,
            onStart: () => startSpeak(),
            onDone: () => stopSpeak()
        })
        ;

    }

    const stopSpeak = () => {
        setTtsColorIcon(Colors.primary)
        Speech.stop();
        setCurrentyPlaying(false)
    }

    const startSpeak = () => {
        setTtsColorIcon(Colors.success)
        setCurrentyPlaying(true)

    }


    return (
        <View style={styles.body}>
            <Icon style={styles.icon} color={ttsColorIcon} size={35} marginonPress={speak} name={"volume-2"}
                  type={"feather"} onPress={() => isCurrentyPlaying ? stopSpeak() : speak()}></Icon>
            <TitleText style={{color: props.color, paddingLeft: 5}} text={ttsText}></TitleText>
        </View>

    )

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
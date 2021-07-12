import React, {useState} from 'react'
import {Alert, Button, Image, StyleSheet, View} from "react-native";
import * as Speech from 'expo-speech';

import {Icon} from "react-native-elements";
import TitleText from "./TitleText";
import Colors from "../constants/Colors";

/**
 * Tts stands for Text-To-Speech. It contains an icon and the text to be spoken.
 * @param props:
 *          props.text: The displayed and spoken text
 *          props.color: The color of the icon and the text
 *          - contants/Colors.js
 *          props.align: The parameter to change the text alignment
 *          - ['left', 'right', 'center', 'justify']
 * @returns {JSX.Element}
 * @constructor
 */
const Tts = props => {
    const [ttsText, setTtsText] = useState(props.text)
    const [isCurrentlyPlaying, setCurrentlyPlaying] = useState(false)
    const [ttsColorIcon, setTtsColorIcon] = useState(props.color)
    /**
     * Starts speaking props.text. At startup it calls the function startSpeak() and at the end its calls stopSpeak()
     */
    const speak = async () => {
        let isSpeaking = await Speech.isSpeakingAsync();
        if(!isSpeaking) {
            Speech.speak(props.text, {
                language: 'ger',
                pitch: 1,
                rate: 1,
                onStart: () => startSpeak(),
                onDone: () => stopSpeak()
            });
        }
        else
        {
           Alert.alert("Stop", "Es wird noch geredet ! \n Bitte warten Sie bis zu Ende gespochen wurde oder beenden Sie es vorzeitig")
        }

    }
    /**
     * Stops expo-speech and changes the color back to props.color and sets CurrentlyPlaying to false
     */
    const stopSpeak =  () => {

        setTtsColorIcon(props.color)
        setCurrentlyPlaying(false);
        Speech.stop();

    }
    /**
     * Changes the color of the icon to green and sets CurrentlyPlaying to true, at the start
     */
    const startSpeak =  () => {
        {
            setTtsColorIcon(Colors.success)
            setCurrentlyPlaying(true)
        }
    }



    return (
        <View style={styles.body}>
            <Icon reverse={true} style={styles.icon} color={ttsColorIcon} size={22} marginonPress={speak}
                  name={"volume-2"}
                  type={"feather"} onPress={() => isCurrentlyPlaying ? stopSpeak() : speak()}></Icon>
            <TitleText style={{color: props.color, paddingLeft: 5, textAlign: props.align}}
                       text={props.text}></TitleText>
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
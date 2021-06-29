import React, {useState} from 'react'

import {Image, StyleSheet, View} from "react-native";
import TitleText from "../components/TitleText";
import {Icon} from "react-native-elements";
import * as Speech from 'expo-speech';

const WelcomeScreen = props => {
    const[welcomeText, setWelcomeText] = useState('Welcome to lea-online App my name is Arthur and I am the best')
    const speak = () => {
        Speech.speak(welcomeText, {
            language: 'en',
            pitch: 1,
            rate: 1
        });

    };
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image style={styles.logo} source={require('../assets/logo-footer.png')}/>
            </View>

            <View style={styles.body}>

                <TitleText text={welcomeText}></TitleText>
                <Icon onPress={speak} name={"volume-2"} type={"feather"}></Icon>

            </View>
        </View>
    )
}


const styles = StyleSheet.create({
        container: {
            flex:1,
            padding: 50
        },

        header: {
            flex: 1,
            alignItems: 'center',
        },
        logo: {
            width: 300,
            height: 50,

        },

        body: {
            flex:2,
        }
    }
);

export default WelcomeScreen;


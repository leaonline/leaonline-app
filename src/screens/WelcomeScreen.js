import React, {useState} from 'react'

import {Button, Image, StyleSheet, View} from "react-native";
import TitleText from "../components/TitleText";
import {Icon} from "react-native-elements";
import * as Speech from 'expo-speech';
import Colors from "../constants/Colors";

const WelcomeScreen = props => {
    const[welcomeText, setWelcomeText] = useState('Herzlich Willkommen zu lea online')
    const speak = () => {
        Speech.speak(welcomeText, {
            language: 'ger',
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

                <Icon style={styles.icon} color={Colors.primary} marginonPress={speak} name={"volume-2"} type={"feather"} onPress={speak}></Icon>
                <TitleText style={styles.text} text={welcomeText}></TitleText>

            </View>
            <Icon style={styles.icon} name={"arrow-right-circle"} type={"feather"} size={35} onPress={() => {props.navigation.navigate({routeName: 'TandC'}) }} ></Icon>
        </View>
    )
}

WelcomeScreen.navigationOptions = (navData) => {
    return {
        headerShown: false,
    };
};


const styles = StyleSheet.create({
        container: {
            flex:1,
        },

        header: {
            flex: 1,
            alignItems: 'center',
            margin: 60
        },
        logo: {
            width: 300,
            height: 50,

        },

        body: {
            flex: 2,
            flexDirection: 'row',
            marginHorizontal: 32
        },

        text: {
            color: Colors.primary,
            paddingLeft: 5
        },

        icon: {
            paddingBottom: 5
        }
    }
);

export default WelcomeScreen;


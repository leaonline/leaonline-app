import React, {useState} from 'react'

import {Button, Image, StyleSheet, View} from "react-native";
import TitleText from "../components/TitleText";
import {Icon} from "react-native-elements";
import * as Speech from 'expo-speech';
import Colors from "../constants/Colors";
import Tts from "../components/Tts"

const WelcomeScreen = props => {
    const welcomeText = "Herzlich Willkommen zu lea online"
    return (

        <View style={styles.container}>

            <View style={styles.header}>
                <Image style={styles.logo} source={require('../assets/logo-footer.png')}/>
            </View>

            <View style={styles.body}>

                <Tts text={welcomeText} color={Colors.primary} align={'center'}></Tts>

            </View>
            <View style={styles.navigationButton}>
                <Icon style={styles.icon} name={"arrow-right-circle"} type={"feather"} size={35} onPress={() => {
                    props.navigation.navigate({routeName: 'TandC'})
                }}></Icon>
            </View>
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
            flex: 1,
            alignItems: 'center',
            margin: 30
        },

        header: {
            flex: 1,
            alignItems: 'center',
            margin: 30
        },
        logo: {
            width: 300,
            height: 50,

        },
        body: {
            flex: 2,
            flexDirection: 'row',
        },

        icon: {
            paddingBottom: 5,

        },
        navigationButton: {
            flexDirection: 'row',
        }
    }
);

export default WelcomeScreen;


import React, {useState} from 'react'

import {Button, Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import TitleText from "../components/TitleText";
import {CheckBox, Icon} from "react-native-elements";
import * as Speech from 'expo-speech';
import Colors from "../constants/Colors";
import WelcomeScreen from "./WelcomeScreen";

const TermsAndConditionsScreen = props => {
    const TandCText = "Hiermit stimme ich folgenden Bedingungen zu ...";
    const [termsAndConditionsIsChecked, setTermsAndConditionsCheck] = useState(false);
    const speak = () => {
        Speech.speak(TandCText, {
            language: 'ger',
            pitch: 1,
            rate: 1
        });

    };

    const checkboxHandler = () => {
        setTermsAndConditionsCheck(!termsAndConditionsIsChecked);
    }
    return (
        <View style={styles.container}>
            <View style={styles.body}>

                <Icon style={styles.iconTextToSpeech} color={Colors.primary} marginonPress={speak} name={"volume-2"}
                      type={"feather"} onPress={speak}></Icon>
                <TitleText style={styles.text} text={TandCText}></TitleText>

            </View>

            <View style={styles.checkBox}>
                <Icon style={styles.iconTextToSpeech} color={Colors.primary} marginonPress={speak} name={"volume-2"}
                      type={"feather"} onPress={speak}></Icon>
                <CheckBox title="Ich habe die allgemeinen Geschäftsbedingungen gelesen und stimme ihnen zu"
                          iconRight={true} checked={termsAndConditionsIsChecked} onPress={checkboxHandler}/>
            </View>

            <View style={styles.navigationButtons}>
                <TouchableOpacity>
                    <Icon style={styles.iconNavigation} name={"arrow-left-circle"} type={"feather"} size={35} onPress={() => {
                        props.navigation.navigate({routeName: 'WelcomeScreen'})
                    }}></Icon>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    props.navigation.navigate({routeName: 'Registration'})}} disabled={!termsAndConditionsIsChecked}>
                    <Icon  style={styles.iconNavigation} name={"arrow-right-circle"} type={"feather"} size={35}></Icon>
                </TouchableOpacity>
            </View>

        </View>
    );

}

TermsAndConditionsScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'Allgemeinen Geschäftsbedingungen',
        headerLeft: () => null,
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

        iconTextToSpeech: {
            paddingBottom: 5,
        },

        iconNavigation: {
            paddingBottom: 5,
            padding: 125,
        },
        checkBox: {
            flexDirection: 'row',
        },
        navigationButtons: {
            flexDirection: 'row',
        }
    }
);


export default TermsAndConditionsScreen;
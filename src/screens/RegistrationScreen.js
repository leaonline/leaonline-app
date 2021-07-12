import React, {useState} from 'react'

import {Button, Image, StyleSheet, Text, View} from "react-native";
import {CheckBox, Icon} from "react-native-elements";
import Colors from "../constants/Colors";

const RegistrationScreen = props => {
    return (
        <View style={styles.container}>
            <View style={styles.body}>

                <Text>Formular</Text>

            </View>

            <Icon style={styles.icon} name={"arrow-left-circle"} type={"feather"} size={35} onPress={() => {
                props.navigation.navigate({routeName: 'TandC'})
            }}></Icon>
        </View>
    );

}

RegistrationScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'Registrierung',
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

        icon: {
            paddingBottom: 5
        },
        checkBox: {
            flexDirection: 'row',
        }
    }
);


export default RegistrationScreen;
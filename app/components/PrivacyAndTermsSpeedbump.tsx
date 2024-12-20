import React, { useEffect, useState } from 'react';
import {SafeAreaView} from "react-native-safe-area-context"
import { Text, View, Button, FlatList, ActivityIndicator, StyleSheet, Switch, TouchableOpacity, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';

interface Props {
    onPassSpeedbump: () => void;
}

export default function PrivacyAndTermsSpeedbump({onPassSpeedbump}: Props) {
    const [isPrivacyPolicyAccepted, setIsPrivacyPolicyAccepted] = useState(false)
    const [isTermsOfUseAccepted, setIsTermsOfUseAccepted] = useState(false)
    const [isPrivacyPolicyShown, setIsPrivacyPolicyShown] = useState(false)
    const [isTermsOfUseShown, setIsTermsOfUseShown] = useState(false)

    const acceptTermsAndPrivacy = async() => {
        await AsyncStorage.setItem("privacyAndTermsAccepted", "true")
        onPassSpeedbump()
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={{ height: "100%" }} 
                contentContainerStyle={{ 
                    flexGrow: 1, 
                    justifyContent: "center", 
                    alignItems: "center" 
                }}
                >
                    <View>
            <Text style={{fontSize:18, marginBottom:20}}>Before continuing to Trash Transit, please review and accept our Privacy Policy and Terms of Service.</Text>
            <View style={[
                { flexDirection: "row" },
                Platform.OS === "ios" && { marginBottom: 20 }
            ]}>
                <Switch
                    value={isPrivacyPolicyAccepted}
                    onValueChange={setIsPrivacyPolicyAccepted}
                />
                <View style={{flexDirection:"row", alignItems:"center"}}>
                <Text style={{fontSize:16, marginLeft:10}}>I accept the </Text>
                    <TouchableOpacity onPress={() => setIsPrivacyPolicyShown(!isPrivacyPolicyShown)}>
                        <Text style={[styles.link, {fontSize:16}]}>Privacy Policy</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{flexDirection:"row"}}>
                <Switch
                    value={isTermsOfUseAccepted}
                    onValueChange={setIsTermsOfUseAccepted}
                />
                <View style={{flexDirection:"row", alignItems:"center"}}>
                    <Text style={{fontSize:16, marginLeft:10}}>I accept the </Text>
                    <TouchableOpacity onPress={() => setIsTermsOfUseShown(!isTermsOfUseShown)}>
                        <Text style={[styles.link, {fontSize:16}]}>Terms of Use</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {isPrivacyPolicyShown && <>
                <PrivacyPolicy />
            </>}
            {isTermsOfUseShown && <>
                <TermsOfService />
            </>}
            <TouchableOpacity 
                style={[
                    styles.continueButton, 
                    (!isPrivacyPolicyAccepted || !isTermsOfUseAccepted) && styles.disabledButton
                ]}
                onPress={acceptTermsAndPrivacy}
                disabled={!isPrivacyPolicyAccepted || !isTermsOfUseAccepted}
                >
                <Text 
                    style={[
                    styles.buttonTextContinue, 
                    (!isPrivacyPolicyAccepted || !isTermsOfUseAccepted) && styles.disabledButtonText
                    ]}
                >
                    Let's Go
                </Text>
            </TouchableOpacity>
            </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    link: {
        color: '#007bff',
        textDecorationLine: 'underline',
      },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor:"#fff"
      },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: "wrap",
    marginVertical: 15,
},
continueButton: {
    backgroundColor: '#007bff',      // Active button color
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',            // Centers text within the button
    marginTop: 30,
  },
  disabledButton: {
    backgroundColor: '#A5A5A5',      // Gray color for the disabled state
  },
  buttonTextContinue: {
    color: '#ffffff',                // White text color for contrast
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#d3d3d3',                // Light gray for disabled text
  },
});
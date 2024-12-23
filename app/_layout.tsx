import React, { useEffect, useState } from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, Button, FlatList, ActivityIndicator, StyleSheet, Alert, TouchableOpacity, Linking } from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context"
import { Ionicons } from '@expo/vector-icons';
import Index from './index';
import Comments from "./comments";
import PrivacyAndTermsSpeedbump from './components/PrivacyAndTermsSpeedbump';
import { ErrorProvider } from './components/ErrorContext';
import projectVariables from "../project-variables.json"
import AsyncStorage from '@react-native-async-storage/async-storage';

const backend_host = projectVariables.backend_host;

const Tab = createBottomTabNavigator();

export default function RootLayout() {
  const [loading, setLoading] = useState<boolean>(true);
  const [isAwaitingPrivacyAndTermsAccept, setIsAwaitingPrivacyAndTermsAccept] = useState<boolean>(false);
  const [listOfCities, setListOfCities] = useState<string[]>([])

  const launchErrorAlert = (errorMsg: string) => {
    Alert.alert('‼️ An unexpected error occurred.', errorMsg, [
      {
        text: 'OK',
        // onPress: () => setError(null), // Reset the error state after acknowledging the alert
      },
    ]);
  }

  const fetchData = async () => {
    fetch(`${backend_host}/api/get-all-cities/`, {
      method: 'GET',
    })
    .then((response) => {
      // Check if the response status code is OK (200-299)
      if (!response.ok) {
        launchErrorAlert("Oops! There was a problem getting the list of cities. Please open the app and try again.")
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      return response.json(); // Parse the response as JSON
    })
    .then((data) => {
      setListOfCities(data)
    })
    .catch((error) => {

      launchErrorAlert("Oops! There was a problem connecting to the server. Please open the app and try again.")
    });
    setLoading(false)
  } 

  const determineIfTermsAndPrivacyPreviouslyAccepted = async () => {
    // await AsyncStorage.removeItem("privacyAndTermsAccepted")
    return await AsyncStorage.getItem('privacyAndTermsAccepted')
  }

  const AppStartupActions = async() => {
    if (await determineIfTermsAndPrivacyPreviouslyAccepted() === "true") {
      fetchData()
    } else {
      setIsAwaitingPrivacyAndTermsAccept(true)
      setLoading(false)
    }
  }

  const onConfirmPassSpeedbump = () => {
    setIsAwaitingPrivacyAndTermsAccept(false)
    setLoading(false)
  }

  useEffect(() => {
    AppStartupActions()
  }, [])

  if (loading) {
      return (
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
        </SafeAreaView>
      );
    }
  
    if (isAwaitingPrivacyAndTermsAccept) {
      return (
        <PrivacyAndTermsSpeedbump onPassSpeedbump={onConfirmPassSpeedbump} />
      )
    }

  return (
    <ErrorProvider>
    <Tab.Navigator
      screenOptions={({ route }) => ({
          tabBarActiveTintColor: "#007bff",
          tabBarShowLabel: false,
          tabBarStyle: {
            paddingBottom: 0,
            paddingTop: 8,
            height: 53,
            marginTop: 0,
          },
          tabBarIcon: ({ color, size }) => {
              let iconName;
      
              if (route.name === 'index') {
                iconName = 'bar-chart';
              } else {
                iconName = 'chatbox-ellipses';
              }
      
              return<Ionicons name={iconName as any} size={26} color={color} />;
          },
          header: () => {
            return (
            <SafeAreaView style={styles.headerContainerStyle}>
              <Text style={styles.headerText}>
              {/* <Ionicons name="trash" size={24} color="black" /> <Ionicons name="train-sharp" size={24} color="black" /> */}
              🗑️ Trash Transit
                </Text>
            </SafeAreaView>
            )
          }
          // headerShown: false,
      })}
  >
      <Tab.Screen 
          name="index" 
          children={(props) => 
              <Index 
              listOfCities={listOfCities}
              />
          }
      />
      <Tab.Screen 
          name="comments" 
          children={(props) => 
            <Comments 
            listOfCities={listOfCities}
            />
        }
      />

  </Tab.Navigator></ErrorProvider>
  );
}

const styles = StyleSheet.create({
    headerContainerStyle: {
      backgroundColor: "white",
      paddingVertical: 15,
      paddingBottom:20,
      textAlign: "center",
      borderBottomColor: "#e6e6e6",
      borderBottomWidth: 1
    },
    headerText: {
      textAlign: "center",
      fontWeight: "bold",
      fontSize:25
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
});
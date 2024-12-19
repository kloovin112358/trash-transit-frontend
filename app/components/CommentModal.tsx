import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, Modal, KeyboardAvoidingView, TextInput, Alert } from "react-native";
import CustomSafeAreaView from './CustomSafeAreaView';
import {SafeAreaView} from "react-native-safe-area-context"
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Picker} from '@react-native-picker/picker';

interface Props {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  citiesData: string[];
  onFinalSubmit: (city: string, comment: string) => void;
}

export default function CommentModal({modalVisible, setModalVisible, citiesData, onFinalSubmit}: Props) {
    const [loading, setLoading] = useState(true)
    const [cityError, setCityError] = useState("")
    const [commentError, setCommentError] = useState("")
    const [city, setCity] = useState("")
    const [comment, setComment] = useState("")
    const [wasCityFromAsyncStorage, setCityFromAsyncStorage] = useState(false)

    const getExistingCity = async () => {
      const existingCity = await AsyncStorage.getItem('city')
      if (existingCity && citiesData.some(city => city === existingCity)) {
        setCity(existingCity)
        setCityFromAsyncStorage(true)
      }
      setLoading(false)
    }

    useEffect(() => {
      getExistingCity()
    }, [])

    useEffect(() => {
      if (modalVisible) {
        setCityError("")
        setCommentError("")
      }
    }, [modalVisible])

    const checkAllFields = () => {
      setCityError("")
      setCommentError("")
      let allValid = true; // Tracks whether all fields are valid
      if (city == "") {
        allValid = false
        setCityError("Please provide a city.")
      }
      if (comment == "") {
        allValid = false
        setCommentError("Please provide a comment.")
      } else if (comment.length > 140) {
        allValid = false
        setCommentError("Please make sure comment is at most 140 characters.")
      }
      return allValid; // Return true if no invalid fields, false otherwise
    };

    const finalizeSubmit = async () => {
      AsyncStorage.setItem("city", city)
      onFinalSubmit(city, comment)
      setComment("")
      setModalVisible(false)
    }

    const submitPublish = () => {
      if (checkAllFields()) {
        Alert.alert(
          "Confirm Submission",  // Title of the alert
          "Are you sure you would like to submit the following comment?\n\n" + `"` + comment + `"`, // Message in the alert
          [
            {
              text: "Cancel",  // Button text for "No"
              style: "cancel",  // Optional style for "No" button
              // onPress: () => closeDeleteModal(),
            },
            {
              text: "Submit",  // Button text for "Yes"
              onPress: () => finalizeSubmit(),  // Action for "Yes"
              // style: "destructive"
            },
          ],
          { cancelable: true }  // Optional: Set to true if you want to dismiss the alert when tapped outside
        );
      }
    }

    return (
        <Modal
            visible={modalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
            >
              <CustomSafeAreaView style={styles.modalContainer}>
            {/* <SafeAreaView
                style={[
                  styles.modalContainer,
                  // { paddingTop: insets.top, paddingBottom: insets.bottom },
                ]}
              > */}
                <View style={styles.headerContainer}>
                <View>
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalClose}>
                        <Ionicons name="close" size={40} color="#666666" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.headerText}>Submit Comment</Text>
                </View>
                {loading ? (
                      <SafeAreaView style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007bff" />
                      </SafeAreaView>
                  ) : (
                  <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column',width: "100%"}} behavior="padding" enabled>
                    <ScrollView style={{paddingHorizontal:25}}>
                      <Text style={{fontSize:16, marginTop:15}}>Did something 😡 annoying happen to you on public transit today?</Text>
                      <Text style={{fontSize:16, marginTop:15}}>If you share it on 🗑️ Trash Transit, at least someone else might get some 🎤 comedic value out of it.</Text>
                      {wasCityFromAsyncStorage ? (
                        <>
                          <Text style={{fontSize:20, fontWeight:"bold", marginTop:30}}>City: {city}</Text>
                          <TouchableOpacity onPress={() => {
                            setCityFromAsyncStorage(false)
                          }}
                            
                          >
                              <Text style={{fontSize:16, color:"#007bff", marginTop:5, marginBottom:10}}>Change</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <Text style={{fontSize:20, fontWeight:"bold", marginTop:30}}>Which city are you in?</Text>
                          <Picker
                            selectedValue={city}
                            onValueChange={setCity}
                            // style={{marginTop: Platform.OS === 'android' ? 25 : 0,}}
                            // itemStyle={{
                            //   height: Platform.OS === 'ios' ? 150 : 'auto', // height for iOS, auto for Android
                            //   color: Platform.OS === 'android' ? "purple" : 0, // marginTop for Android, default 0 for iOS
                            // }}
                          >
                            <Picker.Item label="Select city" value="" />
                            
                            {citiesData.map((item) => (
                              <Picker.Item key={item} label={item} value={item} />
                            ))}
                          </Picker>
                          {cityError && <Text style={styles.errorText}>{cityError}</Text>}
                        </>
                      )}
                      <Text style={{fontSize:20, fontWeight:"bold", marginTop:10}}>What happened to you on public transit today?</Text>
                      <TextInput
                          style={[
                            styles.input, styles.textArea, 
                            {marginTop:10},
                            commentError != "" ? styles.invalidInput : null,
                          ]}
                          onChangeText={setComment}
                          value={comment}
                          placeholder="Enter comment"
                          placeholderTextColor="#606060"
                          // keyboardType="numeric"
                          // returnKeyType="done"
                          multiline
                      />
                      <Text 
                        style={[
                          { textAlign: "right", marginTop: 5, fontSize:16 },
                          comment.length > 140 ? styles.errorTextSmall : null
                        ]}
                      >{comment.length} / 140</Text>
                      {commentError && <Text style={styles.errorText}>{commentError}</Text>}
                      <TouchableOpacity style={[styles.submitButton, {marginBottom:50}]} onPress={submitPublish}>
                        <Text style={styles.submitButtonText}>Submit Comment</Text>
                    </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
                  )}
              
              </CustomSafeAreaView>
        </Modal>
    )
}

const styles = StyleSheet.create({
  invalidInput: {
    borderColor: "#dc3545"
  },
  errorTextSmall: {
    color: "#dc3545",
  },
    errorText: {
      color: "#dc3545",
      marginTop: 10,
      fontSize: 18
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerText: {
      fontSize: 25,
      fontWeight: 'bold',
    },
      modalClose: {
        marginRight:10
      },
      formContainer: {
        width:"100%",
        paddingTop:5,
        paddingLeft:20,
        paddingRight:20
      },
      insideScrollable: {
        paddingBottom:50
      },
      tabBar: {
        backgroundColor: 'transparent',  // Remove default background color
        elevation: 0,  // Remove shadow on Android
      },
      tabIndicator: {
        backgroundColor: '#007bff',  // Active tab indicator color
      },
      tabLabel: {
        color:"red",
        backgroundColor: "red",
        flex: 1,
        height: 1000
      },
        modalContainer: {
            width: '100%',
            height: "100%",
            backgroundColor: '#fff',
            borderRadius: 10,
            alignItems: 'center',
          },
          headerContainer: {
            flexDirection: 'row',             // Align items horizontally
            justifyContent: 'flex-start',     // Align the items to the left
            alignItems: 'center',             // Center the close icon vertically
            width: '100%',                    // Ensure it takes full width
            //marginBottom: 10,                 // Optional, to give space below the header 
            borderBottomWidth: 1,             // Add a bottom border with 1px width
            borderBottomColor: '#dcdcdc',     // Set the border color to a faint gray
            paddingLeft:15,
            paddingRight:15,
            paddingTop: 15,
            paddingBottom:10,
          },
      label: {
        fontSize: 16,
        marginBottom: 5,
        marginTop: 15,
      },
      input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
      },
      textArea: {
        height: 100,
        textAlignVertical: 'top',
      },
      fieldContainer: {
        marginBottom: 5,
      },
      buttonContainer: {
        flexDirection: 'row',           // Arrange children in a row
        justifyContent: 'space-between', // Add space between the buttons
        alignItems: 'center',            // Center buttons vertically if needed
        padding:20,
      },
      submitButton: {
        backgroundColor: '#007bff',     // Button color
        padding: 10,
        borderRadius: 5,
        marginTop:20,   
        alignItems: 'center',           // Center text
      },
      closeButton: {
        backgroundColor: '#6C757D',     // Button color
        padding: 10,
        borderRadius: 5,
        flex: 1,                        // Take up available space
        marginRight: 5,                 // Space between buttons
        alignItems: 'center',           // Center text
      },
      submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: "bold"
      },
      closeButtonText: {
        color: '#fff',
        fontSize: 16,
      },
      
    });
  
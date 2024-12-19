import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Modal, KeyboardAvoidingView, Platform } from "react-native";
import CustomSafeAreaView from './CustomSafeAreaView';
import { Ionicons } from '@expo/vector-icons';
import {Picker} from '@react-native-picker/picker';

interface Props {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  citiesData: string[];
  onFinalSubmit: (cityToFilter: string) => void;
}

export default function CommentCityFilterModal({modalVisible, setModalVisible, citiesData, onFinalSubmit}: Props) {
    const [city, setCity] = useState("")

    const finalSubmitPresend = () => {
        if (city != "__blank__") {
            onFinalSubmit(city) 
        } else {
            onFinalSubmit("") 
        }
    }

    const resetFilter = () => {
        setCity("")
        onFinalSubmit("")
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
                <Text style={styles.headerText}>Filter by City</Text>
                </View>
                {/* {loading ? (
                      <SafeAreaView style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007bff" />
                      </SafeAreaView>
                  ) : ( */}
                  <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column',width: "100%"}} behavior="padding" enabled>
                    <ScrollView style={{paddingHorizontal:25}}>
                        <>
                          {/* <Text style={{fontSize:20, fontWeight:"bold", marginTop:30}}>Filter by city</Text> */}
                          <Picker
                            selectedValue={city}
                            onValueChange={setCity}
                            style={{marginTop: Platform.OS === 'android' ? 25 : 0,}}
                            // itemStyle={{
                            //   height: Platform.OS === 'ios' ? 150 : 'auto', // height for iOS, auto for Android
                            //   color: Platform.OS === 'android' ? "purple" : 0, // marginTop for Android, default 0 for iOS
                            // }}
                          >
                            <Picker.Item label="Select city" value="__blank__" />
                            
                            {citiesData.map((item) => (
                              <Picker.Item key={item} label={item} value={item} />
                            ))}
                          </Picker>
                          {/* {cityError && <Text style={styles.errorText}>{cityError}</Text>} */}
                        </>
                      <TouchableOpacity style={[styles.submitButton]} onPress={finalSubmitPresend}>
                        <Text style={styles.submitButtonText}>Filter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.submitButton, {marginTop:5, marginBottom:50, backgroundColor:"#6c757d"}]} onPress={resetFilter}>
                        <Text style={styles.submitButtonText}>Reset</Text>
                    </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
                  {/* )} */}
              
              </CustomSafeAreaView>
        </Modal>
    )
}

const styles = StyleSheet.create({
  invalidInput: {
    borderColor: "#dc3545"
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

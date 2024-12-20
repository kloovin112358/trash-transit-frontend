import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, Modal, KeyboardAvoidingView, TextInput, Alert } from "react-native";
import CustomSafeAreaView from './CustomSafeAreaView';
import {SafeAreaView} from "react-native-safe-area-context"
import { Ionicons } from '@expo/vector-icons';

interface Comment {
    city_name: string;
    id: number;
    report_text: string;
    sent_at: string;
    upvotes: number
}

interface Props {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  comment: Comment | null;
  onFinalSubmit: (commentID: number, reportReason: string) => void;
}

export default function ReportCommentModal({modalVisible, setModalVisible, comment, onFinalSubmit}: Props) {
    const [reportReason, setReportReason] = useState("")
    const [reportReasonError, setReportReasonError] = useState("")

    useEffect(() => {
      if (modalVisible) {
        setReportReasonError("")
      }
    }, [modalVisible])

    const checkAllFields = () => {
    setReportReasonError("")
      let allValid = true; // Tracks whether all fields are valid
      if (reportReason == "") {
        allValid = false
        setReportReasonError("Please provide a report reason.")
      } else if (reportReason.length < 5) {
        allValid = false
        setReportReasonError("Please make sure report reason has at least 5 characters.")
      }
      return allValid; // Return true if no invalid fields, false otherwise
    };

    const finalizeSubmit = async () => {
      if (comment) {
        onFinalSubmit(comment.id, reportReason)
        setReportReason("")
        setModalVisible(false)
      }
    }

    const submitPublish = () => {
      if (checkAllFields()) {
        Alert.alert(
          "Confirm Submission",  // Title of the alert
          `Are you sure you would like to report the following comment?\n\n"` +
            `${comment?.report_text || "No comment provided"}` +
            `"\n\nFor the following reason:\n\n"` +
            `${reportReason || "No reason provided"}"`,
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
                <Text style={styles.headerText}>Report Comment</Text>
                </View>
                  <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column',width: "100%"}} behavior="padding" enabled>
                    <ScrollView style={{paddingHorizontal:25}}>
                      <Text style={{fontSize:16, marginTop:15}}>Please provide your reason for reporting the comment below:</Text>
                        <>
                          <Text style={{fontSize:20, marginVertical:30, fontStyle:"italic"}}>"{comment?.report_text}"</Text>
                        </>
                      <Text style={{fontSize:20, fontWeight:"bold", marginTop:10}}>Why would you like to report this comment?</Text>
                      <TextInput
                          style={[
                            styles.input, styles.textArea, 
                            {marginTop:10},
                            reportReasonError != "" ? styles.invalidInput : null,
                          ]}
                          onChangeText={setReportReason}
                          value={reportReason}
                          placeholder="Enter report reason"
                          placeholderTextColor="#606060"
                          // keyboardType="numeric"
                          // returnKeyType="done"
                          multiline
                      />
                      {reportReasonError && <Text style={styles.errorText}>{reportReasonError}</Text>}
                      <TouchableOpacity style={[styles.submitButton, {marginBottom:50}]} onPress={submitPublish}>
                        <Text style={styles.submitButtonText}>Submit Report</Text>
                    </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
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
  
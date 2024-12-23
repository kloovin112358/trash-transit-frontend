import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, StyleSheet, FlatList, TouchableNativeFeedback, ImageBackground, TouchableOpacity, ScrollView, Modal, KeyboardAvoidingView, TextInput, Platform, Alert } from "react-native";
import CustomSafeAreaView from './CustomSafeAreaView';
import {SafeAreaView} from "react-native-safe-area-context"
import { Ionicons } from '@expo/vector-icons';
import { useError } from '../components/ErrorContext';
import projectVariables from "../../project-variables.json"
import moment from 'moment';

const backend_host = projectVariables.backend_host;

interface City {
  id: number;
  name: string;
}

interface Props {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  cityDictForModal: City | {};
}

interface Comment {
  comment: string;
  submitted_at: string;
}

interface WaitTime {
  submitted_at: string;
  wait_time: number;
}

interface WaitTimeSummary {
  avg_min: number | null;
  highest_min: number | null;
  num_submissions: number;
  rank: number | null;
  time_horizon: string;
}

interface CityDict {
  recent_comments: Comment[];
  recent_wait_times: WaitTime[];
  wait_time_summary: WaitTimeSummary[];
}

export default function CityModal({modalVisible, setModalVisible, cityDictForModal}: Props) {
    const [loading, setLoading] = useState(true)
    const [cityDict, setCityDict] = useState<CityDict | {}>({});
    const { setError } = useError();

    function formatTimestamp(timestamp: string) {
      const date = moment.utc(timestamp).local();  // Convert UTC timestamp to moment object
    
      // Check if it's today or another day
      if (date.isSame(moment(), 'day')) {
        return date.format("h:mm a");
      } else {
        return date.format("dddd MM/DD, h:mm a");
      }
    }

    const fetchData = async () => {
      if ("id" in cityDictForModal) {
        fetch(`${backend_host}/api/city-details/${cityDictForModal.id}/`, {
          method: 'GET',
        })
        .then((response) => {
          // Check if the response status code is OK (200-299)
          if (!response.ok) {
            setError("Oops! There was a problem on our end. Please try again.")
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
          }
          return response.json(); // Parse the response as JSON
        })
        .then((data) => {
          setCityDict(data)
        })
        .catch((error) => {
          setError("Oops! There was a problem connecting to the server.")
        });
        setLoading(false)
      }
      
    } 

    useEffect(() => {
      if (modalVisible && Object.keys(cityDictForModal).length != 0) {
        fetchData()
      }
      
    }, [cityDictForModal, modalVisible])

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
                <Text style={styles.headerText}>{"name" in cityDictForModal && cityDictForModal.name}</Text>
                </View>
                {loading ? (
                      <SafeAreaView style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007bff" />
                      </SafeAreaView>
                  ) : (
                  <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column',width: "100%"}} behavior="padding" enabled>
                    {cityDict && Object.keys(cityDict).length > 0 && <ScrollView style={{paddingHorizontal:25}}>
                    <Text style={[styles.sectionTitle, {marginTop:23}]}>Wait Time Summary 🏆</Text>
                      <ScrollView horizontal={true} style={styles.tableContainer} persistentScrollbar={true}>
                        <View>
                          <View style={styles.tableHeader}>
                            <Text style={styles.tableHeaderCell}></Text>
                            <Text style={[styles.tableHeaderCell, {width:60}]}>Rank</Text>
                            <Text style={styles.tableHeaderCell}>Avg. Wait (Min.)</Text>
                            <Text style={styles.tableHeaderCell}>Worst Wait (Min.)</Text>
                            <Text style={styles.tableHeaderCell}>Reports Count</Text>
                          </View>
                          {cityDict && 'wait_time_summary' in cityDict && cityDict.wait_time_summary.map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                              <Text style={styles.tableCell}>{item.time_horizon}</Text>
                              <Text style={[styles.tableCell, {width:60}]}>{item.rank ? item.rank : "--"}</Text>
                              <Text style={styles.tableCell}>{item.avg_min ? item.avg_min : "--"}</Text>
                              <Text style={styles.tableCell}>{item.highest_min ? item.highest_min : "--"}</Text>
                              <Text style={styles.tableCell}>{item.num_submissions}</Text>
                            </View>
                          ))}
                        </View>
                      </ScrollView>

                      {cityDict && 'recent_wait_times' in cityDict && cityDict.recent_wait_times.length > 0 && <>
                    <View style={styles.borderLine} />

                    {/* Recent Wait Times Section */}
                    <Text style={styles.sectionTitle}>Recent Wait Times ⏱️</Text>
                    {cityDict && cityDict.recent_wait_times.map((item, index) => (
                      <View key={index} style={[index !== 0 ? { marginTop: 20 } : {marginTop:0}]}>

                        <Text style={[{fontSize:30}]}>
                          {item.wait_time} min.
                        </Text>
                        <Text>
                          {formatTimestamp(item.submitted_at)}
                        </Text>
                      </View>
                    ))}</>}


                      {cityDict && 'recent_comments' in cityDict && cityDict.recent_comments.length > 0 && <>
                      <View style={styles.borderLine} />

                      {/* Recent Comments Section */}
                      <Text style={styles.sectionTitle}>Recent Comments 💬</Text>
                      {cityDict && cityDict.recent_comments.map((item, index) => (
                        <View key={index} style={[{marginBottom:20, borderWidth:1, borderColor:"#ccc", padding:10, borderRadius:10}]}>
                          <Text style={[{fontSize:18, marginBottom:5}]}>
                            "{item.comment}"
                          </Text>
                          <Text style={{color:"#a6a6a6"}}>
                          {formatTimestamp(item.submitted_at)}
                          </Text>
                        </View>
                      ))}</>}
                      <View style={{paddingTop:50}}></View>
                    </ScrollView>}
                </KeyboardAvoidingView>
                  )}
              
              </CustomSafeAreaView>
        </Modal>
    )
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
    color:"#007bff"
  },
  tableContainer: {
    marginTop:10
    // marginBottom: 15,
  },
  // table: {
  //   flexDirection: 'row',
  //   marginBottom: 10,
  // },
  tableHeader: {
    flexDirection: 'row',
    // backgroundColor: '#f1f1f1',
    borderBottomWidth: 1,
    // borderBottomColor: '#ccc',
  },
  tableHeaderCell: {
    // padding: 10,
    fontWeight: 'bold',
    width:90,
    // paddingRight:5,
    paddingBottom:5,
    paddingHorizontal:5
    // textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableCell: {
    // padding: 10,
    paddingVertical:5,
    width:90,
    paddingHorizontal:5
    // textAlign: 'center',
  },
  borderLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 15,
    paddingTop:20
  },
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
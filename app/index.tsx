import React, { useEffect, useState, useRef  } from 'react';

import { Text, View, ActivityIndicator, StyleSheet, FlatList, TouchableNativeFeedback, ImageBackground, TouchableOpacity, ScrollView, Alert } from "react-native";
import {SafeAreaView} from "react-native-safe-area-context"
import {backend_host} from "../project-variables.json"
import { Ionicons } from '@expo/vector-icons';
import { useError } from './components/ErrorContext';
import ReportWaitModal from './components/ReportWaitModal';
import CityModal from './components/CityModal';

interface Props {
  listOfCities: string[];
}

interface City {
  average_wait_minutes: number;
  highest_wait_minutes: number;
  id: number;
  name: string;
  thumbnail_image: string;
  top_note_upvotes: number | null;
  top_transit_note: string | null;
}

interface CityForModalDictionaryType {
  id: number;
  name: string;
}

export default function Index({ listOfCities }: Props) {
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState("day")
    const [citiesData, setCitiesData] = useState<City[]>([]);
    const [refreshing, setRefreshing] = useState(false)
    const [cityDictForModal, setCityDictForModal] = useState<CityForModalDictionaryType | {}>({})
    const [showReportModal, setShowReportModal] = useState(false)
    const [showCityModal, setShowCityModal] = useState(false)
    const { setError } = useError();
    const flatListRef = useRef<FlatList<any>>(null);

    const filterTypeOptionsDictList = [
      {label: "Today", serverFilter: "day"},
      {label: "Week", serverFilter: "week"},
      {label: "Month", serverFilter: "month"},
      {label: "Year", serverFilter: "year"},
      {label: "All Time", serverFilter: "all"}
    ]

    const fetchData = async () => {
      fetch(`${backend_host}/api/cities-aggregated/${filterType}/`, {
        method: 'GET',
      })
      .then((response) => {
        // Check if the response status code is OK (200-299)
        if (!response.ok) {
          setError("Oops! There was a problem on our end while updating your list. Please try again.")
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return response.json(); // Parse the response as JSON
      })
      .then((data) => {
        setCitiesData(data)
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
        }
      })
      .catch((error) => {
        setError("Oops! There was a problem connecting to the server.")
      });
    } 

    useEffect(() => {
      if (Object.keys(cityDictForModal).length !== 0) {
        setShowCityModal(true)
      }
    }, [cityDictForModal])

    useEffect(() => {
      fetchData()
      setLoading(false)
    }, [filterType])

    const refreshFromServer = async () => {
      setRefreshing(true)
      await fetchData()
      setRefreshing(false)
    }

    const onCityPress = (city: City) => {
      setCityDictForModal({
        "id": city.id,
        "name": city.name
      })
    }

    const setFilterTypeHandler = (optionText: string) => {
      if (optionText != filterType) {
        setFilterType(optionText)
      }
    }

    const submitWaitMinutes = async (city: string, waitMinutes: string) => {
      setLoading(true)
      fetch(`${backend_host}/api/submit-wait-minutes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: city,
          waitMinutes: waitMinutes,
        }),
      })
      .then((response) => {
        // Check if the response status code is OK (200-299)
        if (!response.ok) {
          setError("Oops! There was a problem on our end while submitting. Please try again.")
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return response.json(); // Parse the response as JSON
      })
      .then((data) => {
        Alert.alert("💯 Success", "Nice! Your wait time was submitted. Let's see if your city is closer to winning.")
        fetchData()
      })
      .catch((error) => {
        setError("Oops! There was a problem connecting to the server.")
      });
      setLoading(false)
    }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </SafeAreaView>
    );
  }
  return (
    <View style={{flex:1, backgroundColor:"white"}}>
      <CityModal modalVisible={showCityModal} setModalVisible={setShowCityModal} cityDictForModal={cityDictForModal}/>
      <ReportWaitModal modalVisible={showReportModal} setModalVisible={setShowReportModal} citiesData={listOfCities} onFinalSubmit={submitWaitMinutes}/>
      <TouchableOpacity style={styles.fixedButton} onPress={() => setShowReportModal(true)}>
        <Ionicons name="add-circle" size={24} color="white" />
        <Text style={{color:"white", marginLeft:5, fontWeight:"bold", fontSize:16}}>Report Wait Time</Text>
      </TouchableOpacity>
      <View>
        <ScrollView horizontal={true} style={styles.scrollView} showsHorizontalScrollIndicator={false}>
          {filterTypeOptionsDictList.map((option) => (
            <TouchableOpacity
              key={option.label}
              onPress={() => setFilterTypeHandler(option.serverFilter)}
              style={[
                styles.optionBox,
                filterType === option.serverFilter && styles.selectedOption, // Apply selected style
                option.serverFilter === "all" && {marginRight:10}
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  filterType === option.serverFilter && styles.selectedText, // Bold the selected text
                  
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList 
        data={citiesData}
        ref={flatListRef}
        refreshing={refreshing}
        onRefresh={refreshFromServer}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
                  <View style={{marginTop:150}}>
                  
                  </View>
                }
        renderItem={({ item, index }) => (
          <>
            <TouchableNativeFeedback onPress={() => onCityPress(item)}>
              
                <View style={styles.cityContainer}>
                  <ImageBackground 
                    source={{ uri: item.thumbnail_image }}
                    style={styles.background}
                  >
                    <View style={{width:"100%", padding:20, backgroundColor: 'rgba(0, 0, 0, 0.5)', flex:1, flexDirection: 'row', alignItems:"flex-start"}}>
                      <View style={styles.indexCircle}>
                        {/* {item.average_wait_minutes && index + 1 === 1 && (
                          <Text
                            style={[
                              styles.crownEmoji, // Custom style for the crown emoji
                              { transform: [{ rotate: '-25deg' }], position: 'absolute', top: -15, left:-5 }
                            ]}
                          >
                            👑
                          </Text>
                        )} */}
                        {item.average_wait_minutes ? (
                          <Text
                          style={
                            (index + 1) >= 10 ? styles.indexTextTwoDigits : styles.indexText
                          }
                        >{index + 1}</Text>
                        ) : (
                          <Text
                          style={styles.indexTextTwoDigits}
                        >--</Text>
                        )}
                      </View>

                      {/* Text Content */}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cityNameText}>{item.name}</Text>
                        <Text style={{color:"white"}}>Avg. wait:   <Text style={{fontWeight:"bold"}}>{item.average_wait_minutes ? item.average_wait_minutes : "--"} min.</Text></Text>
                        <Text style={{color:"white"}}>Worst wait: <Text style={{fontWeight:"bold"}}>{item.highest_wait_minutes ? item.highest_wait_minutes : "--"} min.</Text></Text>
                      </View>
                    </View>
                  </ImageBackground>
                </View>
              
            </TouchableNativeFeedback>
          </>
        )}
      />
    </View>
    
  );
}

const styles = StyleSheet.create({
  crownEmoji: {
    fontSize: 30,  // Adjust size of the crown emoji
    color: 'gold', // Optional: set color of the crown
  },
  fixedButton: {
    flexDirection: "row",
    alignContent:"center",

    position: 'absolute',
    bottom: 50,           // Adjust the positioning as needed
    right: 25,            // Adjust the positioning as needed
    backgroundColor: '#007bff',  // Button color
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,            // Ensures button stays on top
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,

    // Android Shadow
    elevation: 5,
  },
  scrollView: {
    paddingVertical: 10, // Add some space below
    paddingHorizontal: 10
  },
  optionBox: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#ccc', // Grey border
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOption: {
    borderColor:"#007bff",
    backgroundColor: '#007bff', // Highlight border when selected (blue)
  },
  selectedText: {
    fontWeight: 'bold', // Make text bold when selected
    color: 'white', // Change text color to blue when selected
  },
  indexCircle: {
    width: 60,            // Circle width
    height: 60,           // Circle height
    borderRadius: 30,     // Half of width/height for a perfect circle
    backgroundColor: '#fff', // Circle background color
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,      // Space between the circle and the text
  },
  indexTextTwoDigits: {
    fontSize: 24,         // Large text size for the index
    fontWeight: 'bold',
    color: '#000',        // Text color
  },
  indexText: {
    fontSize: 30,         // Large text size for the index
    fontWeight: 'bold',
    color: '#000',        // Text color
  },
  background: {
    flex: 1, // Ensure the image takes up the entire screen
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    borderRadius: 10, // Apply border radius to the image
    overflow: 'hidden', // Ensure content inside follows the border radius
  },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cityContainer: {
      marginHorizontal:10,
      marginVertical:5,
      borderRadius: 10
    },
    cityNameText: {
      fontWeight:"bold",
      fontSize:30,
      color:"white",
      marginBottom:5
    }
});
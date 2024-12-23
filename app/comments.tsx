import React, { useEffect, useState, useRef } from 'react';

import { Text, View, ActivityIndicator, StyleSheet, FlatList, TouchableNativeFeedback, ImageBackground, TouchableOpacity, ScrollView, Alert, TextInput, Animated, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import {SafeAreaView} from "react-native-safe-area-context"
import projectVariables from "../project-variables.json"
import { Ionicons } from '@expo/vector-icons';
import { useError } from './components/ErrorContext';
import CommentModal from './components/CommentModal';
import CommentCityFilterModal from './components/CommentCityFilterModal';
import ReportCommentModal from './components/ReportCommentModal';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const backend_host = projectVariables.backend_host;

interface Props {
  listOfCities: string[];
}

interface Comment {
  city_name: string;
  id: number;
  report_text: string;
  sent_at: string;
  upvotes: number
}

export default function Comments({ listOfCities }: Props) {
    const [loading, setLoading] = useState(false);
    const [sortType, setSortType] = useState("latest")
    const [filterType, setFilterType] = useState<string>("day")
    const [cityFilter, setCityFilter] = useState<string | null>(null)
    const [commentsData, setCommentsData] = useState<Comment[]>([]);
    const [refreshing, setRefreshing] = useState(false)
    const [showCommentModal, setShowCommentModal] = useState(false)
    const [showCityFilterModal, setShowCityFilterModal] = useState(false)
    const [needsToPullFromServer, setNeedsToPullFromServer] = useState(false)
    const [pageNum, setPageNum] = useState<number | null>(null);
    const [showScrollUpButton, setShowScrollUpButton] = useState(false);
    const { setError } = useError();
    const opacity = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef<FlatList<any>>(null);
    const [hasReachedEnd, setHasReachedEnd] = useState(false)
    const [commentToReport, setCommentToReport] = useState<Comment | null>(null)
    const [showReportModal, setShowReportModal] = useState(false)

    const upvoteTextSize = 20

    const filterTypeOptionsDictList = [
      {label: "Today", serverFilter: "day"},
      {label: "Week", serverFilter: "week"},
      {label: "Month", serverFilter: "month"},
      {label: "Year", serverFilter: "year"},
      {label: "All Time", serverFilter: "all"}
    ]

    const fetchData = async () => {
      let urlToSend = `${backend_host}/api/comments-aggregated/${sortType}/`;
    
      let queryParams = [];

      // Add filterType to queryParams
      if (filterType) {
        queryParams.push(`time_filter=${filterType}`);
      }

      // Add cityFilter to queryParams
      if (cityFilter) {
        queryParams.push(`city_name=${cityFilter}`);
      }

      // Add pageNum to queryParams
      if (pageNum) {
        queryParams.push(`page=${pageNum}`);
      } else {
        return false
      }

      // Combine the base URL with the query string if there are parameters
      if (queryParams.length > 0) {
        urlToSend += `?${queryParams.join("&")}`;
      } else if (sortType == "top") {
        return false
      }
    
      try {
        // Fetch data from the backend
        const response = await fetch(urlToSend, {
          method: 'GET',
        });
    
        // Check if the response status code is OK (200-299)
        if (!response.ok) {
          if (response.status !== 404) {
            setError("Oops! There was a problem on our end while updating comments. Please try again.");
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
          } else {
            setHasReachedEnd(true)
          }
        } else {
          // Parse the response as JSON
          const data = await response.json();
      
          // Retrieve liked list from AsyncStorage
          const likedList = await getLikedListFromAsyncStorage();
          let dataToDisplay;

          if (pageNum !== 1) {
            // Merge existing commentsData with new data.results
            dataToDisplay = [...commentsData, ...data.results];
          } else {
            // Use data.results for the first page
            dataToDisplay = data.results;
          }

          if (likedList && likedList.length > 0) {
            dataToDisplay = dataToDisplay.map((item: Comment) => {
              // If item.id is in likedList, add a "liked" key with value true
              if (likedList.includes(item.id)) {
                return { ...item, liked: true };
              }
              return item;
            });
          }

          const reportedList = await getReportedListFromAsyncStorage();

          if (reportedList && reportedList.length > 0) {
            dataToDisplay = dataToDisplay.map((item: Comment) => {
              // If item.id is in likedList, add a "liked" key with value true
              if (reportedList.includes(item.id)) {
                return { ...item, reported: true };
              }
              return item;
            });
          }

          if (data.results.length < 10) {
            setHasReachedEnd(true)
          }
      
          // Set the processed data to the state
          setCommentsData(dataToDisplay);
          if (pageNum == 1 && flatListRef.current) {
            flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
          }
          setNeedsToPullFromServer(false)
        }
      } catch (error) {
        setError("Oops! There was a problem connecting to the server.");
      }
    };

    useEffect(() => {
      Animated.timing(opacity, {
        toValue: showScrollUpButton ? 1 : 0, // Fade in (1) or fade out (0)
        duration: 300, // Animation duration in milliseconds
        useNativeDriver: true, // Use native driver for better performance
      }).start();
    }, [showScrollUpButton]);
    

    useEffect(() => {
      setPageNum(1)
      //setLoading(false)
    }, [])

    useEffect(() => {
      // if (pageNum && pageNum != 1) {
      if (pageNum != 1) {
        setPageNum(1)
      } else {
        setNeedsToPullFromServer(true)
      }      
      setHasReachedEnd(false)
      // }
    }, [sortType, filterType, cityFilter])

    useEffect(() => {
      if (needsToPullFromServer) {
        fetchData()
      }
    }, [needsToPullFromServer])

    useEffect(() => {
      fetchData()
    }, [pageNum])

    const getLikedListFromAsyncStorage = async (): Promise<number[] | null> => {
      try {
        const savedList = await AsyncStorage.getItem('likedList');
        if (savedList !== null) {
          // Parse the JSON string back into an array
          const list: number[] = JSON.parse(savedList);
          return list;
        } else {
          return null;
        }
      } catch (error) {
        return null;
      }
    };
    
    const getReportedListFromAsyncStorage = async (): Promise<number[] | null> => {
      try {
        const savedList = await AsyncStorage.getItem('reportedList');
        if (savedList !== null) {
          // Parse the JSON string back into an array
          const list: number[] = JSON.parse(savedList);
          return list;
        } else {
          return null;
        }
      } catch (error) {
        return null;
      }
    };

    const refreshFromServer = async () => {
      setRefreshing(true)

      if (pageNum != 1) {
        setPageNum(1)
      } else {
        setNeedsToPullFromServer(true)
      }
      
      setRefreshing(false)
    }

    const setFilterTypeHandler = (optionText: string) => {
      setFilterType(optionText)
    }

    const submitComment = async (city: string, comment: string) => {
      setLoading(true)

      try {
        // Fetch data from the backend
        const response = await fetch(`${backend_host}/api/submit-comment/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            city: city,
            comment: comment,
          }),
        })
    
        // Check if the response status code is OK (200-299)
        if (!response.ok) {
          if (response.status !== 404) {
            setError("Oops! There was a problem on our end while submitting comment. Please try again.");
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
          } else {
            setHasReachedEnd(true)
          }
        } else {
          const data = await response.json();
          Alert.alert("💯 Success", "Nice! Your comment was submitted. Thanks for making trash transit a more interesting place.")
          const likedList = await getLikedListFromAsyncStorage();
          if (likedList) {
            if (!likedList.includes(data.comment_id)) {
              likedList.push(data.comment_id);
              await AsyncStorage.setItem('likedList', JSON.stringify(likedList));
              // await setLikedListToAsyncStorage(likedList); // Save updated likedList back to AsyncStorage
            }
          } else {
            await AsyncStorage.setItem("likedList", JSON.stringify([data.comment_id]))
          }
          fetchData()
        }
      } catch (error) {
        setError("Oops! There was a problem connecting to the server.");
      }

      setLoading(false)
    }

    const submitCityFilter = (cityToFilter: string) => {
      setCityFilter(cityToFilter)
      setShowCityFilterModal(false)
      setPageNum(1)
      setNeedsToPullFromServer(true)
    }

    const removeUpvote = async(commentID: number) => {
      fetch(`${backend_host}/api/remove-upvote/${commentID}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        // Check if the response status code is OK (200-299)
        if (!response.ok) {
          setError("Oops! There was a problem on our end while removing upvote. Please try again.")
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return response.json(); // Parse the response as JSON
      })
      .then(async (data) => {
        // Step 1: Update the upvotes count in the commentsData state
        setCommentsData((prevCommentsData) => {
          // Find the comment by commentID and update its "upvotes" value
          return prevCommentsData.map((comment) => {
            if (comment.id === commentID) {
              return { ...comment, upvotes: data.num_upvotes, liked: false }; // Update the upvotes field
            }
            return comment;
          });
        });
  
        // Step 2: Get the likedList from AsyncStorage
        const likedList = await getLikedListFromAsyncStorage();
        if (likedList) {
          // Check if the commentID exists in the likedList
          const updatedLikedList = likedList.filter(id => id !== commentID); // Remove commentID from the list
          // Only update AsyncStorage if the likedList has changed
          if (updatedLikedList.length !== likedList.length) {
            await AsyncStorage.setItem('likedList', JSON.stringify(updatedLikedList));
          }
        }
        // Step 3: Add the commentID to the likedList (if not already present)
        
  
      })
      .catch((error) => {
        setError("Oops! There was a problem connecting to the server.")
      });
    }

    const sendUpvote = async(commentID: number) => {
      fetch(`${backend_host}/api/upvote/${commentID}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        // Check if the response status code is OK (200-299)
        if (!response.ok) {
          setError("Oops! There was a problem on our end while upvoting. Please try again.")
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return response.json(); // Parse the response as JSON
      })
      .then(async (data) => {
        // Step 1: Update the upvotes count in the commentsData state
        setCommentsData((prevCommentsData) => {
          // Find the comment by commentID and update its "upvotes" value
          return prevCommentsData.map((comment) => {
            if (comment.id === commentID) {
              return { ...comment, upvotes: data.num_upvotes, liked: true }; // Update the upvotes field
            }
            return comment;
          });
        });
  
        // Step 2: Get the likedList from AsyncStorage
        const likedList = await getLikedListFromAsyncStorage();
        if (likedList) {
          if (!likedList.includes(commentID)) {
            likedList.push(commentID);
            await AsyncStorage.setItem('likedList', JSON.stringify(likedList));
            // await setLikedListToAsyncStorage(likedList); // Save updated likedList back to AsyncStorage
          }
        } else {
          await AsyncStorage.setItem("likedList", JSON.stringify([commentID]))
        }
        // Step 3: Add the commentID to the likedList (if not already present)
        
  
      })
      .catch((error) => {
        setError("Oops! There was a problem connecting to the server.")
      });
    }

    const handleLoadMoreComments = () => {
      
      if (pageNum && commentsData.length > 0 && !hasReachedEnd) {
        setPageNum(pageNum + 1)
      }
      
    }

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const yOffset = event.nativeEvent.contentOffset.y; // Get the scroll position
      setShowScrollUpButton(yOffset > 200); // Show button if scrolled down by 200px
    };
  
    const scrollToTop = () => {
      flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    };

    // useEffect(() => {
    //   if (commentToReport) {
    //     setShowReportModal(true)
    //   }
    // }, [commentToReport])

    const submitCommentReport = (commentID: number, reportReason: string) => {
      fetch(`${backend_host}/api/report-comment/${commentID}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report_reason: reportReason,
        }),
      })
      .then((response) => {
        // Check if the response status code is OK (200-299)
        if (!response.ok) {
          setError("Oops! There was a problem on our end while reporting. Please try again.")
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return response.json(); // Parse the response as JSON
      })
      .then(async (data) => {
        setCommentsData((prevCommentsData) => {
          // Find the comment by commentID and update its "upvotes" value
          return prevCommentsData.map((comment) => {
            if (comment.id === commentID) {
              return { ...comment, reported: true }; // Update the upvotes field
            }
            return comment;
          });
        });
        // Step 2: Get the likedList from AsyncStorage
        const reportList = await getReportedListFromAsyncStorage();
        if (reportList) {
          if (!reportList.includes(commentID)) {
            reportList.push(commentID);
            await AsyncStorage.setItem('reportedList', JSON.stringify(reportList));
            // await setLikedListToAsyncStorage(likedList); // Save updated likedList back to AsyncStorage
          }
        } else {
          await AsyncStorage.setItem("reportedList", JSON.stringify([commentID]))
        }
        Alert.alert("Comment successfully reported.", "Thanks for submitting a report. The moderators have been notified.")
      })
      .catch((error) => {
        setError("Oops! There was a problem connecting to the server.")
      });
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
      <ReportCommentModal modalVisible={showReportModal} setModalVisible={setShowReportModal} comment={commentToReport} onFinalSubmit={submitCommentReport}/>
      <CommentCityFilterModal modalVisible={showCityFilterModal} setModalVisible={setShowCityFilterModal} citiesData={listOfCities} onFinalSubmit={submitCityFilter} />
      <CommentModal modalVisible={showCommentModal} setModalVisible={setShowCommentModal} citiesData={listOfCities} onFinalSubmit={submitComment}/>
      <TouchableOpacity style={styles.fixedButton} onPress={() => setShowCommentModal(true)}>
        <Ionicons name="add-circle" size={24} color="white" />
        {/* <Text style={{color:"white", marginLeft:5, fontWeight:"bold", fontSize:16}}></Text> */}
      </TouchableOpacity>
      <Animated.View style={[styles.scrollUpButtonContainer, { opacity }]}>
      <TouchableOpacity style={styles.scrollUpButton} onPress={scrollToTop}>
        <Ionicons name="chevron-up" size={24} color="black" />
      </TouchableOpacity>
    </Animated.View>
      <View>
            <ScrollView horizontal={true} style={styles.scrollView} showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  onPress={() => setShowCityFilterModal(true)}
                  style={[
                    styles.optionBox,
                    // sortType === "latest" && styles.selectedOption, // Apply selected style
                  ]}
                >
                  <View style={styles.iconWrapper}>
                    <FontAwesome6 name="sliders" size={18} color="black" />
                    {cityFilter && cityFilter != "" && <View style={styles.indicatorDot} />}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSortType("latest")}
                  style={[
                    styles.optionBox,
                    sortType === "latest" && styles.selectedOption, // Apply selected style
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      sortType === "latest" && styles.selectedText, // Bold the selected text
                    ]}
                  >
                    Latest
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSortType("top")}
                  style={[
                    styles.optionBox,
                    sortType === "top" && styles.selectedOption, // Apply selected style
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      sortType === "top" && styles.selectedText, // Bold the selected text
                    ]}
                  >
                    Top
                  </Text>
                </TouchableOpacity>
                {/* {sortType === "top" && <View style={{borderRightColor: "#ccc", borderRightWidth: 1, marginHorizontal:10, marginRight:16}}>

                </View>} */}
              {sortType === "top" && filterTypeOptionsDictList.map((option) => (
                <TouchableOpacity
                  key={option.label}
                  onPress={() => {
                    setFilterTypeHandler(option.serverFilter)
                    // setFilterType("day")
                  }}
                  style={[
                    styles.optionBox, 
                    sortType === "top" && filterType === option.serverFilter && styles.selectedOption, // Apply selected style
                    option.serverFilter === "all" && {marginRight:10}
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      sortType === "top" && filterType === option.serverFilter && styles.selectedText, // Bold the selected text
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
      <FlatList 
        ref={flatListRef}
        data={commentsData}
        refreshing={refreshing}
        onRefresh={refreshFromServer}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMoreComments}
        onEndReachedThreshold={0.1}
        onScroll={handleScroll} // Track scrolling
        scrollEventThrottle={16} // Optimize scrolling performance
        ListFooterComponent={
          <View style={{marginTop:180}}>
          
          </View>
        }
        ListEmptyComponent={
          <>
          {<View>
            <Text style={{textAlign:"center", marginTop:20}}>No comments found. 🙁</Text>
          </View>}
          </>
        }
        renderItem={({ item, index }) => {
          const sentAt = moment.utc(item.sent_at)
          let timeAgo = '';
    
          // Format sent_at based on time difference
          if (sentAt.isSameOrAfter(moment().subtract(1, 'minute'))) {
            const secondsAgo = moment().diff(sentAt, 'seconds');
            if (secondsAgo == 0) {
              timeAgo = "Now"
            } else {
              timeAgo = `${secondsAgo} second${secondsAgo > 1 ? 's' : ''} ago`;
            }
            
          } else if (sentAt.isSameOrAfter(moment().subtract(1, 'hour'))) {
            const minutesAgo = moment().diff(sentAt, 'minutes');
            timeAgo = `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
          } else if (sentAt.isSameOrAfter(moment().subtract(24, 'hours'))) {
            const hoursAgo = moment().diff(sentAt, 'hours');
            timeAgo = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
          } else if (sentAt.isSameOrAfter(moment().subtract(7, 'days'))) {
            const daysAgo = moment().diff(sentAt, 'days');
            timeAgo = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
          } else if (sentAt.isSameOrAfter(moment().subtract(30, 'days'))) {
            const weeksAgo = moment().diff(sentAt, 'weeks');
            timeAgo = `${weeksAgo} week${weeksAgo > 1 ? 's' : ''} ago`;
          } else if (sentAt.isSameOrAfter(moment().subtract(1, 'year'))) {
            const monthsAgo = moment().diff(sentAt, 'months');
            timeAgo = `${monthsAgo} month${monthsAgo > 1 ? 's' : ''} ago`;
          } else {
            const yearsAgo = moment().diff(sentAt, 'years');
            timeAgo = `${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago`;
          }
    
          return (
            <View style={styles.commentContainer}>
              {/* Left Box for Upvotes */}
              <View style={[styles.upvoteBox]}>
                <Text style={[styles.upvoteText, {marginTop:8, fontSize:upvoteTextSize}]}>{item.upvotes}</Text>
                {item.liked ? (
                  <TouchableOpacity onPress={() => removeUpvote(item.id)}>
                    <MaterialCommunityIcons name="thumb-up" size={20} color="#007bff" style={{padding:5, marginBottom:5}}/>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => sendUpvote(item.id)}>
                    <MaterialCommunityIcons name="thumb-up-outline" size={20} color="black" style={{padding:5, marginBottom:5}}/>
                </TouchableOpacity>
                )}
              </View>
    
              {/* Right Flex Box for Content */}
              <View style={styles.contentBox}>
                <View style={styles.contentInnerBox}>
                  {/* City Name */}
                  <Text style={styles.cityName}>{item.city_name}</Text>
    
                  {/* Report Text */}
                  <Text style={styles.reportText}>"{item.report_text}"</Text>
    
                  {/* Sent At */}
                  <View style={{flexDirection:"row", alignItems:"center", justifyContent:"space-between", width:"100%"}}>
                    {!item.reported ? (<TouchableOpacity onPress={() => {
                      setCommentToReport(item)
                      setShowReportModal(true)
                    }
                    }>
                      <Text style={styles.sentAt}>Report</Text>
                    </TouchableOpacity>) :(
                      <Text style={[styles.sentAt, {fontStyle:"italic"}]}>Reported</Text>
                    )}
                    <Text style={styles.sentAt}>{timeAgo}</Text>
                  </View>
                  
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
    
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    position: 'relative', // Enable positioning for the indicator
  },
  indicatorDot: {
    position: 'absolute',
    top: -2, // Adjust the positioning of the dot
    right: -9,
    width: 8,
    height: 8,
    backgroundColor: '#007bff',
    borderRadius: 4, // Make it a perfect circle
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal:10,
      marginVertical:5,
    // marginBottom: 10,
  },
  upvoteBox: {
    minWidth: 60,
    // height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    // backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginRight: 5,
  },
  upvoteText: {
    fontWeight: 'bold',
    color: '#333',
  },
  contentBox: {
    flex: 1,
  },
  contentInnerBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
  },
  cityName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reportText: {
    fontSize: 16,
    // fontStyle: 'italic',
    marginBottom: 10,
  },
  sentAt: {
    fontSize: 12,
    color: '#666',
    // textAlign: 'right',
  },
  scrollUpButtonContainer: {
    position: "absolute",
    bottom: 120, // Adjust as needed
    right: 28,   // Adjust as needed
    zIndex: 1,  // Ensures it stays on top
  },
  
  scrollUpButton: {
    width: 50,             // Full clickable area
    height: 50,            // Matches width for a circular shape
    borderRadius: 25,      // Makes it round
    backgroundColor: "rgba(190, 190, 190, 0.2)", // Transparent background
    alignItems: "center",  // Centers the icon horizontally
    justifyContent: "center", // Centers the icon vertically
  
    // Optional shadow styling:
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.3,
    // shadowRadius: 4,
    // elevation: 5,
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
    paddingHorizontal: 10,
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
      // borderColor: "#ccc",
      // borderWidth: 1,
      // backgroundColor: '#fff',
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
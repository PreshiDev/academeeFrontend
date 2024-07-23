import React, { useState, useCallback, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  TextInput,
  Alert
} from "react-native";
import { router,  useFocusEffect } from "expo-router";
import axios from "axios";
import YoutubePlayer from "react-native-youtube-iframe";
import { debounce } from "lodash";
import { useNavigation } from "@react-navigation/native";
import Modal from "react-native-modal";
import { SearchInput } from "../../components";
import bell from "../../assets/images/bell.png";
import profileImg from "../../assets/images/profile.png";
import api, { getCsrfToken } from "../(auth)/api/api";
import moment from "moment";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Searchbar } from 'react-native-paper';



const { width } = Dimensions.get("window");

const YOUTUBE_API_KEY = "AIzaSyD1yit1OS-mA5ME-4MZeLQ_wfVVjK9Jnl0"; // Replace with your YouTube API key
const CHANNEL_ID = "UCG30_s37zvEu7FNsLptASjQ"; // Replace with your YouTube channel ID

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [news, setNews] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showForm, setShowForm] = useState(false); // State to toggle form visibility
  const [showSubscription, setShowSubscription] = useState(true); // State to toggle subscription visibility
  const [userDetails, setUserDetails] = useState({
    id: '',
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    subscription_plan: '',
    subscription_start_date: '',
    subscription_end_date: '',
    profile_picture: null,  // Initially null for fetching, set when updating
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const playerRef = useRef(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNews, setFilteredNews] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);


  const fetchVideos = async () => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=20`
      );
      const videoData = response.data.items.slice(0, 6).map(item => ({
        id: item.id.videoId,
        title: item.snippet.title
      }));
      setVideos(videoData);
    } catch (error) {
      console.error("Error fetching YouTube videos:", error);
    }
  };

  const fetchNews = async () => {
    try {
      const response = await api.get("/latest/");
      const newsData = response.data.map(article => ({
        id: article.id,
        title: article.title,
        imageUrl: article.image_url, // Ensure this matches the serialized field name
        content: article.content,
        publishedDate: article.published_date
      }));
      setNews(newsData.slice(0, 4)); // Limit to 4 latest news
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };


 // Fetch user details
const fetchUserDetails = async () => {
  try {
    setIsLoading(true);
    const csrfToken = await AsyncStorage.getItem('csrfToken');
    const accessToken = await AsyncStorage.getItem('accessToken');

    if (!accessToken) {
      throw new Error('Access token not found');
    }

    console.log("CSRF Token:", csrfToken);
    console.log("Access Token:", accessToken);

    const response = await api.get("/user/profile/", {
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        "Authorization": `Bearer ${accessToken}`
      }
    });

    const userData = response.data; // Assuming response.data is your user details object

    // Map the fetched data to set userDetails state
    setUserDetails({
      username: userData.username,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      subscription_plan: userData.subscription_plan,
      subscription_start_date: userData.subscription_start_date,
      subscription_end_date: userData.subscription_end_date,
      profile_picture: userData.profile_picture ? {
        uri: userData.profile_picture,
        name: 'profile.jpg', // Set a default name if needed
        type: 'image/jpeg'  // Adjust type according to your image type
      } : null,
    });

  } catch (error) {
    console.error("Error fetching user details:", error);
    // Alert.alert("Error", "Failed to fetch user details.");
  } finally {
    setIsLoading(false);
  }
};

// Update user details
const updateUserDetails = async () => {
  try {
    setIsLoading(true);
    const csrfToken = await AsyncStorage.getItem('csrfToken');

    console.log("Updating user details with payload:", userDetails);

    const formData = new FormData();
    Object.keys(userDetails).forEach(key => {
      if (key === 'profile_picture' && userDetails[key]) {
        // Append profile_picture as a file object
        formData.append(key, {
          uri: userDetails[key].uri,
          name: userDetails[key].name,
          type: 'image/jpeg',  // Adjust type according to your image type
        });
      } else if (
        key !== 'subscription_start_date' &&
        key !== 'subscription_end_date' &&
        key !== 'subscription_plan'
      ) {
        // Append all other fields except subscription fields
        formData.append(key, userDetails[key]);
      }
    });

    // Conditionally append subscription fields if they are defined
    if (userDetails.subscription_start_date) {
      formData.append(
        'subscription_start_date',
        moment(userDetails.subscription_start_date).toISOString()
      );
    }
    if (userDetails.subscription_end_date) {
      formData.append(
        'subscription_end_date',
        moment(userDetails.subscription_end_date).toISOString()
      );
    }
    if (userDetails.subscription_plan) {
      formData.append('subscription_plan', userDetails.subscription_plan);
    }

    const response = await api.put("/user/update/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-CSRFToken": csrfToken,
      },
    });
    setUserDetails(response.data);
    console.log("User details updated successfully:", response.data);
    Alert.alert(
      "Success",
      "Your details have been updated!",
      [
        {
          text: "OK",
          onPress: () => console.log("OK Pressed"),
          icon: () => <MaterialIcons name="thumb-up" size={20} color="blue" />
        }
      ],
      { cancelable: false }
    );
  } catch (error) {
    console.error("Error updating user details:", error.response?.data || error.message);
    Alert.alert("Error", "Failed to update user details.");
  } finally {
    setIsLoading(false);
  }
};

const onChangeSearch = useCallback(debounce(query => {
  setSearchQuery(query);
  if (query) {
    const filteredNewsData = news.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.content.toLowerCase().includes(query.toLowerCase())
    );
    const filteredVideoData = videos.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredNews(filteredNewsData);
    setFilteredVideos(filteredVideoData);
  } else {
    setFilteredNews(news);
    setFilteredVideos(videos);
  }
}, 300), [news, videos]);



const fetchNotificationCount = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await api.get('/notifications/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const unreadCount = response.data.filter(notification => !notification.is_read).length;
    setNotificationCount(unreadCount);
  } catch (error) {
    console.error('Failed to fetch notification count:', error);
  }
};

const resetNotificationCount = async () => {
  setNotificationCount(0);
};

useEffect(() => {
  fetchVideos();
  fetchNews();
  fetchUserDetails();
}, []);


useFocusEffect(
  useCallback(() => {
    fetchNotificationCount();
  }, [])
);

  const renderNewsItem = ({ item }) => (
    <TouchableOpacity
      style={styles.newsItem}
      onPress={() => router.push({ pathname: "/newsDetail", params: { newsId: item.id } })}
      key={item.id}
    >
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.newsImage} />}
      <View style={styles.newsTextContainer}>
        <Text style={styles.newsHeadline} numberOfLines={1}>
          {item.title}
        </Text>
        <Text numberOfLines={2} style={styles.newsContent}>
          {item.content}
        </Text>
        <Text style={styles.newsTime}>{moment(item.publishedDate).fromNow()}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderVideoItem = ({ item }) => (
    <View style={styles.videoCard} key={item.id}>
      <YoutubePlayer
        ref={playerRef}
        height={200}
        play={false}
        videoId={item.id}
        onFullScreenChange={isFullScreen => setIsFullScreen(isFullScreen)}
        forceAndroidAutoplay={true}
        webViewStyle={styles.webViewStyle}
        initialPlayerParams={{
          preventFullScreen: false
        }}
      />
    </View>
  );

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => {
            router.push('/notifications');
          }}
        >
          <Image source={bell} style={styles.icon} />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <View>
          <Text style={styles.headerText}>Academee</Text>
          <Text style={styles.headerSubText}>Educators App</Text>
        </View>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => {
            fetchUserDetails();
            setIsModalVisible(true);
          }}
        >
          {userDetails.profile_picture ? (
            <Image
              source={{ uri: userDetails.profile_picture.uri }}
              style={styles.icon}
            />
          ) : (
            <Image
              source={profileImg}
              style={styles.icon}
            />
          )}
        </TouchableOpacity>
      </View>
  
      <Searchbar
        placeholder="Search"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchbar}
      />
  
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.navButton} onPress={() => router.push("/days")}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="description" size={24} color="#EE4B2B" />
            </View>
            <Text style={styles.buttonText}>Scheme</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => router.push("/Enote")}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="note" size={24} color="#EE4B2B" />
            </View>
            <Text style={styles.buttonText}>E-notes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => router.push("/examQuestions")}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="question-answer" size={24} color="#EE4B2B" />
            </View>
            <Text style={styles.buttonText}>Exam(Q)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => router.push("/forum")}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="live-help" size={24} color="#EE4B2B" />
            </View>
            <Text style={styles.buttonText}>Ask</Text>
          </TouchableOpacity>
        </View>
      </View>
  
      <View style={styles.videoContainer}>
        <Text style={styles.videoTitle}>Training Videos</Text>
        <FlatList
          data={videos}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={renderVideoItem}
        />
      </View>
    </>
  );
  

  const openImagePickerAsync = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,  // Disable cropping
        quality: 1,
      });

      if (!result.cancelled && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setUserDetails({
          ...userDetails,
          profile_picture: {
            uri: selectedImage.uri,
            name: selectedImage.uri.split('/').pop(),
            type: 'image/jpeg'
          }
        });
      } else {
        Alert.alert("Image selection cancelled.");
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };


  const handleSubscribe = async (plan) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await api.patch(
        `/subscribe/${userDetails.id}/`,
        { subscription_plan: plan },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setUserDetails(response.data);
      setIsModalVisible(false);
      // Send notification logic here
    } catch (error) {
      console.error("Error subscribing:", error);
      Alert.alert("Error", "Failed to subscribe.");
    }
  };


  useEffect(() => {
    fetchUserDetails();
  }, []);

  const renderFooter = () => (
    <View style={styles.newsContainer}>
      <Text style={styles.newsTitle}>Latest News</Text>
      <FlatList
        data={searchQuery ? filteredNews : news}
        keyExtractor={item => item.id}
        renderItem={renderNewsItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />} // Line separator
      />
      <TouchableOpacity style={styles.viewAllButton} onPress={() => router.push("/allNews")}>
        <Text style={styles.viewAllButtonText}>View All</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        data={[]} // Empty data to make FlatList render header and footer
        keyExtractor={() => "dummy"} // Unique key for dummy items
        renderItem={null} // No rendering for the dummy items
      />

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => {
          setIsModalVisible(false);
          setShowForm(false);
          setShowSubscription(false);
        }}
        onSwipeComplete={() => {
          setIsModalVisible(false);
          setShowForm(false);
          setShowSubscription(false);
        }}
        swipeDirection="down"
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setIsModalVisible(false);
                setShowForm(false);
                setShowSubscription(false);
              }}
            >
              <MaterialIcons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            {!showForm && !showSubscription && (
              <View>
                <View style={styles.profileInfoContainer}>
                  <Image
                    source={userDetails.profile_picture ? { uri: userDetails.profile_picture.uri } : profileImg}
                    style={styles.profileImage}
                  />
                  <Text style={styles.username}>{userDetails.username}</Text>
                  <Text style={styles.email}>{userDetails.email}</Text>
                </View>
                <View style={styles.subscriptionInfoContainer}>
                  <Text style={styles.subscriptionTitle}>Subscription Details</Text>
                  <Text style={styles.subscriptionInfo}>
                    Plan: {userDetails.subscription_plan || "Not subscribed"}
                  </Text>
                  {userDetails.subscription_start_date && (
                    <Text style={styles.subscriptionInfo}>
                      Start Date: {moment(userDetails.subscription_start_date).format("MMM DD, YYYY")}
                    </Text>
                  )}
                  {userDetails.subscription_end_date && (
                    <Text style={styles.subscriptionInfo}>
                      End Date: {moment(userDetails.subscription_end_date).format("MMM DD, YYYY")}
                    </Text>
                  )}
                  {!userDetails.subscription_plan && (
                    <TouchableOpacity
                      style={styles.subscribeButton}
                      onPress={() => {
                        setShowSubscription(true);
                      }}
                    >
                      <Text style={styles.subscribeButtonText}>Subscribe</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      setShowForm(true);
                      setShowSubscription(false);
                    }}
                  >
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {showForm && (
              <View style={styles.formContainer}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      let result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        aspect: [4, 3],
                        quality: 1,
                      });

                      if (!result.cancelled) {
                        setUserDetails({
                          ...userDetails,
                          profile_picture: {
                            uri: result.uri,
                            name: 'profile.jpg', // Set a default name if needed
                            type: 'image/jpeg',  // Adjust type according to your image type
                          },
                        });
                      }
                    } catch (error) {
                      console.error("Error picking image:", error);
                      Alert.alert("Error", "Failed to pick image.");
                    }
                  }}
                >
                  <Image
                    source={userDetails.profile_picture ? { uri: userDetails.profile_picture.uri } : profileImg}
                    style={styles.profileImage}
                  />
                </TouchableOpacity>
                <TextInput
                  placeholder="First Name"
                  value={userDetails.first_name}
                  onChangeText={(text) => setUserDetails({ ...userDetails, first_name: text })}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Last Name"
                  value={userDetails.last_name}
                  onChangeText={(text) => setUserDetails({ ...userDetails, last_name: text })}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Email"
                  value={userDetails.email}
                  onChangeText={(text) => setUserDetails({ ...userDetails, email: text })}
                  style={styles.input}
                />
                <TouchableOpacity onPress={openImagePickerAsync} style={styles.imagePickerButton}>
                  <Text style={styles.imagePickerButtonText}>Upload Profile Picture</Text>
                </TouchableOpacity>
                {userDetails?.profile_picture && (
                  <Image source={{ uri: userDetails.profile_picture.uri }} style={styles.profilePicturePreview} />
                )}
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={updateUserDetails}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
            {showSubscription && (
              <View style={styles.subscriptionContainer}>
                <Text style={styles.modalTitle}>Choose a Subscription Plan</Text>
                <TouchableOpacity
                  style={styles.subscriptionButton}
                  onPress={() => handleSubscribe("Monthly")}
                >
                  <Text style={styles.subscriptionButtonText}>Monthly - 1000 Naira</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.subscriptionButton}
                  onPress={() => handleSubscribe("Quarterly")}
                >
                  <Text style={styles.subscriptionButtonText}>Quarterly - 2500 Naira</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.subscriptionButton}
                  onPress={() => handleSubscribe("Annually")}
                >
                  <Text style={styles.subscriptionButtonText}>Annually - 9000 Naira</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#DDDDDD",
  },
  iconContainer: {
    padding: 4,
    borderRadius: 25,
    backgroundColor: "#EEE",
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 25,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 5,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0818A8",
  },
  headerSubText: {
    fontSize: 12,
    color: "#555",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#DDDDDD",
  },
  navButton: {
    alignItems: "center",
  },
  iconWrapper: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#dcdcdc",
  },
  buttonText: {
    marginTop: 5,
    color: "#555",
  },
  videoContainer: {
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0818A8",
    marginLeft: 16,
    marginBottom: 10,
  },
  videoCard: {
    width: width * 0.8,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    marginVertical: 10,
  },
  newsContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0818A8",
    marginBottom: 10,
  },
  newsItem: {
    flexDirection: "row",
    marginBottom: 10,
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  newsImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  newsTextContainer: {
    flex: 1,
  },
  newsHeadline: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  newsContent: {
    fontSize: 12,
    color: "#666",
  },
  newsTime: {
    fontSize: 10,
    color: "#999",
  },
  separator: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 10,
  },
  viewAllButton: {
    alignItems: "center",
    marginTop: 10,
    padding: 10,
    backgroundColor: "#0818A8",
    borderRadius: 20,
  },
  viewAllButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  webViewStyle: {
    borderRadius: 10,
    height: 10,
    overflow: "hidden",
  },
  modalContainer: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalBody: {
    marginTop: 10,
  },
  formContainer: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  profileInfoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  subscriptionInfoContainer: {
    marginBottom: 20,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subscriptionInfo: {
    fontSize: 14,
    color: '#666',
  },
  subscribeButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subscriptionContainer: {
    marginBottom: 20,
  },
  subscriptionButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  subscriptionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchbar: {
    margin: 16,
  },
  editButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Home;

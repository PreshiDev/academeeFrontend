import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { router } from 'expo-router'; // Import router from expo-router

const YOUTUBE_API_KEY = 'AIzaSyD1yit1OS-mA5ME-4MZeLQ_wfVVjK9Jnl0';
const CHANNEL_ID = 'UCG30_s37zvEu7FNsLptASjQ';

const Training = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState({});

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=US&key=${YOUTUBE_API_KEY}`);
      const categoriesData = response.data.items.reduce((acc, category) => {
        acc[category.id] = category.snippet.title;
        return acc;
      }, {});
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      const searchResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet&order=date&maxResults=20`);
      const videoIds = searchResponse.data.items.map(item => item.id.videoId).join(',');
      const videoResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&id=${videoIds}&part=snippet`);
      setVideos(videoResponse.data.items);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchVideos();
  }, []);

  const renderSeparator = () => <View style={styles.separator} />;

  const renderVideoItem = ({ item }) => (
    <View style={styles.videoContainer}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push({ pathname: '/video-details', params: { videoId: item.id } })}
      >
        <Image
          source={{ uri: item.snippet.thumbnails.medium.url }}
          style={styles.thumbnail}
        />
        <View style={styles.textContainer}>
          <Text style={styles.buttonText}>{item.snippet.title}</Text>
          <Text style={styles.descriptionText}>{item.snippet.description.substring(0, 50)}...</Text>
        </View>
      </TouchableOpacity>
      {renderSeparator()}
    </View>
  );

  const renderCategory = ({ item }) => (
    <View>
      <Text style={styles.categoryHeader}>{categories[item.categoryId] || 'Uncategorized'}</Text>
      <FlatList
        data={item.videos}
        keyExtractor={(video) => video.id.toString()}
        renderItem={renderVideoItem}
      />
    </View>
  );

  const categorizedVideos = videos.reduce((acc, video) => {
    const categoryId = video.snippet.categoryId || 'uncategorized';
    if (!acc[categoryId]) {
      acc[categoryId] = { categoryId, videos: [] };
    }
    acc[categoryId].videos.push(video);
    return acc;
  }, {});

  const categorizedVideoList = Object.values(categorizedVideos);

  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Training Videos</Text>
        </View>
        <View style={styles.listContainer}>
          <FlatList
            data={categorizedVideoList}
            keyExtractor={(item) => item.categoryId}
            renderItem={renderCategory}
            contentContainerStyle={styles.list}
          />
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  backgroundContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
  },
  headerContainer: {
    backgroundColor: '#0818A8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginTop: 40,
  },
  header: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    color: 'white',
    marginTop: 10,
  },
  listContainer: {
    backgroundColor: '#0818A8',
    paddingHorizontal: 16,
    paddingBottom: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 60,
  },
  list: {
    flexGrow: 1,
  },
  videoContainer: {
    backgroundColor: '#0818A8',
  },
  button: {
    flexDirection: 'row',
    padding: 10,
    marginVertical: 8,
    borderRadius: 10,
  },
  thumbnail: {
    width: 120,
    height: 90,
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionText: {
    color: 'white',
    fontSize: 12,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginVertical: 8,
  },
  categoryHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    paddingVertical: 10,
    backgroundColor: '#0818A8',
    textAlign: 'center',
  },
});

export default Training;
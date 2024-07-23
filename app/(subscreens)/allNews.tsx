import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../(auth)/api/api'; // Adjust import based on your API file location
import moment from 'moment';
import { useRouter } from 'expo-router'; // Import useRouter from expo-router
import SecondaryBottomNavigation from '../SecondaryBottomNavigation'; // Import SecondaryBottomNavigation



const AllNews = () => {
  const [news, setNews] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await api.get('/latest/');
      const newsData = response.data.map((article) => ({
        id: article.id,
        title: article.title,
        imageUrl: article.image_url, // Ensure this matches the serialized field name
        content: article.content,
        publishedDate: article.published_date,
      }));
      console.log("Articles", newsData.length)
      setNews(newsData);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  const renderNewsItem = ({ item }) => (

    <TouchableOpacity
      style={styles.newsItem}
      onPress={() => router.push({ pathname: '/newsDetail', params: { newsId: item.id } })} // Passing the parameter
      key={item.id}
    >
      {/* console.log("All news", item.id) */}
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.newsImage} />}
      <View style={styles.newsTextContainer}>
        <Text style={styles.newsHeadline}>{item.title}</Text>
        <Text numberOfLines={2} style={styles.newsContent}>{item.content}</Text>
        <Text style={styles.newsTime}>{moment(item.publishedDate).fromNow()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.headerText}>All News</Text>
      </View>
      <FlatList
        data={news}
        keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())} // Handle missing id
        renderItem={renderNewsItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />} // Line separator
        contentContainerStyle={styles.newsList}
      />
      <SecondaryBottomNavigation /> 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  newsList: {
    paddingHorizontal: 16,
    paddingBottom: 70,
  },
  newsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  newsImage: {
    width: 80,
    height: 80,
    marginRight: 16,
    borderRadius: 5,
  },
  newsTextContainer: {
    flex: 1,
  },
  newsHeadline: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  newsContent: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 4,
  },
  newsTime: {
    fontSize: 12,
    color: 'gray',
  },
  separator: {
    height: 1,
    backgroundColor: 'lightgray',
    marginVertical: 8,
  },
});

export default AllNews;
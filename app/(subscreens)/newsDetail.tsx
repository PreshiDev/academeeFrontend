import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import api from '../(auth)/api/api';
import moment from 'moment';
import SecondaryBottomNavigation from '../SecondaryBottomNavigation'; // Import SecondaryBottomNavigation



const NewsDetail = () => {
  const [newsDetail, setNewsDetail] = useState(null);
  const { newsId } = useLocalSearchParams();

  useEffect(() => {
    console.log("News ID>>>", newsId)
    if (newsId !== "") {
      fetchNewsDetail(newsId);
    }
  }, [newsId]);

  const fetchNewsDetail = async (newsId) => {
    try {
      const response = await api.get(`/news/${newsId}/`);
      console.log("NEWsss>>>>> ", response.data)
      setNewsDetail(response.data);
    } catch (error) {
      console.error("Error fetching news detail:", error);
    }
  };

  if (newsDetail === null) {
    console.log("NEW>>>>> ", newsDetail)
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.headerText}>News Detail</Text>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {newsDetail[0].image_url && (
          <Image source={{ uri: newsDetail[0].image_url }} style={styles.newsImage} />
        )}
        <Text style={styles.newsHeadline}>{newsDetail[0].title}</Text>
        <Text style={styles.newsContent}>{newsDetail[0].content}</Text>
        <Text style={styles.newsTime}>{moment(newsDetail[0].published_date).fromNow()}</Text>
        <Text style={styles.newsContent}>Author {newsDetail[0].author}</Text>
      </ScrollView>
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
    paddingVertical: 20,
    borderBottomWidth: 1,
    marginTop: 20,
    borderBottomColor: '#CCCCCC',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  newsImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
  },
  newsHeadline: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  newsTime: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 16,
  },
  newsContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NewsDetail;
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, Button, FlatList } from 'react-native';
import YoutubeIframe from 'react-native-youtube-iframe';
import { useRoute } from '@react-navigation/native';
import api from '../(auth)/api/api';
import SecondaryBottomNavigation from '../SecondaryBottomNavigation'; // Import SecondaryBottomNavigation


const { width } = Dimensions.get('window');

const VideoDetail = () => {
  const route = useRoute();
  const { videoId } = route.params || {};
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  useEffect(() => {
    if (videoId) {
      // Fetch comments for the video
      api.get(`/comments/?video_id=${videoId}`)
        .then(response => {
          setComments(response.data);
        })
        .catch(error => {
          console.error('Error fetching comments:', error);
        });
    }
  }, [videoId]);

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      const commentData = { video_id: videoId, content: newComment.trim() };

      api.post('/comments/', commentData)
        .then(response => {
          setComments([...comments, response.data]);
          setNewComment('');
        })
        .catch(error => {
          console.error('Error submitting comment:', error);
        });
    }
  };

  return (
    <View style={styles.container}>
      {videoId ? (
        <>
          <YoutubeIframe
            height={(width * 9) / 16}
            width={width}
            videoId={videoId}
          />
          <View style={styles.commentsSection}>
            <Text style={styles.header}>Comments</Text>
            <FlatList
              data={comments}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.comment}>
                  <Text>{item.content}</Text>
                </View>
              )}
            />
            <TextInput
              style={styles.input}
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Add a comment..."
            />
            <Button title="Submit" onPress={handleCommentSubmit} />
          </View>
        </>
      ) : (
        <Text style={styles.errorText}>Video ID is missing.</Text>
      )}
      <SecondaryBottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 33,
  },
  commentsSection: {
    flex: 1,
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  comment: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f1f1f1',
    borderRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginTop: 8,
    marginBottom: 8,
  },
});

export default VideoDetail;
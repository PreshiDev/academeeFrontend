import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../(auth)/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Forum = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [replies, setReplies] = useState({});
  const [userProfilePicture, setUserProfilePicture] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const csrfToken = await AsyncStorage.getItem('csrfToken');
      const accessToken = await AsyncStorage.getItem('accessToken');

      if (!accessToken) {
        throw new Error('Access token not found');
      }

      const response = await api.get('/chat/', {
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          "Authorization": `Bearer ${accessToken}`
        }
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      Alert.alert("Error", "Failed to fetch messages");
    }
  };

  const fetchReplies = async (parentId) => {
    try {
      const csrfToken = await AsyncStorage.getItem('csrfToken');
      const accessToken = await AsyncStorage.getItem('accessToken');

      const response = await api.get(`/chat/${parentId}/replies/`, {
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          "Authorization": `Bearer ${accessToken}`
        }
      });

      setReplies(prevReplies => ({ ...prevReplies, [parentId]: response.data }));
    } catch (error) {
      console.error("Error fetching replies:", error);
      Alert.alert("Error", "Failed to fetch replies");
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.cancelled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSend = async () => {
    const formData = new FormData();
    formData.append('text', text);
    if (image) {
      const filename = image.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('image', {
        uri: image,
        name: filename,
        type,
      });
    }

    try {
      const csrfToken = await AsyncStorage.getItem('csrfToken');
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      await api.post('/chat/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          "X-CSRF-Token": csrfToken,
          "Authorization": `Bearer ${accessToken}`
        },
      });
      setText('');
      setImage(null);
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
    }
  };

  const handleReplyChange = (parentId, text) => {
    setReplyText(prevState => ({ ...prevState, [parentId]: text }));
  };

  const handleReplySend = async (parentId) => {
    const reply = replyText[parentId];
    if (!reply) {
      Alert.alert("Error", "Reply text cannot be empty");
      return;
    }

    try {
      const csrfToken = await AsyncStorage.getItem('csrfToken');
      const accessToken = await AsyncStorage.getItem('accessToken');

      await api.post(`/chat/${parentId}/reply/`, { text: reply }, {
        headers: {
          'Content-Type': 'application/json',
          "X-CSRF-Token": csrfToken,
          "Authorization": `Bearer ${accessToken}`
        }
      });
      handleReplyChange(parentId, "");
      fetchReplies(parentId);
    } catch (error) {
      console.error("Error sending reply:", error);
      Alert.alert("Error", "Failed to send reply");
    }
  };

  const toggleReplies = (parentId) => {
    const shouldShowReplies = !showReplies[parentId];
    setShowReplies(prevState => ({ ...prevState, [parentId]: shouldShowReplies }));

    if (shouldShowReplies && !replies[parentId]) {
      fetchReplies(parentId);
    }
  };

  const renderMessageItem = ({ item }) => {
    return (
      <View style={styles.messageItem}>
        <View style={styles.messageHeader}>
          {item.user && (
            <>
              <Image source={{ uri: item.user.profile_picture }} style={styles.messageProfilePicture} />
              <Text style={styles.messageUser}>{item.user.username}</Text>
            </>
          )}
        </View>
        {item.image && <Image source={{ uri: item.image }} style={styles.messageImage} />}
        <Text style={styles.messageText}>{item.text}</Text>

        <TouchableOpacity onPress={() => toggleReplies(item.id)}>
          <Text style={styles.replyButton}>
            {showReplies[item.id] ? 'Hide Replies' : `Reply (${item.replies.length})`}
          </Text>
        </TouchableOpacity>

        {showReplies[item.id] && (
          <View style={styles.replySection}>
            <FlatList
              data={replies[item.id]}
              renderItem={renderReplyItem}
              keyExtractor={(reply) => reply.id ? reply.id.toString() : `${reply.user}-${reply.timestamp || ''}`}
            />
            <TextInput
              style={styles.input}
              placeholder="Type a reply"
              value={replyText[item.id] || ''}
              onChangeText={(text) => handleReplyChange(item.id, text)}
            />
            <Button title="Send Reply" onPress={() => handleReplySend(item.id)} />
          </View>
        )}
      </View>
    );
  };

  const renderReplyItem = ({ item }) => {
    return (
      <View style={styles.replyItem}>
        <View style={styles.messageHeader}>
          {item.user && (
            <>
              <Image source={{ uri: item.user.profile_picture }} style={styles.messageProfilePicture} />
              <Text style={styles.messageUser}>{item.user.username}</Text>
            </>
          )}
        </View>
        {item.image && <Image source={{ uri: item.image }} style={styles.messageImage} />}
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Forum</Text>
      <FlatList
        data={messages.slice().reverse()}
        keyExtractor={(item) => item.id ? item.id.toString() : `${item.user}-${item.timestamp || ''}`}
        renderItem={renderMessageItem}
      />
      <TextInput
        style={styles.input}
        placeholder="Type a message"
        value={text}
        onChangeText={setText}
      />
      {image && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image }} style={styles.imagePreview} />
          <Button title="Remove Image" onPress={() => setImage(null)} />
        </View>
      )}
      <View style={styles.buttonContainer}>
        <Button title="Pick an image" onPress={pickImage} />
        <Button title="Send" onPress={handleSend} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#343a40',
  },
  messageItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  messageUser: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  messageProfilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  messageText: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 10,
  },
  messageImage: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 8,
  },
  replyButton: {
    color: '#007bff',
    marginBottom: 10,
  },
  replySection: {
    marginTop: 10,
    marginLeft: 20,
  },
  replyItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
  },
  input: {
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
  },
});

export default Forum;

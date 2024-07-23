import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import api from '../(auth)/api/api'; // Adjust the import based on your api file location
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Button, Text, Card, Title, Paragraph } from 'react-native-paper';

const News = () => {
  const { control, handleSubmit, reset, watch } = useForm();
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      }
    };
    requestPermission();
  }, []);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Disable cropping
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setImage(selectedImage.uri);
        setImageName(selectedImage.uri.split('/').pop());
        setStatus('Image selected and ready for upload.');
      } else {
        setStatus('Image selection cancelled.');
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('author', data.author);

    if (image) {
      formData.append('image', {
        uri: image,
        name: imageName,
        type: 'image/jpeg', // or 'image/jpg' if 'image/jpeg' doesn't work
      });
    }

    try {
      const csrfToken = await AsyncStorage.getItem('csrfToken');
      const accessToken = await AsyncStorage.getItem('accessToken');

      const response = await api.post('/create/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          "X-CSRF-Token": csrfToken,
          "Authorization": `Bearer ${accessToken}`
        },
      });
      Alert.alert('Success', 'News uploaded successfully');
      reset();
      setImage(null);
      setImageName('');
      setStatus('');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload news');
      console.error(error);
    }
  };

  const title = watch('title');
  const content = watch('content');
  const author = watch('author');
  const isFormValid = title && content && author && image;

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Upload News</Title>

      <Card style={styles.card}>
        <Card.Content>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Title"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                mode="outlined"
              />
            )}
          />

          <Controller
            control={control}
            name="content"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Content"
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={4} // You can adjust the number of lines as needed
                style={styles.textArea}
                mode="outlined"
              />
            )}
          />

          <Controller
            control={control}
            name="author"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Author"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                mode="outlined"
              />
            )}
          />

          <Button
            mode="contained"
            onPress={pickImage}
            style={styles.button}
          >
            Pick an image
          </Button>

          {imageName ? <Text style={styles.imageName}>Selected Image: {imageName}</Text> : null}
          {image && <Image source={{ uri: image }} style={styles.image} />}

          <Text style={styles.status}>{status}</Text>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            disabled={!isFormValid}
            style={styles.button}
          >
            Submit
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    padding: 10,
  },
  input: {
    marginBottom: 10,
  },
  textArea: {
    height: 100, // Adjust the height as needed
    textAlignVertical: 'top', // Ensures text starts from the top
    marginBottom: 10,
  },
  button: {
    marginVertical: 10,
  },
  image: {
    width: '100%',
    height: 200,
    marginVertical: 10,
  },
  imageName: {
    marginVertical: 10,
    fontStyle: 'italic',
  },
  status: {
    marginVertical: 10,
    color: 'green',
  },
});

export default News;

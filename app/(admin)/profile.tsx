import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { TextInput, Button, Text, Card, Title } from 'react-native-paper';
import api from '../(auth)/api/api'; // Adjust the import based on your api file location
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = () => {
  const { control, handleSubmit, reset, watch } = useForm();

  const onSubmit = async (data) => {
    try {
      const csrfToken = await AsyncStorage.getItem('csrfToken');
      const accessToken = await AsyncStorage.getItem('accessToken');

      const response = await api.post('/announcements/create/', data, {
        headers: {
          "X-CSRF-Token": csrfToken,
          "Authorization": `Bearer ${accessToken}`
        },
      });
      Alert.alert('Success', 'Announcement created successfully');
      reset();
    } catch (error) {
      Alert.alert('Error', 'Failed to create announcement');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Create Announcement</Title>

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
            name="message"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Message"
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={4}
                style={styles.textArea}
                mode="outlined"
              />
            )}
          />

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
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
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  button: {
    marginVertical: 10,
  },
});

export default Profile;

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Modal, Portal, Card, Avatar, Appbar, Provider as PaperProvider } from 'react-native-paper';
import api from '../(auth)/api/api'; // Adjust the path if necessary
import AsyncStorage from '@react-native-async-storage/async-storage';

const Admin = () => {
  const [counts, setCounts] = useState({
    user_count: 0,
    subscribed_user_count: 0,
    work_book_count: 0,
    lesson_note_count: 0,
    news_headline_count: 0,
    school_calendar_count: 0,
    scheme_work_count: 0,
    exam_question_count: 0,
    exam_timetable_count: 0,
    class_note_count: 0,
    assembly_topic_count: 0,
    school_activities_count: 0,
    report_sheet_count: 0,
    announcement_count: 0,
  });
  const [profileVisible, setProfileVisible] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [profile, setProfile] = useState({
    id: '',
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    subscription_plan: '',
    subscription_start_date: '',
    subscription_end_date: '',
    profile_picture: null,
  });

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        setAuthenticated(true);
        fetchProfile();
        fetchCounts();
      } else {
        setAuthenticated(false);
        Alert.alert('Not Authenticated', 'You need to be authenticated to view this page.');
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setAuthenticated(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const csrfToken = await AsyncStorage.getItem('csrfToken');
      const accessToken = await AsyncStorage.getItem('accessToken');

      if (!accessToken) {
        throw new Error('Access token not found');
      }

      const response = await api.get("/user/profile/", {
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          "Authorization": `Bearer ${accessToken}`
        }
      });

      const userData = response.data;

      setProfile({
        username: userData.username,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        subscription_plan: userData.subscription_plan,
        subscription_start_date: userData.subscription_start_date,
        subscription_end_date: userData.subscription_end_date,
        profile_picture: userData.profile_picture ? {
          uri: userData.profile_picture,
          name: 'profile.jpg',
          type: 'image/jpeg'
        } : null,
      });

    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchCounts = async () => {
    try {

      const response = await api.get("/get-counts/");

      setCounts(response.data);

    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const showProfileModal = () => setProfileVisible(true);
  const hideProfileModal = () => setProfileVisible(false);

  if (!authenticated) {
    return (
      <PaperProvider>
        <Appbar.Header style={styles.header}>
          <Appbar.Content title="Admin Dashboard" titleStyle={styles.headerTitle} />
        </Appbar.Header>
        <View style={styles.container}>
          <Text style={styles.unauthText}>You need to be authenticated to view this page.</Text>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <Appbar.Header style={styles.header}>
        <Appbar.Action icon="menu" onPress={showProfileModal} color="#2196F3" />
        <Appbar.Content title="Admin Dashboard" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.container}>
        {Object.entries(counts).map(([key, value]) => (
          <Card style={styles.card} key={key}>
            <Card.Title title={key.replace(/_/g, ' ')} titleStyle={styles.cardText} left={(props) => <Avatar.Icon {...props} icon="account" style={styles.avatarIcon} />} />
            <Card.Content>
              <Text style={styles.cardText}>{value}</Text>
            </Card.Content>
          </Card>
        ))}

        <Portal>
          <Modal visible={profileVisible} onDismiss={hideProfileModal} contentContainerStyle={styles.modalContainer}>
            <Card>
              <Card.Title
                title="User Profile"
                left={(props) => profile.profile_picture ?
                  <Avatar.Image {...props} source={{ uri: profile.profile_picture.uri }} /> :
                  <Avatar.Icon {...props} icon="account" />}
              />
              <Card.Content>
                <Text>Username: {profile.username}</Text>
                <Text>Email: {profile.email}</Text>
                <Text>First Name: {profile.first_name}</Text>
                <Text>Last Name: {profile.last_name}</Text>
              </Card.Content>
              <Card.Actions>
                <Button onPress={hideProfileModal}>Close</Button>
              </Card.Actions>
            </Card>
          </Modal>
        </Portal>
      </ScrollView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
  },
  headerTitle: {
    color: '#2196F3',
  },
  container: {
    flexGrow: 1,
    padding: 10,
    backgroundColor: '#f6f6f6',
  },
  card: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#2196F3',
    backgroundColor: '#FFEBEE',
  },
  avatarIcon: {
    backgroundColor: '#2196F3',
  },
  cardText: {
    fontSize: 18,
    color: '#D32F2F',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
  },
  unauthText: {
    fontSize: 18,
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Admin;


import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../(auth)/api/api';
import SecondaryBottomNavigation from '../SecondaryBottomNavigation';
import { Card, Button } from 'react-native-paper';

interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
}

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const csrfToken = await AsyncStorage.getItem('csrfToken');
        const accessToken = await AsyncStorage.getItem('accessToken');

        if (!csrfToken || !accessToken) {
          console.error('CSRF or access token not found');
          return;
        }

        const response = await api.get('/notifications/', {
          headers: {
            "X-CSRF-Token": csrfToken,
            "Authorization": `Bearer ${accessToken}`
          },
        });

        setNotifications(response.data);

        // Clear the notification count in AsyncStorage or your backend
        await api.post('/notifications/reset-count/', {}, {
          headers: {
            "X-CSRF-Token": csrfToken,
            "Authorization": `Bearer ${accessToken}`
          },
        });
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleNotificationPress = (notification: Notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity onPress={() => handleNotificationPress(item)}>
      <View style={styles.notificationCard}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.screenTitle}>Notifications</Text>
        <Text>Loading...</Text>
        <SecondaryBottomNavigation />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotification}
        ListEmptyComponent={<Text>No notifications found</Text>}
      />
      <SecondaryBottomNavigation />

      {selectedNotification && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.modalView}>
            <Card style={styles.modalCard}>
              <Card.Content>
                <Text style={styles.modalTitle}>{selectedNotification.title}</Text>
                <Text style={styles.modalMessage}>{selectedNotification.message}</Text>
                <Button
                  mode="contained"
                  onPress={() => setModalVisible(!modalVisible)}
                  style={styles.closeButton}
                >
                  Close
                </Button>
              </Card.Content>
            </Card>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    width: '80%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 16,
  },
  closeButton: {
    marginTop: 10,
  },
});

export default NotificationsScreen;

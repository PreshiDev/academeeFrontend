import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Platform, Modal, FlatList } from 'react-native';
import { Text, Button, IconButton, Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import Constants from 'expo-constants';
import api from '../(auth)/api/api'; // Adjust the path if necessary
import AsyncStorage from '@react-native-async-storage/async-storage';
import SecondaryBottomNavigation from '../SecondaryBottomNavigation'; // Import SecondaryBottomNavigation

const WorkBook = () => {
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfUri, setPdfUri] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    try {
      const csrfToken = await AsyncStorage.getItem('csrfToken');
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await api.get('/workbook/', {
        headers: {
          "X-CSRF-Token": csrfToken,
          "Authorization": `Bearer ${accessToken}`
        },
      });
      setCalendars(response.data);
    } catch (error) {
      console.error('Error fetching calendars:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPDF = (uri) => {
    const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(uri)}`;
    setPdfUri(googleDocsUrl);
    setModalVisible(true);
  };

  const downloadPDF = async (uri) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access media library is required!');
        return;
      }

      const isGoogleDocsUrl = uri.includes('docs.google.com/gview?embedded=true&url=');
      const pdfUrl = isGoogleDocsUrl ? decodeURIComponent(uri.split('url=')[1]) : uri;
      const fileUri = FileSystem.documentDirectory + pdfUrl.split('/').pop();
      console.log('File URI:', fileUri);

      if (Platform.OS === 'android' && !Constants.isDevice) {
        console.log('Running on an Android emulator, skipping file download.');
        Alert.alert('Download Successful', 'The file has been downloaded (simulated).');
        return;
      }

      const downloadedFile = await FileSystem.downloadAsync(pdfUrl, fileUri);

      const asset = await MediaLibrary.createAssetAsync(downloadedFile.uri);
      await MediaLibrary.createAlbumAsync('Download', asset, false);

      Alert.alert('Download Successful', 'The file has been downloaded to your Downloads folder.');
    } catch (error) {
      if (Platform.OS === 'android' && !Constants.isDevice) {
        console.log('Error on emulator:', error);
        Alert.alert('Download Successful', 'The file has been downloaded (simulated).');
      } else {
        console.error('Error downloading file:', error);
        Alert.alert('Download Failed', 'An error occurred while downloading the file.');
      }
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.title}</Title>
        <Paragraph>{item.description}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button icon="file-document" onPress={() => openPDF(item.pdf)}>Open PDF</Button>
        <Button icon="download" onPress={() => downloadPDF(item.pdf)}>Download PDF</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Work Books</Text>
      {loading ? (
        <ActivityIndicator animating={true} size="large" />
      ) : (
        <FlatList
          data={calendars}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
      <SecondaryBottomNavigation />
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <IconButton icon="close" size={24} onPress={() => setModalVisible(false)} />
            <WebView source={{ uri: pdfUri }} style={styles.webView} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
  },
});

export default WorkBook;
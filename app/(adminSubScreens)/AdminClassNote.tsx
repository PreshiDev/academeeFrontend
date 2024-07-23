import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as DocumentPicker from 'expo-document-picker';
import api from '../(auth)/api/api'; // Adjust the import based on your api file location
import AsyncStorage from '@react-native-async-storage/async-storage';
import SecondaryBottomNavigation from '../adminSecoondNav'; // Import SecondaryBottomNavigation
import { TextInput, Button, Text, Appbar, Card, IconButton, Snackbar } from 'react-native-paper';

const UploadClassNote = () => {
  const { control, handleSubmit, reset } = useForm();
  const [pdf, setPdf] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [status, setStatus] = useState('');
  const [isPdfSelected, setIsPdfSelected] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (result.canceled) {
        setStatus('PDF selection cancelled.');
        setPdf(null);
        setPdfName('');
        setIsPdfSelected(false);
      } else {
        const file = result.assets ? result.assets[0] : result;
        setPdf(file);
        setPdfName(file.name);
        setStatus('PDF selected and ready for upload.');
        setIsPdfSelected(true);
      }
    } catch (error) {
      console.error('Error picking PDF: ', error);
      Alert.alert('Error', 'Failed to pick PDF. Please try again.');
      setStatus('Error picking PDF. Please try again.');
      setIsPdfSelected(false);
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);

    if (pdf) {
      formData.append('pdf', {
        uri: pdf.uri, // Use pdf.uri for the URI
        name: pdf.name, // Use pdf.name for the file name
        type: 'application/pdf',
      });
    }

    try {
      const csrfToken = await AsyncStorage.getItem('csrfToken');
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await api.post('/classnote/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          "X-CSRF-Token": csrfToken,
          "Authorization": `Bearer ${accessToken}`
        },
      });
      Alert.alert('Success', 'School calendar uploaded successfully');
      reset();
      setPdf(null);
      setPdfName('');
      setStatus('');
      setIsPdfSelected(false);
      setSnackbarVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload school calendar');
      console.error(error.response.data);
      setStatus('Error uploading PDF. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Upload Class Note" />
      </Appbar.Header>

      <Card style={styles.card}>
        <Card.Title title="Upload Class Note" />
        <Card.Content>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Title"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                style={styles.input}
              />
            )}
          />
          <Button mode="outlined" onPress={pickPdf} style={styles.button}>
            Pick a PDF
          </Button>
          {pdfName ? <Text style={styles.pdfName}>Selected PDF: {pdfName}</Text> : null}
          <Text style={styles.status}>{status}</Text>
        </Card.Content>
        <Card.Actions>
          {isPdfSelected && (
            <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.submitButton}>
              Submit
            </Button>
          )}
        </Card.Actions>
      </Card>

      <SecondaryBottomNavigation />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={Snackbar.DURATION_SHORT}
      >
        School calendar uploaded successfully!
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  card: {
    margin: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
  pdfName: {
    marginVertical: 10,
    fontStyle: 'italic',
  },
  status: {
    marginVertical: 10,
    color: 'green',
  },
  submitButton: {
    marginLeft: 'auto',
  },
});

export default UploadClassNote;
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as DocumentPicker from 'expo-document-picker';
import { TextInput, Button, Text, Appbar, Card, Snackbar } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import api from '../(auth)/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SecondaryBottomNavigation from '../adminSecoondNav';

const UploadEnote = () => {
  const { control, handleSubmit, reset } = useForm();
  const [pdf, setPdf] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [status, setStatus] = useState('');
  const [isPdfSelected, setIsPdfSelected] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [term, setTerm] = useState(null);
  const [classSelected, setClassSelected] = useState(null);
  const [openTermPicker, setOpenTermPicker] = useState(false);
  const [openClassPicker, setOpenClassPicker] = useState(false);
  const [termOptions, setTermOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);

  useEffect(() => {
    const fetchChoices = async () => {
      try {
        const response = await api.get('/lessonchoices/');
        setTermOptions(response.data.term_choices);
        setClassOptions(response.data.class_choices);
      } catch (error) {
        console.error('Error fetching choices: ', error);
        Alert.alert('Error', 'Failed to fetch choices. Please try again.');
      }
    };

    fetchChoices();
  }, []);

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
    formData.append('term', term);
    formData.append('classes', classSelected);

    if (pdf) {
      formData.append('pdf', {
        uri: pdf.uri,
        name: pdf.name,
        type: 'application/pdf',
      });
    }

    try {
      const csrfToken = await AsyncStorage.getItem('csrfToken');
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await api.post('/lessonnote/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          "X-CSRF-Token": csrfToken,
          "Authorization": `Bearer ${accessToken}`
        },
      });
      Alert.alert('Success', 'Lesson Note uploaded successfully');
      reset();
      setPdf(null);
      setPdfName('');
      setStatus('');
      setIsPdfSelected(false);
      setSnackbarVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload lesson note');
      console.error(error.response.data);
      setStatus('Error uploading PDF. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Upload Lesson Note" />
      </Appbar.Header>

      <Card style={styles.card}>
        <Card.Title title="Upload Lesson Note" />
        <Card.Content>

          <DropDownPicker
            open={openClassPicker}
            value={classSelected}
            items={classOptions}
            setOpen={setOpenClassPicker}
            setValue={setClassSelected}
            setItems={setClassOptions}
            placeholder="Select Class"
            style={styles.input}
            dropDownContainerStyle={styles.dropdown}
            zIndex={1000}
            zIndexInverse={2000}
          />

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

          <DropDownPicker
            open={openTermPicker}
            value={term}
            items={termOptions}
            setOpen={setOpenTermPicker}
            setValue={setTerm}
            setItems={setTermOptions}
            placeholder="Select Term"
            style={styles.input}
            dropDownContainerStyle={styles.dropdown}
            zIndex={2000}
            zIndexInverse={1000}
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
        Lesson Note uploaded successfully!
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
  dropdown: {
    zIndex: 1000,
    elevation: 1000,
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

export default UploadEnote;

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import api from '../(auth)/api/api'; // Adjust the path if necessary
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SecondaryBottomNavigation from '../SecondaryBottomNavigation'; // Import SecondaryBottomNavigation

const Enote = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfUri, setPdfUri] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [term, setTerm] = useState(null);
  const [classSelected, setClassSelected] = useState(null);
  const [openTermPicker, setOpenTermPicker] = useState(false);
  const [openClassPicker, setOpenClassPicker] = useState(false);
  const [termOptions, setTermOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);

  useEffect(() => {
    const fetchChoices = async () => {
      try {
        const csrfToken = await AsyncStorage.getItem('csrfToken');
        const accessToken = await AsyncStorage.getItem('accessToken');
        const response = await api.get('/lessonchoices/', {
          headers: {
            'Content-Type': 'multipart/form-data',
            "X-CSRF-Token": csrfToken,
            "Authorization": `Bearer ${accessToken}`
          },
        });
        setTermOptions(response.data.term_choices);
        setClassOptions(response.data.class_choices);
      } catch (error) {
        console.error('Error fetching choices: ', error);
      }
    };

    fetchChoices();
    fetchNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [term, classSelected, notes]);

  const fetchNotes = async () => {
    try {
      const csrfToken = await AsyncStorage.getItem('csrfToken');
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await api.get('/lessonnote/', {
        headers: {
          'Content-Type': 'multipart/form-data',
          "X-CSRF-Token": csrfToken,
          "Authorization": `Bearer ${accessToken}`
        },
      });
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = useCallback(() => {
    const filtered = notes.filter(
      (note) => 
        (term === null || note.term === term) && 
        (classSelected === null || note.classes.includes(classSelected))
    );
    setFilteredNotes(filtered);
  }, [term, classSelected, notes]);

  const openPDF = (url) => {
    const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    setPdfUri(googleDocsUrl);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openPDF(item.pdf)}>
      <View style={styles.noteItem}>
        <Text style={styles.noteTitle}>{item.title}</Text>
        <Ionicons name="document-outline" size={24} color="black" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Lesson Notes</Text>
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

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={filteredNotes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}

      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={36} color="black" />
          </TouchableOpacity>
          {pdfUri && (
            <WebView
              source={{ uri: pdfUri }}
              style={{ flex: 1 }}
            />
          )}
        </View>
      </Modal>

      <SecondaryBottomNavigation /> 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  dropdown: {
    zIndex: 1000,
    elevation: 1000,
  },
  noteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  noteTitle: {
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 10,
    alignSelf: 'flex-end',
  },
});

export default Enote;

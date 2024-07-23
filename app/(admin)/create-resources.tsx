import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router'; // Import router from expo-router

const Resource = () => {
  const screenDestinations = [
    { screenName: '/AdminSchoolCalendars', buttonText: 'School Calendar' },
    { screenName: '/AdminDays', buttonText: 'Scheme of Works' },
    { screenName: '/AdminEnote', buttonText: 'Lesson E-Notes' },
    { screenName: '/AdminExamQuestions', buttonText: 'Exam Questions' },
    { screenName: '/AdminExamTimetable', buttonText: 'Exam Timetable' },
    { screenName: '/AdminClassNote', buttonText: 'Class Notes' },
    { screenName: '/AdminReportComments', buttonText: 'Report Card Comments' },
    { screenName: '/AdminAssemblyTopics', buttonText: 'Assembly Topic Ideas' },
    { screenName: '/AdminSchoolActivities', buttonText: 'School Activities' },
    { screenName: '/AdminWorkBook', buttonText: 'Upload Workbooks' },
    { screenName: '/AdminSheetTemplates', buttonText: 'Report Sheet Templates' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.outerContainer}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Resources</Text>
          <View style={styles.buttonContainer}>
            {screenDestinations.map((destination, index) => (
              <TouchableOpacity
                key={index}
                style={styles.button}
                onPress={() => router.push(destination.screenName)} // Use router.push for navigation
              >
                <View style={styles.buttonContent}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons name="folder" size={20} color="#EE4B2B" />
                  </View>
                  <Text style={styles.buttonText}>{destination.buttonText}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="black" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: 'white',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'blue',
    borderRadius: 10,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    alignSelf: 'stretch',
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 5,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    marginRight: 10,
  },
  iconContainer: {
    backgroundColor: 'lightgray',
    padding: 5,
    borderRadius: 5,
    marginRight: 10,
  },
});

export default Resource;
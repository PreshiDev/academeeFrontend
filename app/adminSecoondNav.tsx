import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router'; // Import router from expo-router

const { width } = Dimensions.get('window');

const SecondaryBottomNavigation = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => router.push('/admin')}
      >
        <MaterialIcons
          name="home"
          size={24}
          color={activeTab === 'Home' ? styles.activeColor.color : styles.inactiveColor.color}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'Home' ? styles.activeColor : styles.inactiveColor,
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => router.push('/create-resources')}
      >
        <MaterialIcons
          name="library-books"
          size={24}
          color={activeTab === 'Resources' ? styles.activeColor.color : styles.inactiveColor.color}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'Resources' ? styles.activeColor : styles.inactiveColor,
          ]}
        >
          Resources
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => router.push('/news')}
      >
       <MaterialIcons
          name="article" // Use article icon for News
          size={24}
          color={activeTab === 'News' ? styles.activeColor.color : styles.inactiveColor.color}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'News' ? styles.activeColor : styles.inactiveColor,
          ]}
        >
          News
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => {
          setActiveTab('Announcements'); // Update active tab
          router.push('/profile');
        }}
      >
        <MaterialIcons
          name="announcement" // Use announcement icon for Announcements
          size={24}
          color={activeTab === 'Announcements' ? styles.activeColor.color : styles.inactiveColor.color}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'Announcements' ? styles.activeColor : styles.inactiveColor,
          ]}
        >
          Announcements
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#0000FF',
    height: 70,
    width: width,
    position: 'absolute',
    bottom: 0,
  },
  tabButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
  },
  activeColor: {
    color: '#EE4B2B',
  },
  inactiveColor: {
    color: '#CDCDE0',
  },
});

export default SecondaryBottomNavigation;
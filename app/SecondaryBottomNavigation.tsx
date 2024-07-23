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
        onPress={() => router.push('/home')}
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
        onPress={() => router.push('/resource')}
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
        onPress={() => router.push('/training')}
      >
        <MaterialIcons
          name="school"
          size={24}
          color={activeTab === 'Training' ? styles.activeColor.color : styles.inactiveColor.color}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'Training' ? styles.activeColor : styles.inactiveColor,
          ]}
        >
          Training
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => router.push('/forum')}
      >
        <MaterialIcons
          name="forum"
          size={24}
          color={activeTab === 'Forum' ? styles.activeColor.color : styles.inactiveColor.color}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'Forum' ? styles.activeColor : styles.inactiveColor,
          ]}
        >
          Forum
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
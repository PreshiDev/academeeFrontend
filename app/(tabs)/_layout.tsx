// Import necessary components from React Native and expo-router
import { Image, Text, View, StatusBar } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
// Import icons and other constants
import { icons } from '../../constants';

// Define TabIcon component
const TabIcon = ({ icon, color, texted, focused }) => {
  return (
    <View className="flex items-center justify-center gap-2">
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className="w-4 h-4"
      />
      <Text
        className={`${focused ? 'font-psemibold' : 'font-pregular'} text-xs`}
        style={{ color: color }}
      >
        {texted}
      </Text>
    </View>
  );
};

// Define MaterialTabIcon component
const MaterialTabIcon = ({ iconName, color, texted, focused }) => {
  return (
    <View className="flex items-center justify-center gap-2">
      <MaterialIcons name={iconName} size={20} color={color} />
      <Text
        className={`${focused ? 'font-psemibold' : 'font-pregular'} text-xs`}
        style={{ color: color }}
      >
        {texted}
      </Text>
    </View>
  );
};

// Define screens for the tab navigation
const TabLayout = () => {
  return (
    <>
      <StatusBar backgroundColor="#D3D3D3" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#EE4B2B',
          tabBarInactiveTintColor: '#CDCDE0',
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: '#0818A8',
            borderTopWidth: 1,
            borderTopColor: '#232533',
            height: 70,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.home}
                color={color}
                texted="Home"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="resource"
          options={{
            title: 'Resources',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <MaterialTabIcon
                iconName="library-books"
                color={color}
                texted="Resources"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="training"
          options={{
            title: 'Training',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <MaterialTabIcon
                iconName="school"
                color={color}
                texted="Training"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="forum"
          options={{
            title: 'Forum',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <MaterialTabIcon
                iconName="forum"
                color={color}
                texted="Forum"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabLayout;
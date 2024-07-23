import { StatusBar } from "expo-status-bar";
import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

import { icons } from "../../constants";

const AdminIcon = ({ icon, color, name, focused }) => {
  return (
    <View style={styles.iconContainer}>
      <Image
        source={icon}
        resizeMode="contain"
        style={{ ...styles.icon, tintColor: color }}
      />
      <Text
        style={{
          ...styles.iconText,
          color: color,
          fontWeight: focused ? "bold" : "normal",
        }}
      >
        {name}
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

const AdminLayout = () => {
  return (
    <>
      <StatusBar backgroundColor="#D3D3D3" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#EE4B2B",
          tabBarInactiveTintColor: "#CDCDE0",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#0818A8",
            borderTopWidth: 1,
            borderTopColor: "#232533",
            height: 70,
          },
        }}
      >
        <Tabs.Screen
          name="admin"
          options={{
            title: "Admin",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <AdminIcon
                icon={icons.home}
                color={color}
                name="Home"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create-resources"
          options={{
            title: "create-resources",
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
          name="news"
          options={{
            title: "News",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <MaterialTabIcon
                iconName="article"
                color={color}
                texted="News"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Announcements",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <MaterialTabIcon
                iconName="announcement"
                color={color}
                texted="Announcements"
                focused={focused}
              />
            ),
          }}
        />
        
      </Tabs>
    </>
  );
};

const styles = {
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  icon: {
    width: 16,
    height: 16,
  },
  iconText: {
    fontSize: 10,
  },
};

export default AdminLayout;
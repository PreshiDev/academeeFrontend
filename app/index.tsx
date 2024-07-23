import React, { useEffect, useState } from 'react';
import { StatusBar } from "expo-status-bar";
import { Redirect, router } from "expo-router"; // Assuming you're using expo-router
// Alternatively, import your navigation library (e.g., react-navigation)
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import academeeTwo from "../assets/images/academeeTwo.png";
import educatorsImage from "../assets/images/Ebook.jpeg";
import { images } from "../constants";

const SplashScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      {/* Replace with your desired splash screen content */}
      <Image source={academeeTwo} style={{ width: 130, height: 84 }} resizeMode="contain" />
      <Text style={{ fontSize: 30, fontWeight: 'bold' }}>Academee</Text>
    </SafeAreaView>
  );
};

const Welcome = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 2500); // Adjust for 2.5 seconds

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      {isVisible && <SplashScreen />}
      <SafeAreaView className="bg-white h-full">
        <ScrollView
          contentContainerStyle={{
            height: "100%",
          }}
        >
          <View className="w-full flex justify-center items-center h-full px-4">
            <Image
              source={academeeTwo}
              className="w-[130px] h-[84px]"
              resizeMode="contain"
            />

            <Image
              source={educatorsImage}
              className="max-w-[380px] w-full h-[298px]"
              resizeMode="contain"
            />

            <View className="relative mt-5">
              <Text className="text-3xl text-blue-900 font-bold text-center">
                Discover Endless{"\n"}
                Possibilities with{" "}
                <Text className="text-secondary-200">Academee</Text>
              </Text>

              <Image
                source={images.path}
                className="w-[136px] h-[15px] absolute -bottom-2 -right-8"
                resizeMode="contain"
              />
            </View>

            <Text className="text-sm font-pregular text-blue-800 mt-7 text-center">
              Where Creativity Meets Innovation: Embark on a Journey of Limitless
              Exploration with Academee
            </Text>

            {/* Custom Button */}
            <TouchableOpacity
              onPress={() => {
                // Redirect to sign-in screen using expo-router
                router.push('/sign-in'); // Replace '/sign-in' with your actual sign-in route

                // Alternatively, handle redirection using your navigation library
                // (Example for react-navigation)
                // navigation.navigate('SignIn');
              }}
              style={{
                backgroundColor: '#00008B', // Customize button color
                padding: 15,
                borderRadius: 5,
                marginTop: 20,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                Get Started
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <StatusBar backgroundColor="#ffffff" style="light" />
      </SafeAreaView>
    </>
  );
};

export default Welcome;
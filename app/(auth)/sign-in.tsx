// SignIn.js

import React, { useState, useEffect } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import academeeTwo from "../../assets/images/academeeTwo.png";
import { CustomButton, FormField } from "../../components";
import api, { getCsrfToken, initializeCsrfToken, parseJwtClaims } from "./api/api";

const SignIn = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        // Initialize CSRF token
        await initializeCsrfToken();

        // Fetch CSRF token from AsyncStorage
        const token = await getCsrfToken();
        console.log("Fetched CSRF Token:", token);
        setCsrfToken(token);
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    };
    fetchCsrfToken();
  }, []);

  const submit = async () => {
    if (!csrfToken) {
      Alert.alert("Error", "CSRF token not available. Please try again.");
      return;
    }

    if (form.username === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/token/', form, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
      });

      const authToken = response.data

      let claim = parseJwtClaims(authToken.access)._j
      console.log("claims", claim)

      console.log("AUTH", authToken)

      const data = response.data;
      const token = authToken;
      const isActive = claim.is_active;
      const isAdmin = claim.is_staff || claim.is_superuser;

      // Store the token in AsyncStorage
      await AsyncStorage.setItem('accessToken', authToken.access);
      await AsyncStorage.setItem('refreshToken', authToken.refresh);
      console.log('Token stored in AsyncStorage:', token); // Debugging log

      Alert.alert("Success", "User signed in successfully");

      if (isAdmin) {
        router.replace("/admin");
      } else {
        router.replace("/home");
      }
    } catch (e) {
      if (e.response && e.response.data) {
        console.log("Server response error data:", e.response.data);
        Alert.alert("Error", JSON.stringify(e.response.data));
      } else {
        Alert.alert("Error", e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView>
        <View
          className="w-full flex justify-center h-full px-4 my-6"
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          <Image
            source={academeeTwo}
            resizeMode="contain"
            className="w-80"
          />

          <Text className="text-3xl font-semibold text-center text-blue-900 mt-10 font-psemibold">
            Sign In
          </Text>

          <FormField
            title="username"
            value={form.username}
            placeholder="username"
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles="mt-0.5"
          />

          <FormField
            title="Password"
            value={form.password}
            placeholder="password"
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-0.5"
          />

          <CustomButton
            title={isLoading ? "Loading..." : "Sign In"}
            handlePress={submit}
            containerStyles="mt-6"
            disabled={isLoading}
          />

          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-black font-pregular">
              Don't have an account?
            </Text>
            <Link
              href="/sign-up"
              className="text-lg font-psemibold text-[#0818A8]"
            >
              Signup
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;

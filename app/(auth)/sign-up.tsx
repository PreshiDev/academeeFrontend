import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { SafeAreaView, ScrollView, View, Image, Alert, Dimensions } from 'react-native';  // Ensure Image is imported from 'react-native'
import { Link } from 'expo-router';
import { Text, TextInput, Button, Surface, Title, Paragraph, HelperText } from 'react-native-paper';
import academeeTwo from '../../assets/images/academeeTwo.png';
import api from './api/api';
import { HttpStatusCode } from 'axios';

interface SignUpFormData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

const SignUp = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<SignUpFormData>();
  const [isSubmitting, setSubmitting] = useState(false);

  const onSubmit = async (data: SignUpFormData) => {
    setSubmitting(true);

    try {
      const response = await api.post('register/', data);

      if (response.status === HttpStatusCode.Created) {
        const responseData = response.data;
        console.log("Registration successful:", responseData);
        Alert.alert("Success", "Registration successful!");
      } else {
        Alert.alert("Error", "Registration failed. Please check your details.");
      }
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      Alert.alert("Error", error.response?.data?.message || "Registration failed. Please check your details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: '#f5f5f5' }}>
        <Surface style={{ padding: 16, margin: 16, borderRadius: 8, elevation: 4, backgroundColor: '#f5f5f5' }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Image source={academeeTwo} resizeMode="contain" style={{ width: 150, height: 150 }} />
          </View>
          <Title style={{ textAlign: 'center', color: '#3F00FF' }}>Sign Up to Academee</Title>

          <View style={{ marginVertical: 10 }}>
            <Controller
              control={control}
              name="username"
              rules={{ required: "Username is required", maxLength: 30 }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Username"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  mode="outlined"
                  error={!!errors.username}
                />
              )}
            />
            {errors.username && <HelperText type="error">{errors.username.message}</HelperText>}
          </View>

          <View style={{ marginVertical: 10 }}>
            <Controller
              control={control}
              name="first_name"
              rules={{ required: "First name is required", maxLength: 30 }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="First Name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  mode="outlined"
                  error={!!errors.first_name}
                />
              )}
            />
            {errors.first_name && <HelperText type="error">{errors.first_name.message}</HelperText>}
          </View>

          <View style={{ marginVertical: 10 }}>
            <Controller
              control={control}
              name="last_name"
              rules={{ required: "Last name is required", maxLength: 30 }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Last Name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  mode="outlined"
                  error={!!errors.last_name}
                />
              )}
            />
            {errors.last_name && <HelperText type="error">{errors.last_name.message}</HelperText>}
          </View>

          <View style={{ marginVertical: 10 }}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email format"
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  mode="outlined"
                  error={!!errors.email}
                  keyboardType="email-address"
                />
              )}
            />
            {errors.email && <HelperText type="error">{errors.email.message}</HelperText>}
          </View>

          <View style={{ marginVertical: 10 }}>
            <Controller
              control={control}
              name="password"
              rules={{
                required: "Password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters" }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  mode="outlined"
                  error={!!errors.password}
                  secureTextEntry
                />
              )}
            />
            {errors.password && <HelperText type="error">{errors.password.message}</HelperText>}
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={{ marginTop: 20 }}
          >
            {isSubmitting ? 'Loading...' : 'Sign Up'}
          </Button>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
            <Paragraph style={{ color: '#757575' }}>Already have an account?</Paragraph>
            <Link href="/sign-in" style={{ marginLeft: 5 }}>
              <Paragraph style={{ color: '#3F00FF', fontWeight: 'bold' }}>Sign In</Paragraph>
            </Link>
          </View>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;

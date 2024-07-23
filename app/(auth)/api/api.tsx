// api.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_IP_ADDRESS = 'academee.pythonanywhere.com';

const api = axios.create({
  baseURL: `https://${LOCAL_IP_ADDRESS}/api/`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to attach JWT token to authenticated requests
api.interceptors.request.use(async (config) => {
  console.log(`Request made to: ${config.url}`);
  
  // List of authenticated endpoints
  const authEndpoints = ['/schemework/', '/lessonnote/', '/examquestion/', '/examtimetable/', '/classnote/', '/reportcomment/', '/assemblytopic/', '/schoolactivities/', '/workbook/', '/reportsheet/', '/user/profile/', '/user/update/', '/chat/', '/subscribe/', '/notifications/', '/create/', '/notifications/reset-count/', '/calendars/', '/lessonchoices/', '/questionchoices/', '/announcements/create/', '/get-counts/'];

  if (authEndpoints.some(endpoint => config.url.includes(endpoint))) {
    // Retrieve token for authenticated requests
    let token = await AsyncStorage.getItem('accessToken');
    console.log('Token retrieved from AsyncStorage:', token);
    
    if (token) {
      const tokenExpiry = parseJwt(token).exp;
      // const tokenExpiry = await AsyncStorage.getItem('accessTokenExpiry');
      const now = Math.floor(Date.now() / 1000);

      if (tokenExpiry && now >= parseInt(tokenExpiry, 10)) {
        console.log('Token expired, refreshing token...');
        const newToken = await refreshAuthToken();
        token = newToken ? newToken.access : null;
      }

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.error('No valid token found, unable to authenticate request.');
        return Promise.reject(new Error('No valid token found.'));
      }
    } else {
      console.error('No token found, unable to authenticate request.');
      return Promise.reject(new Error('No token found.'));
    }
  }
  return config;
}, error => {
  console.error('Error in request interceptor:', error);
  return Promise.reject(error);
});

export const getCsrfToken = async () => {
  const response = await api.get('/csrf-token/');
  await AsyncStorage.setItem('csrfToken', response.data.csrfToken);
  return response.data.csrfToken;
};

export const getAuthToken = async (username, password) => {
  const response = await api.post('/token/', { username, password });
  const { access, refresh } = response.data;
  
  await AsyncStorage.setItem('accessToken', access);
  await AsyncStorage.setItem('refreshToken', refresh);

  const tokenExpiry = parseJwt(access).exp;
  await AsyncStorage.setItem('accessTokenExpiry', tokenExpiry.toString());

  console.log('Tokens saved to AsyncStorage:', { access, refresh, tokenExpiry });

  return response.data;
};

const refreshAuthToken = async () => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  if (!refreshToken) {
      console.error('No refresh token found.');
      return null;
  }

  try {
      const response = await api.post('/token/refresh/', { refresh: refreshToken });
      const { access, refresh } = response.data;
      await AsyncStorage.setItem('accessToken', access);
      await AsyncStorage.setItem('refreshToken', refresh);

      const tokenExpiry = parseJwt(access).exp;
      await AsyncStorage.setItem('accessTokenExpiry', tokenExpiry.toString());

      console.log('Token refreshed and saved to AsyncStorage:', access);

      return response.data;
  } catch (error) {
      console.error('Error refreshing auth token:', error);
      return null;
  }
};

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
};

export const initializeCsrfToken = async () => {
  const csrfToken = await getCsrfToken();
  await AsyncStorage.setItem('csrfToken', csrfToken);
};

export const parseJwtClaims = async (token) => {
  return parseJwt(token)
};


export default api;
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { setCustomText } from 'react-native-global-props';
import { View, Text } from 'react-native';

import HomeScreen from './app/HomeScreen';
import LoginScreen from './app/LoginScreen';
import RegisterScreen from './app/RegisterScreen';
import ReadScreen from './app/ReadScreen'
import ListenScreen from './app/ListenScreen'

SplashScreen.preventAutoHideAsync();
const Stack = createStackNavigator();

export default function App() {
  // Load custom font
  const [loaded, error] = useFonts({
    KanitMedium: require("./assets/fonts/Kanit-Medium.ttf"),

  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const [initialRoute, setInitialRoute] = useState(null); // initially set to null for loading
  const auth = getAuth();

  useEffect(() => {
    if (loaded) {
      // Hide splash screen once fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    // Check Firebase authentication state to determine initial route
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setInitialRoute(user ? 'HomeScreen' : 'LoginScreen');
    });
    return unsubscribe; // Cleanup auth listener on component unmount
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ReadScreen" component={ReadScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ListenScreen" component={ListenScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

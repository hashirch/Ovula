import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

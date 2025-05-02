// src/screens/LoadingScreen.js
import React from 'react';
import { 
  View, 
  ActivityIndicator, 
  StyleSheet,
  Text,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <Image 
        source={require('../../assets/icon.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Location Reminder</Text>
      <ActivityIndicator size="large" color="#0066CC" style={styles.spinner} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 30,
  },
  spinner: {
    marginTop: 20,
  },
});
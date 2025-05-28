import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OfflineScreen() {
  const [checking, setChecking] = useState(false);


  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/offline.jpg')}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>Ooops!!</Text>
      <Text style={styles.subtitle}>Internet connection not found</Text>
      <Text style={styles.subtitle}>Check your connection and try again</Text>

      <TouchableOpacity style={styles.button}  disabled={checking}>
        {checking ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Try Again</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#26897C',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

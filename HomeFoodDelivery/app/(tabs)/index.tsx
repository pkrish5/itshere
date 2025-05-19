import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Home Food Delivery</Text>
      <Text style={styles.subheader}>Choose your role:</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/views/SenderView')}>
        <Text style={styles.buttonText}>Sender (Parent)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/views/DriverView')}>
        <Text style={styles.buttonText}>Driver</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/views/ReceiverView')}>
        <Text style={styles.buttonText}>Receiver (Student)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F7F7' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  subheader: { fontSize: 18, marginBottom: 24 },
  button: { backgroundColor: '#4ECDC4', padding: 16, borderRadius: 8, marginBottom: 16, width: 220, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

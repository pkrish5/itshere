import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function DriverPickups() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Pickups</Text>
      <Text>List of available/assigned pickups will go here.</Text>
      <Button title="Accept All & Start Ride" onPress={() => router.push('/(views)/driver/active-ride')} />
    </View>
  );
} 
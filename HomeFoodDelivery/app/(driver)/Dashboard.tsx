import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function DriverDashboard() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Driver Dashboard</Text>
      <Button title="Set Availability" onPress={() => router.push('/(driver)/SetAvailability')} />
      <View style={{ height: 16 }} />
      <Button title="Accept Ride" onPress={() => router.push('/(driver)/AcceptRide')} />
      <View style={{ height: 16 }} />
      <Button title="Navigation" onPress={() => router.push('/(driver)/Navigation')} />
    </View>
  );
} 
import React from 'react';
import DriverAvailabilityView from '../(views)/DriverAvailabilityView';
import { useRouter } from 'expo-router';
import { View, Button } from 'react-native';

export default function SetAvailabilityScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <DriverAvailabilityView />
      <Button title="Go to Accept Ride" onPress={() => router.push('/(driver)/AcceptRide')} />
    </View>
  );
} 
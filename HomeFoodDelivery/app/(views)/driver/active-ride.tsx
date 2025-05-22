import React from 'react';
import { View, Text, Button, Linking } from 'react-native';

export default function DriverActiveRide() {
  // Example stop data
  const stops = [
    { name: 'Pickup 1', address: '123 Main St, City', instructions: 'Call on arrival', lat: 37.7749, lng: -122.4194 },
    { name: 'Dropoff 1', address: '456 Oak Ave, City', instructions: 'Leave at door', lat: 37.7849, lng: -122.4094 },
  ];

  const openInMaps = (lat: number, lng: number, label: string) => {
    const url = Platform.select({
      ios: `maps://app?daddr=${lat},${lng}(${encodeURIComponent(label)})`,
      android: `geo:0,0?q=${lat},${lng}(${encodeURIComponent(label)})`,
    });
    Linking.openURL(url!);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Active Ride</Text>
      {stops.map((stop, idx) => (
        <View key={idx} style={{ marginBottom: 20, alignItems: 'center' }}>
          <Text style={{ fontWeight: 'bold' }}>{stop.name}</Text>
          <Text>{stop.address}</Text>
          <Text>Instructions: {stop.instructions}</Text>
          <Button title="Open in Maps" onPress={() => openInMaps(stop.lat, stop.lng, stop.name)} />
        </View>
      ))}
      <Button title="Mark Stop Complete" onPress={() => {}} />
    </View>
  );
} 
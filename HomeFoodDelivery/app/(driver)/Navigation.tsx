import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { storageService, DeliveryRequest } from '../../src/services/StorageService';

function getLatLng(obj: any) {
  if (typeof obj === 'object' && obj.latitude && obj.longitude) {
    return { latitude: obj.latitude, longitude: obj.longitude };
  }
  return null;
}

export default function NavigationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStop, setCurrentStop] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const allRequests = await storageService.getDeliveryRequests();
        const myDeliveries = allRequests.filter(r => r.driverId === user.id && (r.status === 'accepted' || r.status === 'in_progress'));
        setDeliveries(myDeliveries);
      } catch (e) {
        Alert.alert('Error', 'Failed to load deliveries');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Build stops: pickups first, then dropoffs
  const stops = deliveries.flatMap(d => [
    { type: 'pickup', ...getLatLng(d.pickupLocation), label: 'Pickup', delivery: d },
    { type: 'dropoff', ...getLatLng(d.dropoffLocation), label: 'Dropoff', delivery: d },
  ]).filter(s => s.latitude && s.longitude);

  const handleOpenMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  const handleCompleteStop = () => {
    if (currentStop < stops.length - 1) {
      setCurrentStop(currentStop + 1);
    } else {
      Alert.alert('Route Complete', 'You have completed all stops!');
      router.push('/(driver)/SetAvailability');
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007AFF" />;
  }

  if (stops.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No stops to navigate.</Text>
        <Button title="Back to Set Availability" onPress={() => router.push('/(driver)/SetAvailability')} />
      </View>
    );
  }

  const routeCoords = stops.map(s => ({ latitude: s.latitude, longitude: s.longitude }));
  const activeStop = stops[currentStop];

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: activeStop.latitude,
          longitude: activeStop.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {stops.map((stop, idx) => (
          <Marker
            key={idx}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            title={`${stop.label} #${Math.floor(idx / 2) + 1}`}
            pinColor={idx === currentStop ? '#007AFF' : stop.type === 'pickup' ? 'green' : 'red'}
          />
        ))}
        <Polyline coordinates={routeCoords} strokeColor="#007AFF" strokeWidth={4} />
      </MapView>
      <View style={{ padding: 16, backgroundColor: '#fff' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{activeStop.label} Stop</Text>
        <Text>Delivery: {activeStop.delivery.id}</Text>
        <Text>Location: {activeStop.latitude}, {activeStop.longitude}</Text>
        <TouchableOpacity
          style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8, marginTop: 10, alignItems: 'center' }}
          onPress={() => handleOpenMaps(activeStop.latitude, activeStop.longitude)}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Open in Maps</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: '#4ECDC4', padding: 12, borderRadius: 8, marginTop: 10, alignItems: 'center' }}
          onPress={handleCompleteStop}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>{currentStop < stops.length - 1 ? 'Next Stop' : 'Finish Route'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 
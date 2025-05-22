import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { storageService, DeliveryRequest, DriverAvailability } from '../../src/services/StorageService';

function getDistanceMiles(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const aVal = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return R * c;
}

export default function AcceptRideScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [driverAvailability, setDriverAvailability] = useState<DriverAvailability | null>(null);
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get latest driver availability for this user
        const allAvail = await storageService.getDriverAvailabilities();
        const myAvail = allAvail.filter(a => a.driverId === user.id).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())[0];
        setDriverAvailability(myAvail || null);
        // Get all pending delivery requests
        const allRequests = await storageService.getDeliveryRequests();
        // Filter for pending
        const pending = allRequests.filter(r => r.status === 'pending');
        setRequests(pending);
      } catch (e) {
        Alert.alert('Error', 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Matching logic
  const getMatches = () => {
    if (!driverAvailability) return [];
    return requests.filter(req => {
      // Only match if both pickupLocation and dropoffLocation are coordinates
      if (
        typeof req.pickupLocation === 'object' &&
        typeof driverAvailability.startLocation === 'object' &&
        typeof req.dropoffLocation === 'object' &&
        typeof driverAvailability.destination === 'object'
      ) {
        // Pickup within radius
        const pickupDist = getDistanceMiles(driverAvailability.startLocation, req.pickupLocation);
        const withinRadius = pickupDist <= driverAvailability.radius;
        // Dropoff near destination (within 2 miles for now)
        const dropoffDist = getDistanceMiles(driverAvailability.destination, req.dropoffLocation);
        const dropoffMatch = dropoffDist <= 2;
        // Date (same day)
        const reqDate = new Date(req.desiredDateTime);
        const availDate = new Date(driverAvailability.dateTime);
        const sameDay = reqDate.toDateString() === availDate.toDateString();
        return withinRadius && dropoffMatch && sameDay;
      }
      return false;
    });
  };

  const handleAccept = async (requestId: string) => {
    setAcceptingId(requestId);
    try {
      await storageService.updateDeliveryRequest(requestId, {
        status: 'accepted',
        driverId: user?.id,
      });
      Alert.alert('Success', 'You have accepted the ride!');
      router.push('/(driver)/Navigation');
    } catch (e) {
      Alert.alert('Error', 'Failed to accept ride');
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007AFF" />;
  }

  const matches = getMatches();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Matching Delivery Requests</Text>
      {matches.length === 0 ? (
        <Text>No matching requests found for your availability.</Text>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, elevation: 2 }}>
              <Text style={{ fontWeight: 'bold' }}>Pickup: {typeof item.pickupLocation === 'object' ? `${item.pickupLocation.latitude}, ${item.pickupLocation.longitude}` : item.pickupLocation}</Text>
              <Text>Dropoff: {typeof item.dropoffLocation === 'object' ? `${item.dropoffLocation.latitude}, ${item.dropoffLocation.longitude}` : item.dropoffLocation}</Text>
              <Text>Date/Time: {new Date(item.desiredDateTime).toLocaleString()}</Text>
              <TouchableOpacity
                style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8, marginTop: 10, alignItems: 'center' }}
                onPress={() => handleAccept(item.id)}
                disabled={acceptingId === item.id}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{acceptingId === item.id ? 'Accepting...' : 'Accept Ride'}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
} 
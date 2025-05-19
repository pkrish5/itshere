import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const initialStops = [
  {
    id: '1',
    address: '123 Home St, San Francisco',
    type: 'pickup',
    instructions: 'Food is in a cooler on the porch',
    coordinates: { latitude: 37.7749, longitude: -122.4194 },
    leaveOutTime: '12:00 PM',
    status: 'pending',
  },
  {
    id: '2',
    address: 'Main Campus Center, 123 Campus Center Dr',
    type: 'dropoff',
    coordinates: { latitude: 37.8719, longitude: -122.2585 },
    status: 'pending',
    studentName: 'John Doe',
  },
  {
    id: '3',
    address: '456 Home Ave, Oakland',
    type: 'pickup',
    instructions: 'Food is in a thermal bag by the door',
    coordinates: { latitude: 37.8044, longitude: -122.2712 },
    leaveOutTime: '12:30 PM',
    status: 'pending',
  },
  {
    id: '4',
    address: 'Student Union, 789 Union Ave',
    type: 'dropoff',
    coordinates: { latitude: 37.8715, longitude: -122.2600 },
    status: 'pending',
    studentName: 'Jane Smith',
  },
];

export default function DriverView() {
  const [stops, setStops] = useState(initialStops);
  const [currentStop, setCurrentStop] = useState(0);

  const handleStopComplete = (stopId) => {
    setStops(prev => prev.map(stop =>
      stop.id === stopId ? { ...stop, status: 'completed' } : stop
    ));
    setCurrentStop(prev => prev + 1);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Driver Dashboard</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.8,
          longitude: -122.3,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }}
      >
        {stops.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={stop.coordinates}
            title={stop.type === 'pickup' ? 'Pickup' : 'Dropoff'}
            description={stop.address}
            pinColor={stop.type === 'pickup' ? 'red' : 'green'}
          />
        ))}
      </MapView>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delivery Stops</Text>
        <FlatList
          data={stops}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.stopItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {item.type === 'pickup' ? (
                  <MaterialIcons name="location-on" size={20} color="red" />
                ) : (
                  <FontAwesome5 name="school" size={20} color="green" />
                )}
                <Text style={styles.stopType}>{item.type === 'pickup' ? 'Pickup' : 'Dropoff'}</Text>
                {item.status === 'completed' && (
                  <MaterialCommunityIcons name="check-circle" size={18} color="green" style={{ marginLeft: 4 }} />
                )}
                {index === currentStop && (
                  <Text style={styles.currentStop}>Current Stop</Text>
                )}
              </View>
              <Text style={styles.stopAddress}>{item.address}</Text>
              {item.type === 'pickup' && item.leaveOutTime && (
                <Text style={styles.stopDetail}>Leave out by: {item.leaveOutTime}</Text>
              )}
              {item.type === 'dropoff' && item.studentName && (
                <Text style={styles.stopDetail}>Student: {item.studentName}</Text>
              )}
              {item.instructions && (
                <Text style={styles.stopDetail}>Instructions: {item.instructions}</Text>
              )}
              {index === currentStop && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => handleStopComplete(item.id)}
                >
                  <Text style={{ color: '#fff', textAlign: 'center' }}>
                    Mark {item.type === 'pickup' ? 'Pickup' : 'Dropoff'} Complete
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: { fontSize: 24, fontWeight: 'bold', margin: 16 },
  map: { width: '100%', height: 250, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, margin: 16, elevation: 2 },
  cardTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  stopItem: { marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 },
  stopType: { fontWeight: 'bold', marginLeft: 8 },
  stopAddress: { color: '#333', marginTop: 4 },
  stopDetail: { color: '#666', fontSize: 12, marginTop: 2 },
  currentStop: { backgroundColor: '#4ECDC4', color: '#fff', borderRadius: 6, paddingHorizontal: 8, marginLeft: 8, fontSize: 12 },
  completeButton: { backgroundColor: '#FF6B6B', borderRadius: 6, padding: 8, marginTop: 8 },
}); 
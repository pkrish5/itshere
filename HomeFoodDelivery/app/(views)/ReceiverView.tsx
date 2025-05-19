import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, ScrollView, TouchableOpacity, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const initialDelivery = {
  status: 'in-transit',
  pickupAddress: '123 Home St, San Francisco',
  dropoffLocation: 'Main Campus Center',
  instructions: 'Food is in a cooler on the porch',
  estimatedTime: '15 minutes',
  driverLocation: { latitude: 37.7749, longitude: -122.4194 },
  foodItems: ["Mom's Special Biryani", 'Chicken Curry', 'Naan Bread', 'Gulab Jamun'],
  senderName: 'Mom',
  leaveOutTime: '12:00 PM',
  pickupInstructions: 'Pick up from the designated food pickup area in the Main Campus Center',
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return '#aaa';
    case 'picked-up': return '#4ECDC4';
    case 'in-transit': return '#FFB300';
    case 'delivered': return '#4CAF50';
    default: return '#aaa';
  }
};

const getStatusMessage = (status) => {
  switch (status) {
    case 'pending': return 'Your food is being prepared';
    case 'picked-up': return 'Your food has been picked up and is on its way';
    case 'in-transit': return 'Your food is on its way to campus';
    case 'delivered': return 'Your food has been delivered to the pickup location';
    default: return '';
  }
};

export default function ReceiverView() {
  const [delivery] = useState(initialDelivery);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Your Food is on the Way!</Text>
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <Text style={styles.cardTitle}>Delivery Status</Text>
          <View style={[styles.statusChip, { backgroundColor: getStatusColor(delivery.status) }] }>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{delivery.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.statusMsg}>{getStatusMessage(delivery.status)}</Text>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 37.8719,
            longitude: -122.2585,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          }}
        >
          {delivery.driverLocation && (
            <Marker
              coordinate={delivery.driverLocation}
              title="Driver Location"
              pinColor="#2196F3"
            />
          )}
          <Marker
            coordinate={{ latitude: 37.8719, longitude: -122.2585 }}
            title="Pickup Spot"
            pinColor="green"
          />
        </MapView>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Food Items from {delivery.senderName}</Text>
        <FlatList
          data={delivery.foodItems}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <View style={styles.foodItemRow}>
              <MaterialCommunityIcons name="food" size={20} color="#FF6B6B" />
              <Text style={{ marginLeft: 8 }}>{item}</Text>
            </View>
          )}
        />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pickup Information</Text>
        <View style={styles.infoRow}>
          <FontAwesome5 name="school" size={20} color="#4ECDC4" />
          <Text style={{ marginLeft: 8, fontWeight: 'bold' }}>Pickup Location:</Text>
          <Text style={{ marginLeft: 4 }}>{delivery.dropoffLocation}</Text>
        </View>
        {delivery.pickupInstructions && (
          <Text style={{ color: '#666', marginTop: 4 }}>{delivery.pickupInstructions}</Text>
        )}
        <View style={styles.infoRow}>
          <MaterialIcons name="access-time" size={20} color="#4ECDC4" />
          <Text style={{ marginLeft: 8 }}>Estimated Arrival: {delivery.estimatedTime}</Text>
        </View>
        <TouchableOpacity
          style={styles.directionsButton}
          onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery.dropoffLocation)}`)}
        >
          <Ionicons name="navigate" size={20} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 8 }}>Get Directions to Pickup</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notifyButton}>
          <MaterialIcons name="notifications-active" size={20} color="#4ECDC4" />
          <Text style={{ marginLeft: 8, color: '#4ECDC4' }}>Enable Notifications</Text>
        </TouchableOpacity>
        <Text style={{ marginTop: 16, fontWeight: 'bold' }}>Special Instructions:</Text>
        <Text style={{ color: '#666' }}>{delivery.instructions}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: { fontSize: 24, fontWeight: 'bold', margin: 16 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, margin: 16, elevation: 2 },
  cardTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  statusChip: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  statusMsg: { color: '#666', marginBottom: 8 },
  map: { width: '100%', height: 200, marginBottom: 16 },
  foodItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  directionsButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4ECDC4', borderRadius: 6, padding: 10, marginTop: 12, justifyContent: 'center' },
  notifyButton: { flexDirection: 'row', alignItems: 'center', borderColor: '#4ECDC4', borderWidth: 1, borderRadius: 6, padding: 10, marginTop: 12, justifyContent: 'center' },
}); 
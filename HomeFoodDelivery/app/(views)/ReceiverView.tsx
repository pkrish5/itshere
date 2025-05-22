import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { storageService, DeliveryRequest } from '../../src/services/StorageService';
import { locationService } from '../../src/services/LocationService';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function ReceiverView() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRequest | null>(null);

  useEffect(() => {
    loadDeliveries();
    const unsubscribe = storageService.subscribe('deliveryRequests', (data) => {
      setDeliveries(data);
    });
    return () => unsubscribe();
  }, []);

  const loadDeliveries = async () => {
    try {
      const allDeliveries = await storageService.getDeliveryRequests();
      setDeliveries(allDeliveries);
    } catch (error) {
      Alert.alert('Error', 'Failed to load deliveries');
    } finally {
      setLoading(false);
  }
};

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/sign-in');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const renderDeliveryItem = ({ item }: { item: DeliveryRequest }) => (
    <TouchableOpacity
      style={[
        styles.deliveryItem,
        selectedDelivery?.id === item.id && styles.selectedDeliveryItem,
      ]}
      onPress={() => setSelectedDelivery(item)}
    >
      <Text style={styles.deliveryTitle}>
        Delivery #{item.id.slice(-4)}
      </Text>
      <Text style={styles.deliveryStatus}>
        Status: {item.status}
      </Text>
      <Text style={styles.deliveryTime}>
        Requested: {new Date(item.desiredDateTime).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Deliveries</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
          </View>

      <View style={styles.content}>
        <View style={styles.mapContainer}>
        <MapView
            provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
          }}
        >
            {selectedDelivery && (
              <>
            <Marker
                  coordinate={selectedDelivery.pickupLocation}
                  title="Pickup Location"
            pinColor="green"
          />
                <Marker
                  coordinate={selectedDelivery.dropoffLocation}
                  title="Dropoff Location"
                  pinColor="red"
                />
              </>
            )}
        </MapView>
      </View>

        <FlatList
          data={deliveries}
          renderItem={renderDeliveryItem}
          keyExtractor={(item) => item.id}
          style={styles.deliveryList}
          contentContainerStyle={styles.deliveryListContent}
        />
      </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#007AFF',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 300,
    margin: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  deliveryList: {
    flex: 1,
  },
  deliveryListContent: {
    padding: 20,
  },
  deliveryItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedDeliveryItem: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  deliveryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  deliveryStatus: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  deliveryTime: {
    fontSize: 14,
    color: '#999',
  },
}); 
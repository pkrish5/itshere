import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from 'src/firebaseConfig';

interface Delivery {
  id: string;
  status: 'pending' | 'picked-up' | 'in-transit' | 'delivered';
  pickupLocation: {
    latitude: number;
    longitude: number;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
  };
  driverLocation?: {
    latitude: number;
    longitude: number;
  };
  estimatedArrival?: Date;
  driverName?: string;
  driverPhone?: string;
}

export default function TrackingView({ deliveryId }: { deliveryId: string }) {
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'deliveries', deliveryId),
      (doc) => {
        if (doc.exists()) {
          setDelivery(doc.data() as Delivery);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error tracking delivery:', error);
        Alert.alert('Error', 'Failed to track delivery. Please try again.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [deliveryId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  if (!delivery) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Delivery not found</Text>
      </View>
    );
  }

  const getStatusColor = (status: Delivery['status']) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'picked-up':
        return '#4ECDC4';
      case 'in-transit':
        return '#FF6B6B';
      case 'delivered':
        return '#2ECC71';
      default:
        return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: delivery.pickupLocation.latitude,
          longitude: delivery.pickupLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* Pickup Location */}
        <Marker
          coordinate={delivery.pickupLocation}
          title="Pickup Location"
          pinColor="red"
        />

        {/* Dropoff Location */}
        <Marker
          coordinate={delivery.dropoffLocation}
          title="Dropoff Location"
          pinColor="green"
        />

        {/* Driver Location */}
        {delivery.driverLocation && (
          <Marker
            coordinate={delivery.driverLocation}
            title="Driver Location"
            pinColor="#4ECDC4"
          />
        )}
      </MapView>

      <View style={styles.infoContainer}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(delivery.status) },
            ]}
          />
          <Text style={styles.statusText}>
            {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
          </Text>
        </View>

        {delivery.driverName && (
          <View style={styles.driverInfo}>
            <MaterialIcons name="person" size={24} color="#666" />
            <Text style={styles.driverName}>{delivery.driverName}</Text>
          </View>
        )}

        {delivery.estimatedArrival && (
          <View style={styles.etaContainer}>
            <MaterialIcons name="access-time" size={24} color="#666" />
            <Text style={styles.etaText}>
              ETA: {new Date(delivery.estimatedArrival).toLocaleTimeString()}
            </Text>
          </View>
        )}

        {delivery.driverPhone && (
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => {
              Alert.alert('Call Driver', 'Would you like to call the driver?');
            }}
          >
            <MaterialIcons name="phone" size={24} color="#fff" />
            <Text style={styles.contactButtonText}>Contact Driver</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  driverName: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  etaText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#666',
  },
  contactButton: {
    backgroundColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 
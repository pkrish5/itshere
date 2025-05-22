import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from 'src/firebaseConfig';
import {
  startLocationUpdates,
  calculateETA,
  formatDistance,
  formatDuration,
} from 'src/utils/location';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  senderName: string;
  senderPhone: string;
  instructions?: string;
}

const BACKGROUND_LOCATION_TASK = 'background-location-task';

// Register background location task
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }
  if (data) {
    const { locations } = data as any;
    if (locations && locations.length > 0) {
      const location = locations[0];
      try {
        const deliveryId = await AsyncStorage.getItem('activeDeliveryId');
        if (deliveryId) {
          await updateDoc(doc(db, 'deliveries', deliveryId), {
            driverLocation: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
            lastUpdated: new Date(),
          });
        }
      } catch (e) {
        console.error('Error updating Firestore in background:', e);
      }
    }
  }
});

export default function DriverDeliveryView({ deliveryId }: { deliveryId: string }) {
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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
        console.error('Error loading delivery:', error);
        Alert.alert('Error', 'Failed to load delivery details.');
        setLoading(false);
      }
    );

    // Start foreground location updates
    const startUpdates = async () => {
      const subscription = await startLocationUpdates(deliveryId, (error) => {
        Alert.alert('Error', 'Failed to update location. Please check your permissions.');
      });
      // Start background location updates
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus === 'granted') {
        await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: 'Delivery in Progress',
            notificationBody: 'Your location is being used for live tracking.',
          },
        });
      }
      return () => {
        subscription?.remove();
        Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      };
    };
    startUpdates();

    // Save deliveryId for background task
    AsyncStorage.setItem('activeDeliveryId', deliveryId);

    return () => {
      unsubscribe();
      AsyncStorage.removeItem('activeDeliveryId');
    };
  }, [deliveryId]);

  const handleStatusUpdate = async (newStatus: Delivery['status']) => {
    if (!delivery) return;

    try {
      setUpdating(true);
      await updateDoc(doc(db, 'deliveries', deliveryId), {
        status: newStatus,
        lastUpdated: new Date(),
      });

      if (newStatus === 'delivered') {
        Alert.alert('Success', 'Delivery marked as completed!');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update delivery status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleContactSender = () => {
    if (!delivery) return;
    Alert.alert(
      'Contact Sender',
      `Would you like to call ${delivery.senderName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Call',
          onPress: () => {
            // Implement call functionality
            console.log('Calling sender:', delivery.senderPhone);
          },
        },
      ]
    );
  };

  // Add navigation link handler
  const handleNavigate = () => {
    if (!delivery || !delivery.driverLocation) return;
    const start = delivery.driverLocation;
    const end = delivery.dropoffLocation;
    const url = Platform.select({
      ios: `http://maps.apple.com/?saddr=${start.latitude},${start.longitude}&daddr=${end.latitude},${end.longitude}`,
      android: `https://www.google.com/maps/dir/?api=1&origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&travelmode=driving`,
    });
    if (url) Linking.openURL(url);
  };

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

  const getNextStatus = (currentStatus: Delivery['status']): Delivery['status'] | null => {
    switch (currentStatus) {
      case 'pending':
        return 'picked-up';
      case 'picked-up':
        return 'in-transit';
      case 'in-transit':
        return 'delivered';
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus(delivery.status);
  const eta = delivery.driverLocation
    ? calculateETA(delivery.driverLocation, delivery.dropoffLocation)
    : null;

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
        <Marker
          coordinate={delivery.pickupLocation}
          title="Pickup Location"
          pinColor="red"
        />
        <Marker
          coordinate={delivery.dropoffLocation}
          title="Dropoff Location"
          pinColor="green"
        />
        {delivery.driverLocation && (
          <Marker
            coordinate={delivery.driverLocation}
            title="Your Location"
            pinColor="#4ECDC4"
          />
        )}
        {delivery.driverLocation && (
          <Polyline
            coordinates={[
              delivery.driverLocation,
              delivery.dropoffLocation,
            ]}
            strokeColor="#4ECDC4"
            strokeWidth={3}
          />
        )}
      </MapView>

      <View style={styles.infoContainer}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Status: {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
          </Text>
        </View>

        <View style={styles.senderInfo}>
          <MaterialIcons name="person" size={24} color="#666" />
          <Text style={styles.senderName}>{delivery.senderName}</Text>
        </View>

        {eta && (
          <View style={styles.etaContainer}>
            <MaterialIcons name="access-time" size={24} color="#666" />
            <Text style={styles.etaText}>
              ETA: {eta.toLocaleTimeString()}
            </Text>
          </View>
        )}

        {delivery.instructions && (
          <View style={styles.instructionsContainer}>
            <MaterialIcons name="info" size={24} color="#666" />
            <Text style={styles.instructionsText}>{delivery.instructions}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {nextStatus && (
            <TouchableOpacity
              style={[styles.button, styles.updateButton]}
              onPress={() => handleStatusUpdate(nextStatus)}
              disabled={updating}
            >
              <Text style={styles.buttonText}>
                {updating ? 'Updating...' : `Mark as ${nextStatus.replace('-', ' ')}`}
              </Text>
            </TouchableOpacity>
          )}

          {/* Navigation Button */}
          <TouchableOpacity
            style={[styles.button, styles.navigateButton]}
            onPress={handleNavigate}
            disabled={!delivery?.driverLocation}
          >
            <MaterialIcons name="navigation" size={24} color="#fff" />
            <Text style={styles.buttonText}>Navigate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.contactButton]}
            onPress={handleContactSender}
          >
            <MaterialIcons name="phone" size={24} color="#fff" />
            <Text style={styles.buttonText}>Contact Sender</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 16,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  senderName: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  etaText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#666',
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    color: '#666',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  updateButton: {
    backgroundColor: '#4ECDC4',
  },
  contactButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  navigateButton: {
    backgroundColor: '#007AFF',
    marginVertical: 8,
  },
}); 
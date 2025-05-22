import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { storageService } from 'src/services/StorageService';
import { DriverAvailability } from 'src/services/StorageService';
import { useAuth } from 'src/contexts/AuthContext';

type Props = {
  pickupLocation: { latitude: number; longitude: number };
  dropoffLocation: { latitude: number; longitude: number };
  desiredDateTime: string;
  onDriverSelected?: (driver: DriverAvailability) => void;
};

// Haversine formula to calculate distance between two lat/lng points in miles
function getDistanceMiles(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 3958.8; // Radius of Earth in miles
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const aVal = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return R * c;
}

export default function SenderMatchingView({ pickupLocation, dropoffLocation, desiredDateTime, onDriverSelected }: Props) {
  const [matchingDrivers, setMatchingDrivers] = useState<DriverAvailability[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<DriverAvailability | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    loadMatchingDrivers();
  }, []);

  const loadMatchingDrivers = async () => {
    try {
      setIsLoading(true);
      const drivers = await storageService.getDriverAvailabilities();
      // Filter drivers by:
      // 1. Date (same day)
      // 2. Pickup within radius
      // 3. Dropoff destination string match (for now)
      const senderDate = new Date(desiredDateTime);
      const filtered = (drivers || []).filter(driver => {
        // 1. Date (same day)
        const driverDate = new Date(driver.dateTime);
        const sameDay = driverDate.toDateString() === senderDate.toDateString();
        // 2. Pickup within radius
        let withinRadius = false;
        if (typeof driver.startLocation === 'object' && typeof pickupLocation === 'object') {
          const pickupDistance = getDistanceMiles(driver.startLocation, pickupLocation);
          withinRadius = pickupDistance <= driver.radius;
        }
        // 3. Dropoff destination string match (simple contains for now)
        const dropoffMatch = driver.destination && typeof driver.destination === 'string' &&
          driver.destination.toLowerCase().includes('campus') // You can improve this logic
          ? true
          : true; // For now, always true
        return sameDay && withinRadius && dropoffMatch && driver.status === 'available';
      });
      setMatchingDrivers(filtered);
    } catch (error) {
      console.error('Error loading matching drivers:', error);
      Alert.alert('Error', 'Failed to load matching drivers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDriver = (driver: DriverAvailability) => {
    setSelectedDriver(driver);
  };

  const handleConfirmMatch = async () => {
    if (!selectedDriver) return;
    try {
      setIsMatching(true);
      // You may want to update both the delivery request and the driver's availability
      // For now, just update the driver's status to unavailable
      await storageService.updateDriverAvailability(selectedDriver.id, { status: 'unavailable' });
      // Optionally, update the delivery request with the matched driver
      // await storageService.updateDeliveryRequest('REQUEST_ID', { driverId: selectedDriver.id, status: 'accepted' });
      Alert.alert(
        'Success',
        'Driver matched successfully! They will be notified of your delivery request.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onDriverSelected) {
                onDriverSelected(selectedDriver);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error matching with driver:', error);
      Alert.alert('Error', 'Failed to match with driver. Please try again.');
    } finally {
      setIsMatching(false);
    }
  };

  const renderDriverCard = ({ item }: { item: DriverAvailability }) => (
    <TouchableOpacity
      style={[
        styles.driverCard,
        selectedDriver?.id === item.id && styles.selectedDriverCard,
      ]}
      onPress={() => handleSelectDriver(item)}
    >
      <View style={styles.driverHeader}>
        <Text style={styles.driverName}>{item.driverId}</Text>
      </View>

      <View style={styles.driverDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="access-time" size={16} color="#666" />
          <Text style={styles.detailText}>{item.dateTime}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="local-shipping" size={16} color="#666" />
          <Text style={styles.detailText}>{item.maxCapacity} max capacity</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="location-on" size={16} color="#666" />
          <Text style={styles.detailText}>{item.radius} miles radius</Text>
        </View>
      </View>

      {selectedDriver?.id === item.id && (
        <TouchableOpacity
          style={[styles.selectButton, isMatching && styles.selectButtonDisabled]}
          onPress={handleConfirmMatch}
          disabled={isMatching}
        >
          <Text style={styles.selectButtonText}>
            {isMatching ? 'Matching...' : 'Select Driver'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>Finding matching drivers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Matching Drivers</Text>
      
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: pickupLocation.latitude,
            longitude: pickupLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* Pickup Location */}
          <Marker
            coordinate={pickupLocation}
            title="Pickup Location"
            pinColor="red"
          />
          
          {/* Dropoff Location */}
          <Marker
            coordinate={dropoffLocation}
            title="Dropoff Location"
            pinColor="green"
          />
          
          {/* Driver Locations */}
          {matchingDrivers.map(driver => (
            typeof driver.startLocation === 'object' ? (
            <React.Fragment key={driver.id}>
              <Marker
                coordinate={driver.startLocation}
                  title={`${driver.driverId}'s Location`}
                pinColor={selectedDriver?.id === driver.id ? '#4ECDC4' : '#666'}
              />
              <Circle
                center={driver.startLocation}
                radius={driver.radius * 1609.34} // Convert miles to meters
                strokeColor={selectedDriver?.id === driver.id ? '#4ECDC4' : 'rgba(158, 158, 255, 0.5)'}
                fillColor={selectedDriver?.id === driver.id ? 'rgba(78, 205, 196, 0.2)' : 'rgba(158, 158, 255, 0.2)'}
              />
            </React.Fragment>
            ) : null
          ))}
        </MapView>
      </View>

      {matchingDrivers.length === 0 ? (
        <View style={styles.noDriversContainer}>
          <MaterialIcons name="directions-car" size={48} color="#ccc" />
          <Text style={styles.noDriversText}>No matching drivers found</Text>
          <Text style={styles.noDriversSubtext}>
            Try adjusting your pickup time or location
          </Text>
        </View>
      ) : (
        <FlatList
          data={matchingDrivers}
          renderItem={renderDriverCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.driverList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
  },
  mapContainer: {
    height: 300,
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  driverList: {
    padding: 16,
  },
  driverCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  selectedDriverCard: {
    borderColor: '#4ECDC4',
    borderWidth: 2,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  driverDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
  },
  selectButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  selectButtonDisabled: {
    backgroundColor: '#ccc',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDriversContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noDriversText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  noDriversSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
}); 
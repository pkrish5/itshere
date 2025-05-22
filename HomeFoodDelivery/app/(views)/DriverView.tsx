import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch, TextInput, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { storageService, DeliveryRequest, DriverAvailability } from '../../src/services/StorageService';
import { locationService } from '../../src/services/LocationService';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Picker } from '@react-native-picker/picker';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Constants from 'expo-constants';

export default function DriverView() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [maxCapacity, setMaxCapacity] = useState('1');
  const [radius, setRadius] = useState('5');
  const [activeDelivery, setActiveDelivery] = useState<DeliveryRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<{ address: string; coordinates: { latitude: number; longitude: number } } | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<{ address: string; coordinates: { latitude: number; longitude: number } } | null>(null);
  const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey;

  useEffect(() => {
    loadCurrentLocation();
    loadActiveDelivery();
  }, []);

  const loadCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const loadActiveDelivery = async () => {
    try {
      const deliveries = await storageService.getDeliveryRequests();
      const active = deliveries.find(d => d.driverId === user?.id && d.status === 'in_progress');
      if (active) {
        setActiveDelivery(active);
        await locationService.startLocationTracking(active.id);
      }
    } catch (error) {
      console.error('Error loading active delivery:', error);
    }
  };

  const handleAvailabilityToggle = async (value: boolean) => {
    setIsAvailable(value);
    if (value) {
      try {
        setLoading(true);
        if (!currentLocation) {
          throw new Error('Current location not available');
        }

        await storageService.createDriverAvailability({
          driverId: user?.id || '',
          startLocation: pickupLocation?.coordinates || currentLocation,
          destination: destinationLocation?.address || 'Any',
          dateTime: new Date().toISOString(),
          radius: parseInt(radius),
          maxCapacity: parseInt(maxCapacity),
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to set availability');
        setIsAvailable(false);
      } finally {
        setLoading(false);
      }
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Driver Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: currentLocation?.latitude || 37.78825,
              longitude: currentLocation?.longitude || -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {currentLocation && (
              <Marker
                coordinate={currentLocation}
                title="Your Location"
                pinColor="blue"
              />
            )}
            {pickupLocation && (
              <Marker
                coordinate={pickupLocation.coordinates}
                title="Pickup Location"
                pinColor="green"
              />
            )}
            {destinationLocation && (
              <Marker
                coordinate={destinationLocation.coordinates}
                title="Destination"
                pinColor="red"
              />
            )}
            {activeDelivery && (
              <>
                <Marker
                  coordinate={activeDelivery.pickupLocation}
                  title="Pickup Location"
                  pinColor="green"
                />
                <Marker
                  coordinate={activeDelivery.dropoffLocation}
                  title="Dropoff Location"
                  pinColor="red"
                />
              </>
            )}
          </MapView>
        </View>

        <View style={styles.availabilityContainer}>
          <View style={styles.availabilityHeader}>
            <Text style={styles.availabilityTitle}>Set Availability</Text>
            <Switch
              value={isAvailable}
              onValueChange={handleAvailabilityToggle}
              disabled={loading}
            />
          </View>

          {isAvailable && (
            <View style={styles.availabilitySettings}>
              <View style={styles.locationInputContainer}>
                <Text style={styles.settingLabel}>Pickup Location:</Text>
                <GooglePlacesAutocomplete
                  key="start-location"
                  placeholder="Enter your starting location"
                  onPress={(data, details = null) => {
                    if (details) {
                      setPickupLocation({
                        address: data.description,
                        coordinates: {
                          latitude: details.geometry.location.lat,
                          longitude: details.geometry.location.lng,
                        },
                      });
                    }
                  }}
                  fetchDetails={true}
                  predefinedPlaces={[]}
                  query={{
                    key: apiKey,
                    language: 'en',
                  }}
                  styles={{
                    textInput: styles.locationInput,
                    container: { flex: 0 },
                  }}
                  textInputProps={{
                    onFocus: () => {},
                    onBlur: () => {},
                  }}
                />
              </View>

              <View style={styles.locationInputContainer}>
                <Text style={styles.settingLabel}>Destination:</Text>
                <GooglePlacesAutocomplete
                  placeholder="Enter destination"
                  fetchDetails={true}
                  predefinedPlaces={[]} 
                  onPress={(data, details = null) => {
                    if (details) {
                      setDestinationLocation({
                        address: data.description,
                        coordinates: {
                          latitude: details.geometry.location.lat,
                          longitude: details.geometry.location.lng,
                        },
                      });
                    }
                  }}
                  query={{
                    key: apiKey,
                    language: 'en',
                  }}
                  styles={googlePlacesStyles}
                  textInputProps={{
                    onFocus: () => {},
                    onBlur: () => {},
                  }}
                />
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Max Capacity:</Text>
                <Picker
                  selectedValue={maxCapacity}
                  style={styles.picker}
                  onValueChange={setMaxCapacity}
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <Picker.Item key={num} label={num.toString()} value={num.toString()} />
                  ))}
                </Picker>
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Search Radius (km):</Text>
                <Picker
                  selectedValue={radius}
                  style={styles.picker}
                  onValueChange={setRadius}
                >
                  {[5, 10, 15, 20, 25].map(num => (
                    <Picker.Item key={num} label={num.toString()} value={num.toString()} />
                  ))}
                </Picker>
              </View>
            </View>
          )}
        </View>

        {activeDelivery && (
          <View style={styles.activeDeliveryContainer}>
            <Text style={styles.activeDeliveryTitle}>Active Delivery</Text>
            <Text style={styles.deliveryInfo}>
              Status: {activeDelivery.status}
            </Text>
            <Text style={styles.deliveryInfo}>
              Instructions: {activeDelivery.instructions}
            </Text>
          </View>
        )}
      </ScrollView>
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
  availabilityContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  availabilityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  availabilitySettings: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
  },
  picker: {
    flex: 1,
  },
  activeDeliveryContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  activeDeliveryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  deliveryInfo: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  locationInputContainer: {
    marginBottom: 15,
  },
  locationInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  autocompleteContainer: {
    flex: 0,
    marginTop: 5,
  },
  autocompleteList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    zIndex: 1000,
  },
});

const googlePlacesStyles = {
  container: {
    flex: 0,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  listView: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    zIndex: 1000,
  },
}; 
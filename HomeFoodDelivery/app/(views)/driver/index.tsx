import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../src/contexts/AuthContext';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Slider from '@react-native-community/slider';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Constants from 'expo-constants';

export default function DriverDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey;

  // Availability form state
  const [startLocation, setStartLocation] = useState<{ address: string; latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState<{ address: string; latitude: number; longitude: number } | null>(null);
  const [radius, setRadius] = useState(5);
  const [maxCapacity, setMaxCapacity] = useState('5');
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/sign-in');
  };

  const handleSaveAvailability = async () => {
    if (!startLocation) {
      Alert.alert('Error', 'Please select your starting location.');
      return;
    }
    if (!destination) {
      Alert.alert('Error', 'Please select your destination.');
      return;
    }
    if (isNaN(parseInt(maxCapacity)) || parseInt(maxCapacity) <= 0) {
      Alert.alert('Error', 'Please enter a valid maximum capacity.');
      return;
    }
    try {
      setIsSaving(true);
      // TODO: Call storageService.createDriverAvailability({ ... })
      Alert.alert('Success', 'Your availability has been saved successfully!');
      setStartLocation(null);
      setDestination(null);
      setMaxCapacity('5');
      setRadius(5);
    } catch (error) {
      console.error('Error saving availability:', error);
      Alert.alert('Error', 'Failed to save availability. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F7' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text style={styles.header}>Driver Dashboard</Text>
        <Text style={styles.subheader}>Set Your Availability</Text>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Starting Location (required)</Text>
            <GooglePlacesAutocomplete
              placeholder="Enter your starting location"
              onPress={(data, details = null) => {
                if (details) {
                  setStartLocation({
                    address: data.description,
                    latitude: details.geometry.location.lat,
                    longitude: details.geometry.location.lng,
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
                textInput: styles.input,
                container: { flex: 0 },
              }}
              textInputProps={{
                onFocus: () => {},
                onBlur: () => {},
              }}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Destination (required)</Text>
            <GooglePlacesAutocomplete
              placeholder="Enter your destination"
              onPress={(data, details = null) => {
                if (details) {
                  setDestination({
                    address: data.description,
                    latitude: details.geometry.location.lat,
                    longitude: details.geometry.location.lng,
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
                textInput: styles.input,
                container: { flex: 0 },
              }}
              textInputProps={{
                onFocus: () => {},
                onBlur: () => {},
              }}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>How far are you willing to drive to pick up food? (in miles)</Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={1}
              maximumValue={20}
              step={1}
              value={radius}
              onValueChange={setRadius}
            />
            <Text style={styles.radiusValue}>{radius} miles</Text>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Maximum Orders</Text>
            <TextInput
              style={styles.input}
              value={maxCapacity}
              onChangeText={setMaxCapacity}
              keyboardType="numeric"
              placeholder="Enter maximum number of orders"
            />
          </View>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSaveAvailability}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Availability'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subheader}>Map Preview</Text>
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: startLocation?.latitude || 37.78825,
              longitude: startLocation?.longitude || -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {startLocation && (
              <Marker
                coordinate={{ latitude: startLocation.latitude, longitude: startLocation.longitude }}
                title="Start"
                pinColor="green"
              />
            )}
            {destination && (
              <Marker
                coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
                title="Destination"
                pinColor="red"
              />
            )}
          </MapView>
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' }}>
        <Button title="Logout" color="#d00" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  radiusValue: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapContainer: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#eee',
  },
  map: {
    flex: 1,
  },
}); 
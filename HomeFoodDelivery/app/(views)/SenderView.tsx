import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { storageService } from '../../src/services/StorageService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export default function SenderView() {
  const router = useRouter();
  const { user, logout } = useAuth();
  if (!user) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Loading user...</Text></View>;
  }
  const [pickupLocation, setPickupLocation] = useState<{ address: string; latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState<{ address: string; latitude: number; longitude: number } | null>(null);
  const [dropoffStop, setDropoffStop] = useState<{ address: string; latitude: number; longitude: number } | null>(null);
  const [desiredDateTime, setDesiredDateTime] = useState(new Date());
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);

  const handleCreateDelivery = async () => {
    if (!user || !pickupLocation || !destination || !dropoffStop) {
      Alert.alert('Error', 'Please enter pickup location, destination campus/city, and dropoff stop');
      return;
    }
    setLoading(true);
    try {
      await storageService.createDeliveryRequest({
        senderId: user.id,
        pickupLocation,
        dropoffLocation: dropoffStop,
        desiredDateTime: desiredDateTime.toISOString(),
        instructions,
      });
      Alert.alert('Success', 'Delivery request created successfully');
      setPickupLocation(null);
      setDestination(null);
      setDropoffStop(null);
      setInstructions('');
    } catch (error) {
      Alert.alert('Error', 'Failed to create delivery request');
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Delivery</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label}>Pickup Location (required)</Text>
          <GooglePlacesAutocomplete
            placeholder="Enter your pickup location"
            onPress={(data, details = null) => {
              if (details) {
                setPickupLocation({
                  address: data.description,
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                });
              }
            }}
            fetchDetails={true}
            query={{
              key: 'YOUR_GOOGLE_MAPS_API_KEY',
              language: 'en',
            }}
            styles={{
              textInput: styles.input,
              container: { flex: 0 },
            }}
            predefinedPlaces={[]}
            textInputProps={{}}
          />
          <Text style={styles.label}>Destination Campus/City (required)</Text>
          <GooglePlacesAutocomplete
            placeholder="Enter your destination campus/city"
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
            query={{
              key: 'YOUR_GOOGLE_MAPS_API_KEY',
              language: 'en',
            }}
            styles={{
              textInput: styles.input,
              container: { flex: 0 },
            }}
            predefinedPlaces={[]}
            textInputProps={{}}
          />
          <Text style={styles.label}>Dropoff Stop (required)</Text>
          <GooglePlacesAutocomplete
            placeholder="Enter your dropoff stop (building, landmark, etc.)"
            onPress={(data, details = null) => {
              if (details) {
                setDropoffStop({
                  address: data.description,
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                });
              }
            }}
            fetchDetails={true}
            query={{
              key: 'YOUR_GOOGLE_MAPS_API_KEY',
              language: 'en',
            }}
            styles={{
              textInput: styles.input,
              container: { flex: 0 },
            }}
            predefinedPlaces={[]}
            textInputProps={{}}
          />
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDateTimePicker(true)}
          >
            <Text style={styles.dateTimeButtonText}>
              {desiredDateTime.toLocaleString()}
            </Text>
          </TouchableOpacity>
          {showDateTimePicker && (
            <DateTimePicker
              value={desiredDateTime}
              mode="datetime"
              onChange={(event, selectedDate) => {
                setShowDateTimePicker(false);
                if (selectedDate) {
                  setDesiredDateTime(selectedDate);
                }
              }}
            />
          )}
          <Text style={styles.label}>Instructions (optional)</Text>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateDelivery}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating...' : 'Create Delivery Request'}
            </Text>
          </TouchableOpacity>
        </View>
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
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 
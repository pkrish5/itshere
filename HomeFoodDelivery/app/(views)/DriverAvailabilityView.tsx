import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAuth } from 'src/contexts/AuthContext';
import Slider from '@react-native-community/slider';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export default function DriverAvailabilityView() {
  const { user } = useAuth();
  const [startLocation, setStartLocation] = useState<{ address: string; latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState<{ address: string; latitude: number; longitude: number } | null>(null);
  const [radius, setRadius] = useState(5);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateInput, setDateInput] = useState(selectedDate.toLocaleDateString());
  const [timeInput, setTimeInput] = useState(selectedDate.toLocaleTimeString());
  const [maxCapacity, setMaxCapacity] = useState('5');
  const [isSaving, setIsSaving] = useState(false);

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
    if (!user || !user.id) {
      Alert.alert('Error', 'You must be logged in to set your availability.');
      return;
    }
    try {
      setIsSaving(true);
      const availabilityData = {
        driverId: user.id,
        startLocation,
        destination,
        dateTime: selectedDate.toISOString(),
        radius,
        maxCapacity: parseInt(maxCapacity),
      };
      // TODO: Call storageService.createDriverAvailability(availabilityData)
      Alert.alert('Success', 'Your availability has been saved successfully!');
      setStartLocation(null);
      setDestination(null);
      setMaxCapacity('5');
      setRadius(5);
      setSelectedDate(new Date());
    } catch (error) {
      console.error('Error saving availability:', error);
      Alert.alert('Error', 'Failed to save availability. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Set Your Availability</Text>
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
            query={{
              key: 'YOUR_GOOGLE_MAPS_API_KEY',
              language: 'en',
            }}
            styles={{
              textInput: styles.input,
              container: { flex: 0 },
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
            query={{
              key: 'YOUR_GOOGLE_MAPS_API_KEY',
              language: 'en',
            }}
            styles={{
              textInput: styles.input,
              container: { flex: 0 },
            }}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date & Time (required)</Text>
          <View style={styles.dateTimeContainer}>
            <TextInput
              style={[styles.input, styles.dateInput]}
              value={dateInput}
              onChangeText={setDateInput}
              placeholder="MM/DD/YYYY"
            />
            <TextInput
              style={[styles.input, styles.timeInput]}
              value={timeInput}
              onChangeText={setTimeInput}
              placeholder="HH:MM"
            />
          </View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
  },
  formContainer: {
    padding: 16,
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
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dateInput: {
    flex: 2,
  },
  timeInput: {
    flex: 1,
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
}); 
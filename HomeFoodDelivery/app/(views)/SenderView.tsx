import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const commonPickupLocations = [
  { id: '1', name: 'Main Campus Center', address: '123 Campus Center Dr' },
  { id: '2', name: 'North Campus Hub', address: '456 North Campus Way' },
  { id: '3', name: 'Student Union', address: '789 Union Ave' },
  { id: '4', name: 'Library Plaza', address: '321 Library Rd' },
];

const steps = ['Order Placed', 'Driver Assigned', 'Food Picked Up', 'In Transit', 'Delivered'];

export default function SenderView() {
  const [delivery, setDelivery] = useState({
    status: 'pending',
    pickupAddress: '123 Home St, San Francisco',
    dropoffLocation: 'Main Campus Center',
    instructions: 'Food is in a cooler on the porch',
    estimatedTime: '30 minutes',
    leaveOutTime: '12:00',
  });
  const [newInstructions, setNewInstructions] = useState('');
  const [selectedDropoff, setSelectedDropoff] = useState('1');

  const handleAddInstructions = () => {
    setDelivery(prev => ({
      ...prev,
      instructions: prev.instructions + '\n' + newInstructions
    }));
    setNewInstructions('');
  };

  const handleDropoffChange = (itemValue) => {
    const location = commonPickupLocations.find(loc => loc.id === itemValue);
    if (location) {
      setSelectedDropoff(location.id);
      setDelivery(prev => ({
        ...prev,
        dropoffLocation: location.name
      }));
    }
  };

  const getStepIndex = () => {
    switch (delivery.status) {
      case 'pending': return 0;
      case 'picked-up': return 2;
      case 'in-transit': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Send Food to Your Student</Text>
      {/* Step Indicator */}
      <View style={styles.stepper}>
        {steps.map((label, idx) => (
          <View key={label} style={styles.step}>
            <View style={[styles.circle, idx <= getStepIndex() && styles.circleActive]} />
            <Text style={styles.stepLabel}>{label}</Text>
          </View>
        ))}
      </View>
      {/* Delivery Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delivery Details</Text>
        <View style={styles.detailRow}>
          <MaterialIcons name="location-on" size={20} color="#FF6B6B" />
          <Text style={styles.detailLabel}>Pickup Location:</Text>
          <Text>{delivery.pickupAddress}</Text>
        </View>
        <View style={styles.detailRow}>
          <FontAwesome5 name="school" size={20} color="#4ECDC4" />
          <Text style={styles.detailLabel}>Dropoff Location:</Text>
          <Picker
            selectedValue={selectedDropoff}
            style={{ flex: 1 }}
            onValueChange={handleDropoffChange}
          >
            {commonPickupLocations.map((location) => (
              <Picker.Item key={location.id} label={location.name} value={location.id} />
            ))}
          </Picker>
        </View>
      </View>
      {/* Instructions and Time */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delivery Instructions</Text>
        <TextInput
          style={styles.input}
          value={delivery.leaveOutTime}
          onChangeText={text => setDelivery(prev => ({ ...prev, leaveOutTime: text }))}
          placeholder="Leave Food Out By (e.g. 12:00)"
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          multiline
          value={newInstructions}
          onChangeText={setNewInstructions}
          placeholder="Add any special instructions for the driver..."
        />
        <Button title="Add Instructions" onPress={handleAddInstructions} color="#FF6B6B" />
        <Text style={{ marginTop: 16, fontWeight: 'bold' }}>Current Instructions:</Text>
        <Text style={{ color: '#666' }}>{delivery.instructions}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
          <MaterialIcons name="access-time" size={20} color="#4ECDC4" />
          <Text style={{ marginLeft: 8 }}>Estimated Delivery Time: {delivery.estimatedTime}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  stepper: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  step: { alignItems: 'center', flex: 1 },
  circle: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#ccc', marginBottom: 4 },
  circleActive: { backgroundColor: '#FF6B6B' },
  stepLabel: { fontSize: 10, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 16, elevation: 2 },
  cardTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailLabel: { fontWeight: 'bold', marginLeft: 8, marginRight: 4 },
  input: { backgroundColor: '#F0F0F0', borderRadius: 6, padding: 8, marginBottom: 8 },
}); 
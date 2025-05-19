// app/role-select.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';

export default function RoleSelect() {
  const [selected, setSelected] = useState('');
  const router = useRouter();

  const handleSelect = async (role: string) => {
    setSelected(role);
    const user = auth.currentUser;
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { role }, { merge: true });
        // Route to the correct view
        if (role === 'Sender') router.replace('/(views)/SenderView');
        if (role === 'Receiver') router.replace('/(views)/ReceiverView');
        if (role === 'Driver') router.replace('/(views)/DriverView');
      } catch (error) {
        console.error('Error saving role:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select Your Role</Text>
      <TouchableOpacity 
        style={[styles.button, selected === 'Sender' && styles.selectedButton]} 
        onPress={() => handleSelect('Sender')}
      >
        <Text style={styles.buttonText}>Sender (Parent)</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.button, selected === 'Receiver' && styles.selectedButton]} 
        onPress={() => handleSelect('Receiver')}
      >
        <Text style={styles.buttonText}>Receiver (Student)</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.button, selected === 'Driver' && styles.selectedButton]} 
        onPress={() => handleSelect('Driver')}
      >
        <Text style={styles.buttonText}>Driver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff',
    padding: 20
  },
  header: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 32,
    color: '#333'
  },
  button: { 
    backgroundColor: '#4ECDC4', 
    padding: 16, 
    borderRadius: 8, 
    marginBottom: 16, 
    width: 280, 
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  selectedButton: {
    backgroundColor: '#2E8B84'
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
});

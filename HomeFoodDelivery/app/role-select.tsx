// app/role-select.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

export default function RoleSelect() {
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { user, updateUserRole } = useAuth();

  const handleSelect = async (role: 'Sender' | 'Receiver' | 'Driver') => {
    if (!user) {
      setError('You must be logged in to select a role.');
      return;
    }

    setSelected(role);
    setError('');
    setSuccess(false);
    setLoading(true);
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Operation timed out. Please try again.');
    }, 10000);

    try {
      await updateUserRole(role);
      clearTimeout(timeoutId);
      setSuccess(true);
      
      // Navigate after a short delay to show success message
      setTimeout(() => {
        try {
          if (role === 'Sender') router.replace('/(views)/SenderView');
          else if (role === 'Receiver') router.replace('/(views)/ReceiverView');
          else if (role === 'Driver') router.replace('/(views)/DriverView');
        } catch (navError) {
          console.error('Navigation error:', navError);
          setError('Error navigating to role view. Please try again.');
        }
      }, 600);
    } catch (error: any) {
      console.error('Error saving role:', error);
      clearTimeout(timeoutId);
      setError(error.message || 'Error saving role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Select Your Role</Text>
        <Text style={styles.error}>You must be logged in to select a role.</Text>
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={() => router.replace('/sign-in')}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Go to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select Your Role</Text>
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>Role selected successfully!</Text> : null}
      
      <View style={styles.roleContainer}>
      <TouchableOpacity
          style={[
            styles.roleButton,
            selected === 'Sender' && styles.selectedRole,
          ]}
        onPress={() => handleSelect('Sender')}
        disabled={loading}
      >
          <Text style={[
            styles.roleText,
            selected === 'Sender' && styles.selectedRoleText,
          ]}>Sender</Text>
      </TouchableOpacity>

      <TouchableOpacity
          style={[
            styles.roleButton,
            selected === 'Receiver' && styles.selectedRole,
          ]}
        onPress={() => handleSelect('Receiver')}
        disabled={loading}
      >
          <Text style={[
            styles.roleText,
            selected === 'Receiver' && styles.selectedRoleText,
          ]}>Receiver</Text>
      </TouchableOpacity>

      <TouchableOpacity
          style={[
            styles.roleButton,
            selected === 'Driver' && styles.selectedRole,
          ]}
        onPress={() => handleSelect('Driver')}
        disabled={loading}
      >
          <Text style={[
            styles.roleText,
            selected === 'Driver' && styles.selectedRoleText,
          ]}>Driver</Text>
      </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Updating role...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  roleContainer: {
    gap: 15,
  },
  roleButton: {
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  selectedRole: {
    backgroundColor: '#007AFF',
  },
  roleText: {
    fontSize: 18,
    color: '#007AFF',
  },
  selectedRoleText: {
    color: '#fff',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
  success: {
    color: 'green',
    textAlign: 'center',
    marginBottom: 15,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
});
 
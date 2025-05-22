// app/index.tsx
import { useEffect } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && user) {
      if (user.role) {
        // Redirect based on role
        if (user.role === 'Sender') router.replace('/(views)/SenderView');
        else if (user.role === 'Receiver') router.replace('/(views)/ReceiverView');
        else if (user.role === 'Driver') router.replace('/(views)/driver');
        else router.replace('/role-select');
      } else {
        // User exists but no role set
        router.replace('/role-select');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If not loading and no user, redirect to sign-in
  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  // This will be shown briefly while the redirect is happening
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
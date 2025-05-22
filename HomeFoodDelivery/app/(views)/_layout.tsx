import { Stack } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { Redirect } from 'expo-router';

export default function ViewsLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="SenderView"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ReceiverView"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DriverView"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DriverAvailabilityView"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DriverDeliveryView"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SenderMatchingView"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TrackingView"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="LoginScreen"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SignupScreen"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="driver" options={{ headerShown: false }} />
    </Stack>
  );
} 
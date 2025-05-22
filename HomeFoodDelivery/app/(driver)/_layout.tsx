import { Stack } from 'expo-router';

export default function DriverLayout() {
  return (
    <Stack>
      <Stack.Screen name="Dashboard" options={{ title: 'Driver Dashboard', headerShown: true }} />
      <Stack.Screen name="SetAvailability" options={{ title: 'Set Availability', headerShown: true }} />
      <Stack.Screen name="AcceptRide" options={{ title: 'Accept Ride', headerShown: true }} />
      <Stack.Screen name="Navigation" options={{ title: 'Navigation', headerShown: true }} />
    </Stack>
  );
} 
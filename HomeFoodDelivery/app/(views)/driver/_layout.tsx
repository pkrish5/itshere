import { Tabs } from 'expo-router';

export default function DriverLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="pickups" options={{ title: 'Pickups' }} />
      <Tabs.Screen name="active-ride" options={{ title: 'Active Ride' }} />
    </Tabs>
  );
} 
import { Stack } from 'expo-router';

export default function ViewsLayout() {
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
    </Stack>
  );
} 
  import { Stack } from 'expo-router';
  import { AuthProvider } from '../src/contexts/AuthContext';

  export default function RootLayout() {
    return (
      <AuthProvider>
        <Stack>
          <Stack.Screen name="(views)" options={{ headerShown: false }} />
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
          <Stack.Screen name="role-select" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    );
  }
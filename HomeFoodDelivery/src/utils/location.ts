import * as Location from 'expo-location';
import { LocationObject, LocationSubscription } from 'expo-location';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from 'src/firebaseConfig';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export async function startLocationUpdates(
  deliveryId: string,
  onError: (error: any) => void
): Promise<LocationSubscription | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      onError(new Error('Location permission not granted'));
      return null;
    }

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      async (location: LocationObject) => {
        try {
          await updateDoc(doc(db, 'deliveries', deliveryId), {
            driverLocation: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
            lastUpdated: new Date(),
          });
        } catch (error) {
          console.error('Error updating location:', error);
          onError(error);
        }
      }
    );

    return subscription;
  } catch (error) {
    console.error('Error starting location updates:', error);
    onError(error);
    return null;
  }
}

export function calculateETA(
  currentLocation: LocationCoordinates,
  destination: LocationCoordinates,
  averageSpeed: number = 30 // km/h
): Date {
  const distance = calculateDistance(currentLocation, destination);
  const timeInHours = distance / averageSpeed;
  const eta = new Date();
  eta.setHours(eta.getHours() + timeInHours);
  return eta;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return `${hours}h ${remainingMinutes}min`;
}

function calculateDistance(point1: LocationCoordinates, point2: LocationCoordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  const lat1 = toRad(point1.latitude);
  const lat2 = toRad(point2.latitude);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(value: number): number {
  return value * Math.PI / 180;
} 
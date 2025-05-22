import * as Location from 'expo-location';
import { storageService } from './StorageService';

interface Coordinates {
  latitude: number;
  longitude: number;
}

class LocationService {
  private static instance: LocationService;
  private locationSubscription: Location.LocationSubscription | null = null;
  private activeDeliveryId: string | null = null;

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  async getCurrentLocation(): Promise<Coordinates> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Location permission not granted');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  }

  async startLocationTracking(deliveryId: string): Promise<void> {
    if (this.locationSubscription) {
      await this.stopLocationTracking();
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Location permission not granted');
    }

    this.activeDeliveryId = deliveryId;

    this.locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000, // Update every 10 seconds
        distanceInterval: 10, // Update if moved 10 meters
      },
      async (location) => {
        if (this.activeDeliveryId) {
          try {
            await storageService.updateDeliveryRequest(this.activeDeliveryId, {
              driverLocation: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              },
              lastUpdated: new Date().toISOString(),
            });
          } catch (error) {
            console.error('Error updating delivery location:', error);
          }
        }
      }
    );
  }

  async stopLocationTracking(): Promise<void> {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
      this.activeDeliveryId = null;
    }
  }

  calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  calculateETA(
    currentLocation: Coordinates,
    destination: Coordinates,
    averageSpeed: number = 30 // Average speed in km/h
  ): Date {
    const distance = this.calculateDistance(currentLocation, destination) / 1000; // Convert to kilometers
    const timeInHours = distance / averageSpeed;
    const eta = new Date();
    eta.setHours(eta.getHours() + timeInHours);
    return eta;
  }

  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${Math.round(minutes)}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}min`;
  }
}

export const locationService = LocationService.getInstance();
export type { Coordinates }; 
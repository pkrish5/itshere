import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  DocumentData,
  DocumentReference,
} from 'firebase/firestore';

interface DeliveryRequest {
  id: string;
  senderId: string;
  pickupLocation: {
    latitude: number;
    longitude: number;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
  };
  desiredDateTime: string;
  instructions: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  driverId?: string;
}

interface DriverAvailability {
  id: string;
  driverId: string;
  startLocation: { latitude: number; longitude: number } | string;
  destination: string;
  dateTime: string;
  radius: number;
  maxCapacity: number;
  status: 'available' | 'unavailable';
}

class StorageService {
  // Delivery Requests
  async createDeliveryRequest(request: Omit<DeliveryRequest, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'deliveryRequests'), {
      ...request,
      createdAt: new Date().toISOString(),
      status: 'pending',
    });
    return docRef.id;
  }

  async getDeliveryRequests(): Promise<DeliveryRequest[]> {
    const snapshot = await getDocs(collection(db, 'deliveryRequests'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DeliveryRequest));
  }

  async updateDeliveryRequest(id: string, updates: Partial<DeliveryRequest>): Promise<void> {
    const docRef = doc(db, 'deliveryRequests', id);
    await updateDoc(docRef, updates);
  }

  // Driver Availability
  async createDriverAvailability(availability: Omit<DriverAvailability, 'id' | 'status'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'driverAvailabilities'), {
      ...availability,
      status: 'available',
    });
    return docRef.id;
  }

  async getDriverAvailabilities(): Promise<DriverAvailability[]> {
    const snapshot = await getDocs(collection(db, 'driverAvailabilities'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DriverAvailability));
  }

  async updateDriverAvailability(id: string, updates: Partial<DriverAvailability>): Promise<void> {
    const docRef = doc(db, 'driverAvailabilities', id);
    await updateDoc(docRef, updates);
  }

  // Real-time updates
  subscribe(collectionName: string, callback: (data: any) => void): () => void {
    const unsubscribe = onSnapshot(collection(db, collectionName), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    });
    return unsubscribe;
  }
}

export const storageService = new StorageService();
export type { DeliveryRequest, DriverAvailability }; 
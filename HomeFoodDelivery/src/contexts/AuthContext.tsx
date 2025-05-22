import React, { createContext, useState, useContext, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { auth } from '../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

interface User {
  id: string;
  email: string;
  role?: 'Sender' | 'Receiver' | 'Driver';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserRole: (role: 'Sender' | 'Receiver' | 'Driver') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'No user');
      try {
        if (firebaseUser) {
          // Fetch user doc from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          let role;
          if (userDoc.exists()) {
            role = userDoc.data().role;
            console.log('User role:', role);
          }
          setUser({ id: firebaseUser.uid, email: firebaseUser.email || '', role });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    });

    return () => {
      console.log('Cleaning up auth state listener...');
      unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      if (password.length < 6) {
        throw new Error('Password should be at least 6 characters');
      }
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user doc in Firestore with retry
      const userRef = doc(db, 'users', cred.user.uid);
      try {
        await setDoc(userRef, {
          email: cred.user.email || '',
          role: null,
          createdAt: new Date().toISOString()
        });
      } catch (docError) {
        console.error('Error creating user document:', docError);
        // If document creation fails, try to update it
        try {
          await updateDoc(userRef, {
            email: cred.user.email || '',
            role: null,
            createdAt: new Date().toISOString()
          });
        } catch (updateError) {
          console.error('Error updating user document:', updateError);
          throw new Error('Failed to create user profile');
        }
      }
      
      setUser({ id: cred.user.uid, email: cred.user.email || '', role: undefined });
    } catch (err) {
      console.error('Error in sign up:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during sign up';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Fetch user doc from Firestore
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      let role;
      if (userDoc.exists()) {
        role = userDoc.data().role;
      }
      setUser({ id: cred.user.uid, email: cred.user.email || '', role });
    } catch (err) {
      console.error('Error in sign in:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Error in logout:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during logout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (role: 'Sender' | 'Receiver' | 'Driver') => {
    if (!auth.currentUser) throw new Error('No user logged in');
    setError(null);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      // First check if document exists
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // If document doesn't exist, create it
        await setDoc(userRef, {
          email: auth.currentUser.email || '',
          role: role,
          createdAt: new Date().toISOString()
        });
      } else {
        // If document exists, update it
        await updateDoc(userRef, { role });
      }
      
      setUser((prev) => prev ? { ...prev, role } : null);
    } catch (err) {
      console.error('Error updating role:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating role';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    logout,
    updateUserRole,
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
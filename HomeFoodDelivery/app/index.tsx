// app/index.tsx
import { useEffect } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { auth } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function Index() {
  const router = useRouter();
  
  // Check if user is logged in and redirect accordingly
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Check if user has a role
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().role) {
            const role = userDoc.data().role;
            // Redirect based on role
            if (role === 'Sender') router.replace('/(views)/SenderView');
            else if (role === 'Receiver') router.replace('/(views)/ReceiverView');
            else if (role === 'Driver') router.replace('/(views)/DriverView');
            else router.replace('/role-select');
          } else {
            // User exists but no role set
            router.replace('/role-select');
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          router.replace('/role-select');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Default redirect to sign-in
  return <Redirect href="sign-in" />;
}
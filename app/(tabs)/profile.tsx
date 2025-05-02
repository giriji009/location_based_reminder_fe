// app/(tabs)/profile.tsx
import React from 'react';
import { useRouter } from 'expo-router';
import { ProfileScreen } from '../../src/screens/profile/ProfileScreen';

export default function ProfileScreenWrapper() {
  const router = useRouter();
  
  // Create a navigation prop that mimics React Navigation
  const navigation = {
    navigate: (name: string) => {
      if (name === 'EditProfile') {
        // Make sure these paths actually exist in your app directory structure
        // router.navigate("/profile/Ed");
      } else if (name === 'Settings') {
        // router.navigate("/profile/settings");
      }
    },
    goBack: () => router.back()
  };
  
  return <ProfileScreen navigation={navigation} />;
}
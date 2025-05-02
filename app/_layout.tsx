// // app/index.js or app/_layout.js
// import React from 'react';
// import { StatusBar } from 'expo-status-bar';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { AuthProvider } from '../src/context/AuthContext';
// import { AppNavigator } from '../src/navigation/AppNavigator';

// export default function AppLayout() {
//   return (
//     <SafeAreaProvider>
//       <AuthProvider>
//         <AppNavigator />
//         <StatusBar style="auto" />
//       </AuthProvider>
//     </SafeAreaProvider>
//   );
// }


// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack 
          screenOptions={{
            headerShown: false,
          }}
        />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
// // app/(tabs)/map.tsx
// import React from 'react';
// import { useRouter } from 'expo-router';
// import { MapScreen } from '../../src/screens/map/MapScreen';

// export default function MapScreenWrapper() {
//   const router = useRouter();
  
//   // Pass the navigation prop the way your component expects it
//   const navigation = {
//     navigate: (name: string, params?: any) => {
//       if (name === 'TaskDetail') {
//         router.navigate("/task/[id]", { id: params.taskId });
//       } else if (name === 'AddEditTask') {
//         router.navigate("/task/add");
//       }
//     },
//     goBack: () => router.back()
//   };
  
//   return <MapScreen navigation={navigation} />;
// }

// app/(tabs)/map.tsx
import React from 'react';
import { useRouter } from 'expo-router';
import { MapScreen } from '../../src/screens/map/MapScreen';

export default function MapScreenWrapper() {
  const router = useRouter();
  
  // First, let's check if we can modify the MapScreen component to accept props
  // If MapScreen doesn't accept a navigation prop in its TypeScript definition,
  // we need to cast it to any to bypass TypeScript checking
  const MapScreenAny = MapScreen as any;
  
  // Pass the navigation prop using push instead of navigate
  const navigation = {
    navigate: (name: string, params?: any) => {
      if (name === 'TaskDetail') {
        router.push({
          pathname: "/task/[id]" as any,
          params: { id: params.taskId } as any
        } as any);
      } else if (name === 'AddEditTask') {
        router.push("/task/add" as any);
      }
    },
    goBack: () => router.back()
  };
  
  return <MapScreenAny navigation={navigation} />;
}
// // app/task/add.tsx
// import React from 'react';
// import { useRouter } from 'expo-router';
// import { AddEditTaskScreen } from '../../src/screens/tasks/AddEditTaskScreen';

// export default function AddTaskPage() {
//   const router = useRouter();
  
//   // Create navigation and route props that mimic React Navigation
//   const navigation = {
//     goBack: () => router.back()
//   };
  
//   const route = {
//     params: {}
//   };
  
//   return <AddEditTaskScreen navigation={navigation} route={route} />;
// }


// app/task/add.tsx
import React from 'react';
import { useRouter } from 'expo-router';
import { AddEditTaskScreen } from '../../src/screens/tasks/AddEditTaskScreen';

export default function AddTaskPage() {
  const router = useRouter();
  
  const navigation = {
    goBack: () => router.back()
  };
  
  const route = {
    params: {}
  };
  
  // Cast to any to bypass TypeScript errors
  const ScreenComponent = AddEditTaskScreen as any;
  
  return <ScreenComponent navigation={navigation} route={route} />;
}

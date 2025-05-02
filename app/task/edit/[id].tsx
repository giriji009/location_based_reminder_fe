// app/task/edit/[id].tsx
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AddEditTaskScreen } from '../../../src/screens/tasks/AddEditTaskScreen';

export default function EditTaskPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const navigation = {
    goBack: () => router.back()
  };
  
  const route = {
    params: {
      taskId: id,
      task: null
    }
  };
  
  // Cast to any to bypass TypeScript errors
  const ScreenComponent = AddEditTaskScreen as any;
  
  return <ScreenComponent navigation={navigation} route={route} />;
}
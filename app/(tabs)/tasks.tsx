// app/(tabs)/tasks.tsx
import React from 'react';
import { useRouter } from 'expo-router';
import { TaskListScreen } from '../../src/screens/tasks/TaskListScreen';

export default function TasksScreen() {
  const router = useRouter();
  
  // Create a navigation prop that mimics React Navigation
  const navigation = {
    navigate: (name: string, params?: any) => {
      if (name === 'TaskDetail') {
        // Use a type-safe approach by constructing the path properly
        router.push({
          pathname: "/task/[id]",
          params: { id: params.taskId }
        });
      } else if (name === 'AddEditTask') {
        router.push("/task/add");
      }
    },
    addListener: () => ({ remove: () => {} }),
    goBack: () => router.back()
  };
  
  return <TaskListScreen navigation={navigation} />;
}
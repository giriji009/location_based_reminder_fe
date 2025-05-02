// app/task/[id].tsx
import React from 'react';
import { useLocalSearchParams, useRouter, usePathname } from 'expo-router';
import { TaskDetailScreen } from '../../src/screens/tasks/TaskDetailScreen';

export default function TaskDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  // Create navigation and route props that mimics React Navigation
  const navigation = {
    navigate: (name: string, params?: any) => {
      if (name === 'AddEditTask') {
        // Use router.push with as any to bypass TypeScript checking
        router.push({
          pathname: "/task/edit/[id]",
          params: { id }
        } as any);
      }
    },
    goBack: () => router.back()
  };
  
  const route = {
    params: {
      taskId: id
    }
  };
  
  return <TaskDetailScreen navigation={navigation} route={route} />;
}
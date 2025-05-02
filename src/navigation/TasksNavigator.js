// src/navigation/TasksNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { TaskListScreen } from '../screens/tasks/TaskListScreen';
import { TaskDetailScreen } from '../screens/tasks/TaskDetailScreen';
import { AddEditTaskScreen } from '../screens/tasks/AddEditTaskScreen';

const Stack = createNativeStackNavigator();

export const TasksNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="TaskList" 
        component={TaskListScreen} 
        options={{ title: 'My Tasks' }}
      />
      <Stack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen} 
        options={{ title: 'Task Details' }}
      />
      <Stack.Screen 
        name="AddEditTask" 
        component={AddEditTaskScreen} 
        options={({ route }) => ({ 
          title: route.params?.taskId ? 'Edit Task' : 'Add Task' 
        })}
      />
    </Stack.Navigator>
  );
};
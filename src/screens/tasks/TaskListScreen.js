// src/screens/tasks/TaskListScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { tasksAPI } from '../../services/api';

export const TaskListScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('active'); // 'active', 'completed', 'all'

  useEffect(() => {
    loadTasks();
    
    // Set up navigation listener to refresh tasks when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      loadTasks();
    });
    
    // Return a function that calls the remove method
    return () => unsubscribe.remove();
  }, [navigation]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const response = await tasksAPI.getTasks();
      setTasks(response.data.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const handleTaskPress = (task) => {
    navigation.navigate('TaskDetail', { taskId: task._id });
  };

  const handleAddTask = () => {
    navigation.navigate('AddEditTask');
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await tasksAPI.completeTask(taskId);
      
      // Update local state to mark task as completed
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId 
            ? { ...task, isCompleted: true, completedAt: new Date() } 
            : task
        )
      );
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Failed to complete task. Please try again.');
    }
  };

  const filteredTasks = () => {
    switch (filter) {
      case 'active':
        return tasks.filter(task => !task.isCompleted);
      case 'completed':
        return tasks.filter(task => task.isCompleted);
      default:
        return tasks;
    }
  };

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity 
        style={[
          styles.filterTab, 
          filter === 'active' && styles.activeFilterTab
        ]}
        onPress={() => setFilter('active')}
      >
        <Text 
          style={[
            styles.filterTabText, 
            filter === 'active' && styles.activeFilterTabText
          ]}
        >
          Active
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.filterTab, 
          filter === 'completed' && styles.activeFilterTab
        ]}
        onPress={() => setFilter('completed')}
      >
        <Text 
          style={[
            styles.filterTabText, 
            filter === 'completed' && styles.activeFilterTabText
          ]}
        >
          Completed
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.filterTab, 
          filter === 'all' && styles.activeFilterTab
        ]}
        onPress={() => setFilter('all')}
      >
        <Text 
          style={[
            styles.filterTabText, 
            filter === 'all' && styles.activeFilterTabText
          ]}
        >
          All
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.taskItem,
        item.isCompleted && styles.completedTaskItem
      ]}
      onPress={() => handleTaskPress(item)}
    >
      <TouchableOpacity 
        style={styles.checkboxContainer}
        onPress={() => !item.isCompleted && handleCompleteTask(item._id)}
      >
        <Ionicons 
          name={item.isCompleted ? "checkmark-circle" : "ellipse-outline"} 
          size={24} 
          color={item.isCompleted ? "#4CAF50" : "#0066CC"} 
        />
      </TouchableOpacity>
      
      <View style={styles.taskContent}>
        <Text 
          style={[
            styles.taskTitle,
            item.isCompleted && styles.completedTaskText
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        
        {item.description ? (
          <Text 
            style={[
              styles.taskDescription,
              item.isCompleted && styles.completedTaskText
            ]}
            numberOfLines={1}
          >
            {item.description}
          </Text>
        ) : null}
        
        <View style={styles.taskMeta}>
          {item.address ? (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.address}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#DDD" />
      <Text style={styles.emptyTitle}>No tasks found</Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'active' 
          ? "You don't have any active tasks. Tap the + button to add a new task."
          : filter === 'completed'
            ? "You haven't completed any tasks yet."
            : "You don't have any tasks. Tap the + button to add a new task."
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
      </View>
      
      {renderFilterTabs()}
      
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      ) : (
        <FlatList
          data={filteredTasks()}
          renderItem={renderTaskItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddTask}
      >
        <Ionicons name="add" size={24} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 20,
  },
  activeFilterTab: {
    backgroundColor: '#E8F1FF',
  },
  filterTabText: {
    color: '#666',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#0066CC',
    fontWeight: 'bold',
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  completedTaskItem: {
    backgroundColor: '#F9F9F9',
    opacity: 0.8,
  },
  checkboxContainer: {
    marginRight: 15,
  },
  taskContent: {
    flex: 1,
    justifyContent: 'center',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    maxWidth: '80%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
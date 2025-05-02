// src/screens/tasks/TaskDetailScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle } from 'react-native-maps';
import { tasksAPI } from '../../services/api';

const { width } = Dimensions.get('window');

export const TaskDetailScreen = ({ navigation, route }) => {
  const { taskId } = route.params;
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState(null);

  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  const loadTaskDetails = async () => {
    try {
      setIsLoading(true);
      const response = await tasksAPI.getTask(taskId);
      const taskData = response.data.data;
      setTask(taskData);
      
      // Set map region based on task location
      if (taskData.location && taskData.location.coordinates) {
        const [longitude, latitude] = taskData.location.coordinates;
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      }
    } catch (error) {
      console.error('Error loading task details:', error);
      Alert.alert('Error', 'Failed to load task details. Please try again.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTask = () => {
    navigation.navigate('AddEditTask', { taskId: task._id, task });
  };

  const handleDeleteTask = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await tasksAPI.deleteTask(task._id);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleCompleteTask = async () => {
    try {
      await tasksAPI.completeTask(task._id);
      
      // Update local state
      setTask(prevTask => ({
        ...prevTask,
        isCompleted: true,
        completedAt: new Date()
      }));
      
      Alert.alert('Success', 'Task marked as complete!');
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Failed to complete task. Please try again.');
    }
  };

  if (isLoading || !task) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </SafeAreaView>
    );
  }

  const formattedDate = task.createdAt 
    ? new Date(task.createdAt).toLocaleString() 
    : 'Unknown';

  const formattedCompletedDate = task.completedAt 
    ? new Date(task.completedAt).toLocaleString() 
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <TouchableOpacity 
          style={styles.optionsButton}
          onPress={() => {
            Alert.alert(
              'Task Options',
              'Choose an action',
              [
                {
                  text: 'Edit Task',
                  onPress: handleEditTask
                },
                {
                  text: 'Delete Task',
                  onPress: handleDeleteTask,
                  style: 'destructive'
                },
                {
                  text: 'Cancel',
                  style: 'cancel'
                }
              ]
            );
          }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            task.isCompleted ? styles.completedBadge : styles.activeBadge
          ]}>
            <Ionicons 
              name={task.isCompleted ? "checkmark-circle" : "time-outline"} 
              size={16} 
              color="white" 
            />
            <Text style={styles.statusText}>
              {task.isCompleted ? 'Completed' : 'Active'}
            </Text>
          </View>
          
          {task.priority && (
            <View style={[
              styles.priorityBadge,
              task.priority === 1 ? styles.priorityLow : 
              task.priority === 2 ? styles.priorityMedium : 
              styles.priorityHigh
            ]}>
              <Ionicons name="flag" size={16} color="white" />
              <Text style={styles.priorityText}>
                {task.priority === 1 ? 'Low' : 
                 task.priority === 2 ? 'Medium' : 'High'} Priority
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.taskTitle}>{task.title}</Text>
        
        {task.description ? (
          <View style={styles.section}>
            <Text style={styles.descriptionText}>{task.description}</Text>
          </View>
        ) : null}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          {task.address ? (
            <View style={styles.addressContainer}>
              <Ionicons name="location" size={20} color="#0066CC" />
              <Text style={styles.addressText}>{task.address}</Text>
            </View>
          ) : null}
          
          {mapRegion ? (
            <View style={styles.mapContainer}>
              <MapView 
                style={styles.map}
                region={mapRegion}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: mapRegion.latitude,
                    longitude: mapRegion.longitude
                  }}
                  title={task.title}
                >
                  <Ionicons name="location" size={30} color="#0066CC" />
                </Marker>
                <Circle
                  center={{
                    latitude: mapRegion.latitude,
                    longitude: mapRegion.longitude
                  }}
                  radius={task.radius || 100}
                  fillColor="rgba(0, 102, 204, 0.1)"
                  strokeColor="rgba(0, 102, 204, 0.5)"
                  strokeWidth={1}
                />
              </MapView>
              <Text style={styles.radiusText}>
                Notification radius: {task.radius || 100} meters
              </Text>
            </View>
          ) : (
            <Text style={styles.noLocationText}>No location data available</Text>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created:</Text>
            <Text style={styles.detailValue}>{formattedDate}</Text>
          </View>
          
          {task.isRecurring && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Recurring:</Text>
              <Text style={styles.detailValue}>
                {task.recurringPattern?.type || 'Daily'}
              </Text>
            </View>
          )}
          
          {task.isCompleted && formattedCompletedDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Completed:</Text>
              <Text style={styles.detailValue}>{formattedCompletedDate}</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {!task.isCompleted && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={handleCompleteTask}
          >
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={styles.completeButtonText}>Mark as Complete</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  optionsButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  activeBadge: {
    backgroundColor: '#0066CC',
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 5,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  priorityLow: {
    backgroundColor: '#4CAF50',
  },
  priorityMedium: {
    backgroundColor: '#FF9800',
  },
  priorityHigh: {
    backgroundColor: '#F44336',
  },
  priorityText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 5,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  radiusText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  noLocationText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
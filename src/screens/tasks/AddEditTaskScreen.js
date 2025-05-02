// src/screens/tasks/AddEditTaskScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle } from 'react-native-maps';
import Slider from '@react-native-community/slider';
import { tasksAPI } from '../../services/api';
import * as Location from 'expo-location';
const { width } = Dimensions.get('window');

export const AddEditTaskScreen = ({ navigation, route }) => {
  const { taskId, task: existingTask } = route.params || {};
  const isEditing = !!taskId;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState({
    type: 'Point',
    coordinates: [0, 0] // [longitude, latitude]
  });
  const [radius, setRadius] = useState(100);
  const [priority, setPriority] = useState(2);
  const [isRecurring, setIsRecurring] = useState(false);
  const [mapRegion, setMapRegion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing && existingTask) {
      // Populate form with existing task data
      setTitle(existingTask.title || '');
      setDescription(existingTask.description || '');
      setAddress(existingTask.address || '');
      setLocation(existingTask.location || {
        type: 'Point',
        coordinates: [0, 0]
      });
      setRadius(existingTask.radius || 100);
      setPriority(existingTask.priority || 2);
      setIsRecurring(existingTask.isRecurring || false);
      
      // Set map region based on existing location
      if (existingTask.location && existingTask.location.coordinates) {
        const [longitude, latitude] = existingTask.location.coordinates;
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      }
    } else {
      // Default to user's current location for new tasks
      getCurrentLocation();
    }
  }, [isEditing, existingTask]);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to create location-based reminders.');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      setLocation({
        type: 'Point',
        coordinates: [longitude, latitude]
      });
      
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
      
      // Get address from coordinates (reverse geocoding)
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
      
      if (addresses && addresses.length > 0) {
        const addressObj = addresses[0];
        const formattedAddress = [
          addressObj.name,
          addressObj.street,
          addressObj.city,
          addressObj.region,
          addressObj.country
        ].filter(Boolean).join(', ');
        
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get your current location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    
    setLocation({
      type: 'Point',
      coordinates: [coordinate.longitude, coordinate.latitude]
    });
    
    setMapRegion({
      ...mapRegion,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude
    });
  };

// src/screens/tasks/AddEditTaskScreen.js (continued)
const validateForm = () => {
  if (!title.trim()) {
    Alert.alert('Error', 'Please enter a task title');
    return false;
  }
  
  if (!location.coordinates || (location.coordinates[0] === 0 && location.coordinates[1] === 0)) {
    Alert.alert('Error', 'Please select a location for the task');
    return false;
  }
  
  return true;
};

const handleSaveTask = async () => {
  if (!validateForm()) return;
  
  setIsSaving(true);
  try {
    const taskData = {
      title,
      description,
      location,
      address,
      radius,
      priority,
      isRecurring
    };
    
    if (isEditing) {
      // Update existing task
      await tasksAPI.updateTask(taskId, taskData);
      Alert.alert('Success', 'Task updated successfully');
    } else {
      // Create new task
      await tasksAPI.createTask(taskData);
      Alert.alert('Success', 'Task created successfully');
    }
    
    navigation.goBack();
  } catch (error) {
    console.error('Error saving task:', error);
    Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} task. Please try again.`);
  } finally {
    setIsSaving(false);
  }
};

const renderPriorityButtons = () => (
  <View style={styles.priorityButtons}>
    <TouchableOpacity
      style={[
        styles.priorityButton,
        priority === 1 && styles.activePriorityButton,
        { backgroundColor: priority === 1 ? '#E8F5E9' : 'white' }
      ]}
      onPress={() => setPriority(1)}
    >
      <Ionicons 
        name="flag" 
        size={18} 
        color={priority === 1 ? '#4CAF50' : '#CCC'} 
      />
      <Text 
        style={[
          styles.priorityText,
          { color: priority === 1 ? '#4CAF50' : '#999' }
        ]}
      >
        Low
      </Text>
    </TouchableOpacity>
    
    <TouchableOpacity
      style={[
        styles.priorityButton,
        priority === 2 && styles.activePriorityButton,
        { backgroundColor: priority === 2 ? '#FFF3E0' : 'white' }
      ]}
      onPress={() => setPriority(2)}
    >
      <Ionicons 
        name="flag" 
        size={18} 
        color={priority === 2 ? '#FF9800' : '#CCC'} 
      />
      <Text 
        style={[
          styles.priorityText,
          { color: priority === 2 ? '#FF9800' : '#999' }
        ]}
      >
        Medium
      </Text>
    </TouchableOpacity>
    
    <TouchableOpacity
      style={[
        styles.priorityButton,
        priority === 3 && styles.activePriorityButton,
        { backgroundColor: priority === 3 ? '#FFEBEE' : 'white' }
      ]}
      onPress={() => setPriority(3)}
    >
      <Ionicons 
        name="flag" 
        size={18} 
        color={priority === 3 ? '#F44336' : '#CCC'} 
      />
      <Text 
        style={[
          styles.priorityText,
          { color: priority === 3 ? '#F44336' : '#999' }
        ]}
      >
        High
      </Text>
    </TouchableOpacity>
  </View>
);

return (
  <SafeAreaView style={styles.container}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Task' : 'New Task'}
        </Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveTask}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#0066CC" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter task title"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter task description"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={500}
            />
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter location address"
              value={address}
              onChangeText={setAddress}
            />
          </View>
          
          <View style={styles.mapContainer}>
            {isLoading ? (
              <View style={styles.loadingMap}>
                <ActivityIndicator size="large" color="#0066CC" />
              </View>
            ) : mapRegion ? (
              <MapView
                style={styles.map}
                region={mapRegion}
                onPress={handleMapPress}
              >
                <Marker
                  coordinate={{
                    latitude: mapRegion.latitude,
                    longitude: mapRegion.longitude
                  }}
                  draggable
                  onDragEnd={(e) => {
                    const { latitude, longitude } = e.nativeEvent.coordinate;
                    setLocation({
                      type: 'Point',
                      coordinates: [longitude, latitude]
                    });
                    setMapRegion({
                      ...mapRegion,
                      latitude,
                      longitude
                    });
                  }}
                >
                  <Ionicons name="location" size={30} color="#0066CC" />
                </Marker>
                <Circle
                  center={{
                    latitude: mapRegion.latitude,
                    longitude: mapRegion.longitude
                  }}
                  radius={radius}
                  fillColor="rgba(0, 102, 204, 0.1)"
                  strokeColor="rgba(0, 102, 204, 0.5)"
                  strokeWidth={1}
                />
              </MapView>
            ) : (
              <TouchableOpacity 
                style={styles.loadingMap}
                onPress={getCurrentLocation}
              >
                <Ionicons name="location" size={40} color="#CCC" />
                <Text style={styles.mapPlaceholderText}>
                  Tap to get current location
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={getCurrentLocation}
          >
            <Ionicons name="locate" size={18} color="#0066CC" />
            <Text style={styles.locationButtonText}>Use Current Location</Text>
          </TouchableOpacity>
          
          <View style={styles.radiusContainer}>
            <Text style={styles.label}>
              Notification Radius: {radius} meters
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={50}
              maximumValue={1000}
              step={10}
              value={radius}
              onValueChange={setRadius}
              minimumTrackTintColor="#0066CC"
              maximumTrackTintColor="#DDDDDD"
              thumbTintColor="#0066CC"
            />
            <View style={styles.radiusLabels}>
              <Text style={styles.radiusLabelText}>50m</Text>
              <Text style={styles.radiusLabelText}>1000m</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Task Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Priority</Text>
            {renderPriorityButtons()}
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Recurring Task</Text>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: '#DDDDDD', true: '#0066CC' }}
              thumbColor={Platform.OS === 'android' ? '#FFFFFF' : ''}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#F5F7FB',
},
keyboardView: {
  flex: 1,
},
header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 15,
  paddingVertical: 15,
  backgroundColor: 'white',
  borderBottomWidth: 1,
  borderBottomColor: '#E0E0E0',
},
headerTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#333',
},
cancelButton: {
  padding: 5,
},
cancelButtonText: {
  fontSize: 16,
  color: '#666',
},
saveButton: {
  padding: 5,
},
saveButtonText: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#0066CC',
},
scrollView: {
  flex: 1,
},
contentContainer: {
  padding: 15,
},
formSection: {
  backgroundColor: 'white',
  borderRadius: 12,
  padding: 15,
  marginBottom: 15,
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
  marginBottom: 15,
},
inputContainer: {
  marginBottom: 15,
},
label: {
  fontSize: 14,
  fontWeight: '500',
  color: '#666',
  marginBottom: 8,
},
input: {
  backgroundColor: '#F5F7FB',
  borderWidth: 1,
  borderColor: '#E0E0E0',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 16,
  color: '#333',
},
textArea: {
  minHeight: 100,
  textAlignVertical: 'top',
},
mapContainer: {
  marginBottom: 15,
  borderRadius: 8,
  overflow: 'hidden',
},
map: {
  width: '100%',
  height: 200,
},
loadingMap: {
  width: '100%',
  height: 200,
  backgroundColor: '#F5F7FB',
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#E0E0E0',
  borderRadius: 8,
  borderStyle: 'dashed',
},
mapPlaceholderText: {
  marginTop: 10,
  color: '#999',
  fontSize: 14,
},
locationButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#F5F7FB',
  borderWidth: 1,
  borderColor: '#0066CC',
  borderRadius: 8,
  paddingVertical: 10,
  marginBottom: 15,
},
locationButtonText: {
  color: '#0066CC',
  fontWeight: '500',
  marginLeft: 8,
},
radiusContainer: {
  marginBottom: 10,
},
slider: {
  width: '100%',
  height: 40,
},
radiusLabels: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: -10,
},
radiusLabelText: {
  fontSize: 12,
  color: '#999',
},
priorityButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},
priorityButton: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 10,
  marginHorizontal: 5,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#E0E0E0',
},
activePriorityButton: {
  borderWidth: 1,
},
priorityText: {
  marginLeft: 5,
  fontWeight: '500',
},
switchContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
}
});
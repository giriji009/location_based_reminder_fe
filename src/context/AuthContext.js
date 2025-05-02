// src/context/AuthContext.js
import React, { createContext, useReducer, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

// Define initial state
const initialState = {
  isLoading: true,
  userToken: null,
  user: null,
  error: null
};

// Create context
export const AuthContext = createContext(initialState);

// Define reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        userToken: action.token,
        user: action.user,
        isLoading: false
      };
    case 'SIGN_IN':
      return {
        ...state,
        userToken: action.token,
        user: action.user,
        error: null,
        isLoading: false
      };
    case 'SIGN_OUT':
      return {
        ...state,
        userToken: null,
        user: null,
        isLoading: false
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        error: action.error,
        isLoading: false
      };
    default:
      return state;
  }
};

// Create provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already logged in
  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken = null;
      let userData = null;

      try {
        userToken = await SecureStore.getItemAsync('userToken');
        const userString = await SecureStore.getItemAsync('user');
        if (userString) {
          userData = JSON.parse(userString);
        }
      } catch (e) {
        // Restoring token failed
        console.log('Failed to restore auth token', e);
      }

      // After restoring token, update state
      dispatch({ type: 'RESTORE_TOKEN', token: userToken, user: userData });
    };

    bootstrapAsync();
  }, []);

  // Define context actions
  const authContext = {
    state,
    signIn: async (data) => {
      try {
        // In a real app, you'd send data to your API here
        // For now, we'll simulate successful login
        const { token, user } = data;
        
        // Save to secure storage
        await SecureStore.setItemAsync('userToken', token);
        await SecureStore.setItemAsync('user', JSON.stringify(user));
        
        dispatch({ type: 'SIGN_IN', token, user });
      } catch (error) {
        dispatch({ 
          type: 'AUTH_ERROR', 
          error: error.message || 'Something went wrong during sign in' 
        });
      }
    },
    signOut: async () => {
      try {
        // Remove from secure storage
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('user');
        
        dispatch({ type: 'SIGN_OUT' });
      } catch (error) {
        console.log('Error signing out', error);
      }
    },
    signUp: async (data) => {
      try {
        // In a real app, you would implement the full registration flow here
        // This is a placeholder for now
        console.log('Sign up data:', data);
        
        dispatch({ 
          type: 'AUTH_ERROR', 
          error: 'Registration not implemented yet' 
        });
      } catch (error) {
        dispatch({ 
          type: 'AUTH_ERROR', 
          error: error.message || 'Something went wrong during sign up' 
        });
      }
    },
    clearError: () => {
      dispatch({ type: 'AUTH_ERROR', error: null });
    }
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};
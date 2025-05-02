// // src/navigation/AppNavigator.js
// import React, { useContext } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { AuthNavigator } from './AuthNavigator';
// import { MainNavigator } from './MainNavigator';
// import { AuthContext } from '../context/AuthContext';
// import { LoadingScreen } from '../screens/LoadingScreen';

// export const AppNavigator = () => {
//   const { state } = useContext(AuthContext);

//   // Show loading screen while checking if user is logged in
//   if (state.isLoading) {
//     return <LoadingScreen />;
//   }

//   return (
//     <NavigationContainer>
//       {state.userToken !== null ? <MainNavigator /> : <AuthNavigator />}
//     </NavigationContainer>
//   );
// };
// src/navigation/AppNavigator.js
import React, { useContext } from 'react';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { AuthContext } from '../context/AuthContext';
import { LoadingScreen } from '../screens/LoadingScreen';

export const AppNavigator = () => {
  const { state } = useContext(AuthContext);

  // Show loading screen while checking if user is logged in
  if (state.isLoading) {
    return <LoadingScreen />;
  }

  // Return the appropriate navigator based on authentication state
  return state.userToken !== null ? <MainNavigator /> : <AuthNavigator />;
};
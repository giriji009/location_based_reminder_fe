// src/screens/auth/OtpVerificationScreen.js
import React, { useState, useContext, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

export const OtpVerificationScreen = ({ navigation, route }) => {
  const { phoneNumber, flow, registerData } = route.params;
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const { signIn } = useContext(AuthContext);
  const intervalRef = useRef(null);

  // Set up timer for OTP resend
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(intervalRef.current);
          setResendDisabled(false);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      if (flow === 'registration') {
        // Complete registration with OTP
        const response = await authAPI.completeRegister({
          phoneNumber,
          otp
        });
        
        if (response.data.success) {
          const { token, user } = response.data;
          await signIn({ token, user });
          Alert.alert('Success', 'Registration completed successfully!');
        }
      } else if (flow === 'login') {
        // Complete OTP login
        const response = await authAPI.completeOtpLogin(phoneNumber, otp);
        
        if (response.data.success) {
          const { token, user } = response.data;
          await signIn({ token, user });
        }
      } else if (flow === 'resetPassword') {
        // Navigate to reset password screen with OTP
        navigation.navigate('ResetPassword', { phoneNumber, otp });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Verification failed. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      if (flow === 'registration') {
        // Resend registration OTP
        await authAPI.startRegister(registerData);
      } else if (flow === 'login') {
        // Resend login OTP
        await authAPI.startOtpLogin(phoneNumber);
      } else if (flow === 'resetPassword') {
        // Resend forgot password OTP
        await authAPI.forgotPassword(phoneNumber);
      }
      
      // Reset timer
      setTimer(60);
      setResendDisabled(true);
      
      // Start timer again
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(intervalRef.current);
            setResendDisabled(false);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
      
      Alert.alert('Success', 'OTP sent successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to resend OTP. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verification</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Verify Your Phone</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit verification code to{'\n'}
            <Text style={styles.phoneText}>{phoneNumber}</Text>
          </Text>
          
          <View style={styles.otpContainer}>
            <TextInput
              style={styles.otpInput}
              placeholder="000000"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={handleVerifyOtp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.primaryButtonText}>Verify</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            {resendDisabled ? (
              <Text style={styles.timerText}>Resend in {timer}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResendOtp} disabled={isLoading}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  phoneText: {
    fontWeight: 'bold',
    color: '#333',
  },
  otpContainer: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  otpInput: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 10,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#0066CC',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',  },
});
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import KeyboardAvoidingAnimatedView from '@/components/KeyboardAvoidingAnimatedView';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const insets = useSafeAreaInsets();

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
      
      return response.json();
    },
    onSuccess: async (data) => {
      await AsyncStorage.setItem('udaanx_user', JSON.stringify(data.user));
      router.replace('/(tabs)');
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = () => {
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    loginMutation.mutate(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <StatusBar style="dark" />
        
        <View style={{ 
          paddingTop: insets.top + 16, 
          paddingHorizontal: 16,
          flex: 1
        }}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 32
            }}
          >
            <ArrowLeft size={20} color="#6b7280" />
            <Text style={{ color: '#6b7280', marginLeft: 8, fontSize: 16 }}>
              Back to Home
            </Text>
          </TouchableOpacity>

          {/* Login Card */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 32,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8
          }}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16
              }}>
                <View style={{
                  width: 48,
                  height: 48,
                  backgroundColor: '#3b82f6',
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <BookOpen size={28} color="white" />
                </View>
                <Text style={{
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginLeft: 12
                }}>
                  UdaanX
                </Text>
              </View>
              <Text style={{
                fontSize: 24,
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: 8
              }}>
                Welcome Back!
              </Text>
              <Text style={{
                fontSize: 16,
                color: '#6b7280',
                textAlign: 'center'
              }}>
                Sign in to continue your learning journey
              </Text>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={{
                backgroundColor: '#fef2f2',
                borderWidth: 1,
                borderColor: '#fecaca',
                borderRadius: 8,
                padding: 12,
                marginBottom: 24
              }}>
                <Text style={{ color: '#dc2626', textAlign: 'center' }}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Login Form */}
            <View style={{ gap: 24 }}>
              {/* Email Field */}
              <View>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: 8
                }}>
                  Email Address
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: 'white'
                }}>
                  <Mail size={20} color="#9ca3af" />
                  <TextInput
                    style={{
                      flex: 1,
                      marginLeft: 8,
                      fontSize: 16,
                      color: '#1f2937'
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor="#9ca3af"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password Field */}
              <View>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: 8
                }}>
                  Password
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: 'white'
                }}>
                  <Lock size={20} color="#9ca3af" />
                  <TextInput
                    style={{
                      flex: 1,
                      marginLeft: 8,
                      fontSize: 16,
                      color: '#1f2937'
                    }}
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ marginLeft: 8 }}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#9ca3af" />
                    ) : (
                      <Eye size={20} color="#9ca3af" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loginMutation.isLoading}
                style={{
                  backgroundColor: '#3b82f6',
                  paddingVertical: 16,
                  borderRadius: 8,
                  opacity: loginMutation.isLoading ? 0.5 : 1
                }}
              >
                <Text style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  {loginMutation.isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 24
            }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#d1d5db' }} />
              <Text style={{
                paddingHorizontal: 16,
                color: '#6b7280',
                fontSize: 14
              }}>
                or
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#d1d5db' }} />
            </View>

            {/* Sign Up Link */}
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#6b7280', fontSize: 16 }}>
                Don't have an account?{' '}
                <TouchableOpacity
                  onPress={() => router.push('/auth/register')}
                  style={{ marginLeft: 4 }}
                >
                  <Text style={{
                    color: '#3b82f6',
                    fontWeight: '600',
                    fontSize: 16
                  }}>
                    Sign up here
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>
          </View>

          {/* Demo Credentials */}
          <View style={{
            backgroundColor: '#dbeafe',
            borderWidth: 1,
            borderColor: '#93c5fd',
            borderRadius: 8,
            padding: 16,
            marginTop: 24
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#1e40af',
              marginBottom: 8
            }}>
              Demo Credentials:
            </Text>
            <View style={{ gap: 4 }}>
              <Text style={{ color: '#1e40af', fontSize: 14 }}>
                <Text style={{ fontWeight: '600' }}>Student:</Text> student@demo.com / password123
              </Text>
              <Text style={{ color: '#1e40af', fontSize: 14 }}>
                <Text style={{ fontWeight: '600' }}>Teacher:</Text> teacher@demo.com / password123
              </Text>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
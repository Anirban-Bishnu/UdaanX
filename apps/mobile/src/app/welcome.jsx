import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Redirect } from 'expo-router';
import { BookOpen, Users, Award, TrendingUp, ArrowRight, Star, CheckCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WelcomePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('udaanx_user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // If user is logged in, redirect to tabs
  if (user && !isLoading) {
    return <Redirect href="/(tabs)" />;
  }

  // Show loading while checking user
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#6b7280' }}>Loading...</Text>
      </View>
    );
  }

  const handleGetStarted = () => {
    router.push('/auth/login');
  };

  const features = [
    {
      icon: BookOpen,
      title: "Interactive Courses",
      description: "Learn with engaging video lessons and hands-on activities"
    },
    {
      icon: Users,
      title: "Career Guidance",
      description: "Get personalized career recommendations based on your interests"
    },
    {
      icon: Award,
      title: "Certificates",
      description: "Earn certificates upon course completion"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics"
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Class 12 Student",
      content: "UdaanX helped me choose the right stream for my future. The career quiz was amazing!",
      rating: 5
    },
    {
      name: "Rajesh Kumar",
      role: "Teacher",
      content: "Great platform for creating and managing courses. My students love the interactive lessons.",
      rating: 5
    },
    {
      name: "Anita Singh",
      role: "Class 10 Student",
      content: "The courses are easy to understand and the certificates motivate me to learn more.",
      rating: 5
    }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar style="dark" />
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ 
          paddingTop: insets.top + 16, 
          paddingHorizontal: 16, 
          backgroundColor: 'white',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                backgroundColor: '#3b82f6',
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <BookOpen size={24} color="white" />
              </View>
              <Text style={{ 
                fontSize: 24, 
                fontWeight: 'bold', 
                color: '#1f2937',
                marginLeft: 12
              }}>
                UdaanX
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => router.push('/auth/login')}
                style={{ paddingHorizontal: 16, paddingVertical: 8 }}
              >
                <Text style={{ color: '#3b82f6', fontWeight: '600' }}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/auth/register')}
                style={{
                  backgroundColor: '#3b82f6',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8
                }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Hero Section */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 40, alignItems: 'center' }}>
          <Text style={{ 
            fontSize: 36, 
            fontWeight: 'bold', 
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: 8
          }}>
            Your Journey to
          </Text>
          <Text style={{ 
            fontSize: 36, 
            fontWeight: 'bold', 
            color: '#3b82f6',
            textAlign: 'center',
            marginBottom: 24
          }}>
            Success Starts Here
          </Text>
          <Text style={{ 
            fontSize: 18, 
            color: '#6b7280',
            textAlign: 'center',
            lineHeight: 26,
            marginBottom: 32,
            paddingHorizontal: 16
          }}>
            Discover your potential with personalized career guidance, interactive courses, 
            and expert mentorship designed for students in Jammu & Kashmir.
          </Text>
          <TouchableOpacity
            onPress={handleGetStarted}
            style={{
              backgroundColor: '#3b82f6',
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginRight: 8 }}>
              Get Started Today
            </Text>
            <ArrowRight size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Features Section */}
        <View style={{ backgroundColor: 'white', paddingVertical: 40, paddingHorizontal: 16 }}>
          <Text style={{ 
            fontSize: 32, 
            fontWeight: 'bold', 
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: 8
          }}>
            Why Choose UdaanX?
          </Text>
          <Text style={{ 
            fontSize: 18, 
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: 32
          }}>
            Everything you need for your educational journey
          </Text>
          <View style={{ gap: 24 }}>
            {features.map((feature, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: '#f8fafc',
                  padding: 24,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
              >
                <View style={{ marginBottom: 16 }}>
                  <feature.icon size={32} color="#3b82f6" />
                </View>
                <Text style={{ 
                  fontSize: 20, 
                  fontWeight: '600', 
                  color: '#1f2937',
                  marginBottom: 8,
                  textAlign: 'center'
                }}>
                  {feature.title}
                </Text>
                <Text style={{ 
                  fontSize: 16, 
                  color: '#6b7280',
                  textAlign: 'center',
                  lineHeight: 22
                }}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats Section */}
        <View style={{ 
          backgroundColor: '#3b82f6',
          paddingVertical: 40,
          paddingHorizontal: 16
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 8 }}>1000+</Text>
              <Text style={{ fontSize: 16, color: 'white' }}>Students Guided</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 8 }}>50+</Text>
              <Text style={{ fontSize: 16, color: 'white' }}>Courses Available</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 8 }}>95%</Text>
              <Text style={{ fontSize: 16, color: 'white' }}>Success Rate</Text>
            </View>
          </View>
        </View>

        {/* Testimonials Section */}
        <View style={{ backgroundColor: '#f9fafb', paddingVertical: 40, paddingHorizontal: 16 }}>
          <Text style={{ 
            fontSize: 32, 
            fontWeight: 'bold', 
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: 8
          }}>
            What Our Students Say
          </Text>
          <Text style={{ 
            fontSize: 18, 
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: 32
          }}>
            Real stories from real students
          </Text>
          <View style={{ gap: 24 }}>
            {testimonials.map((testimonial, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: 'white',
                  padding: 24,
                  borderRadius: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3
                }}
              >
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} color="#fbbf24" fill="#fbbf24" />
                  ))}
                </View>
                <Text style={{ 
                  fontSize: 16, 
                  color: '#6b7280',
                  marginBottom: 16,
                  lineHeight: 22
                }}>
                  "{testimonial.content}"
                </Text>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937' }}>
                    {testimonial.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#6b7280' }}>
                    {testimonial.role}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <View style={{ backgroundColor: '#f8fafc', paddingVertical: 40, paddingHorizontal: 16, alignItems: 'center' }}>
          <Text style={{ 
            fontSize: 32, 
            fontWeight: 'bold', 
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: 8
          }}>
            Ready to Start Your Journey?
          </Text>
          <Text style={{ 
            fontSize: 18, 
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: 32,
            paddingHorizontal: 16
          }}>
            Join thousands of students who have discovered their potential with UdaanX
          </Text>
          <View style={{ gap: 16, width: '100%' }}>
            <TouchableOpacity
              onPress={() => router.push('/career-quiz')}
              style={{
                backgroundColor: '#10b981',
                paddingHorizontal: 32,
                paddingVertical: 16,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CheckCircle size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
                Take Career Quiz
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/courses')}
              style={{
                backgroundColor: '#3b82f6',
                paddingHorizontal: 32,
                paddingVertical: 16,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <BookOpen size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
                Browse Courses
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
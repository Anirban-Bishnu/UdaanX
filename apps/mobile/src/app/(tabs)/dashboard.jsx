import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, User, LogOut, Target, TrendingUp, Award, Clock, Play, CheckCircle, Plus } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('udaanx_user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        router.replace('/auth/login');
      }
    } catch (error) {
      console.log('Error checking user:', error);
    }
  };

  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: progressData } = useQuery({
    queryKey: ['progress', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/progress?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch progress');
      return response.json();
    },
    enabled: !!user,
  });

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('udaanx_user');
            router.replace('/');
          }
        }
      ]
    );
  };

  const getProgressPercentage = () => {
    if (!progressData?.progress || !coursesData?.courses) return 0;
    const totalLessons = coursesData.courses.reduce((acc, course) => acc + (course.lesson_count || 2), 0);
    const completedLessons = progressData.progress.filter(p => p.completed).length;
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  const getQuizScore = () => {
    if (!progressData?.quizResults) return 0;
    const correctAnswers = progressData.quizResults.filter(q => q.is_correct).length;
    const totalQuestions = progressData.quizResults.length;
    return totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  };

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#6b7280' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar style="dark" />
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <User size={20} color="#6b7280" />
                <Text style={{ color: '#1f2937', fontWeight: '600' }}>{user.name}</Text>
                <View style={{ 
                  backgroundColor: '#dbeafe', 
                  paddingHorizontal: 8, 
                  paddingVertical: 2, 
                  borderRadius: 12 
                }}>
                  <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: '600' }}>
                    {user.role}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleLogout}>
                <LogOut size={20} color="#dc2626" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>
            Welcome back, {user.name}!
          </Text>
          <Text style={{ fontSize: 16, color: '#6b7280' }}>
            {user.role === 'student' 
              ? `Continue your learning journey. You're doing great!`
              : 'Manage your courses and help students succeed.'
            }
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <View style={{ 
              backgroundColor: 'white', 
              borderRadius: 12, 
              padding: 16, 
              flex: 1, 
              minWidth: '45%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#6b7280', marginBottom: 4 }}>
                    Overall Progress
                  </Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>
                    {getProgressPercentage()}%
                  </Text>
                </View>
                <View style={{ 
                  width: 48, 
                  height: 48, 
                  backgroundColor: '#dbeafe', 
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <TrendingUp size={24} color="#3b82f6" />
                </View>
              </View>
            </View>

            <View style={{ 
              backgroundColor: 'white', 
              borderRadius: 12, 
              padding: 16, 
              flex: 1, 
              minWidth: '45%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#6b7280', marginBottom: 4 }}>
                    Courses Enrolled
                  </Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>
                    {coursesData?.courses?.length || 0}
                  </Text>
                </View>
                <View style={{ 
                  width: 48, 
                  height: 48, 
                  backgroundColor: '#dcfce7', 
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <BookOpen size={24} color="#10b981" />
                </View>
              </View>
            </View>

            <View style={{ 
              backgroundColor: 'white', 
              borderRadius: 12, 
              padding: 16, 
              flex: 1, 
              minWidth: '45%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#6b7280', marginBottom: 4 }}>
                    Quiz Score
                  </Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>
                    {getQuizScore()}%
                  </Text>
                </View>
                <View style={{ 
                  width: 48, 
                  height: 48, 
                  backgroundColor: '#fef3c7', 
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Award size={24} color="#f59e0b" />
                </View>
              </View>
            </View>

            <View style={{ 
              backgroundColor: 'white', 
              borderRadius: 12, 
              padding: 16, 
              flex: 1, 
              minWidth: '45%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#6b7280', marginBottom: 4 }}>
                    Completed Lessons
                  </Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>
                    {progressData?.progress?.filter(p => p.completed).length || 0}
                  </Text>
                </View>
                <View style={{ 
                  width: 48, 
                  height: 48, 
                  backgroundColor: '#ede9fe', 
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <CheckCircle size={24} color="#8b5cf6" />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Career Recommendation */}
        {progressData?.careerQuizResult && (
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <View style={{ 
              backgroundColor: 'white', 
              borderRadius: 12, 
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Target size={20} color="#3b82f6" />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginLeft: 8 }}>
                  Your Career Recommendation
                </Text>
              </View>
              <View style={{ 
                backgroundColor: '#f8fafc',
                borderRadius: 8,
                padding: 16
              }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
                  {progressData.careerQuizResult.stream_name}
                </Text>
                <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 12, lineHeight: 20 }}>
                  {progressData.careerQuizResult.stream_description}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/career-quiz')}
                  style={{ alignSelf: 'flex-start' }}
                >
                  <Text style={{ color: '#3b82f6', fontWeight: '600' }}>
                    View Full Results →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Recent Courses */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View style={{ 
            backgroundColor: 'white', 
            borderRadius: 12, 
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <BookOpen size={20} color="#10b981" />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginLeft: 8 }}>
                  {user.role === 'student' ? 'Continue Learning' : 'Your Courses'}
                </Text>
              </View>
              {user.role === 'teacher' && (
                <TouchableOpacity onPress={() => router.push('/courses/create')}>
                  <Plus size={20} color="#3b82f6" />
                </TouchableOpacity>
              )}
            </View>

            <View style={{ gap: 12 }}>
              {coursesData?.courses?.slice(0, 3).map((course) => (
                <TouchableOpacity
                  key={course.id}
                  onPress={() => router.push(`/courses/${course.id}`)}
                  style={{
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 8,
                    padding: 16
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 4 }}>
                        {course.title}
                      </Text>
                      <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8, lineHeight: 18 }}>
                        {course.description}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Clock size={12} color="#6b7280" />
                        <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>
                          By {course.teacher_name || 'UdaanX Team'}
                        </Text>
                      </View>
                    </View>
                    <View style={{ marginLeft: 16 }}>
                      <View style={{
                        backgroundColor: '#3b82f6',
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}>
                        <Play size={14} color="white" />
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                          {user.role === 'student' ? 'Continue' : 'Manage'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {(!coursesData?.courses || coursesData.courses.length === 0) && (
                <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                  <BookOpen size={48} color="#d1d5db" />
                  <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 16, marginBottom: 16 }}>
                    {user.role === 'student' 
                      ? 'No courses enrolled yet. Start your learning journey!'
                      : 'No courses created yet. Create your first course!'
                    }
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push(user.role === 'student' ? '/courses' : '/courses/create')}
                    style={{
                      backgroundColor: '#3b82f6',
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      borderRadius: 8
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: '600' }}>
                      {user.role === 'student' ? 'Browse Courses' : 'Create Course'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View style={{ 
            backgroundColor: 'white', 
            borderRadius: 12, 
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 }}>
              Quick Actions
            </Text>
            <View style={{ gap: 12 }}>
              {!progressData?.careerQuizResult && user.role === 'student' && (
                <TouchableOpacity
                  onPress={() => router.push('/career-quiz')}
                  style={{
                    backgroundColor: '#3b82f6',
                    paddingVertical: 12,
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Target size={16} color="white" />
                  <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>
                    Take Career Quiz
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/courses')}
                style={{
                  backgroundColor: '#3b82f6',
                  paddingVertical: 12,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <BookOpen size={16} color="white" />
                <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>
                  {user.role === 'student' ? 'Browse Courses' : 'Manage Courses'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/progress')}
                style={{
                  backgroundColor: '#10b981',
                  paddingVertical: 12,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <TrendingUp size={16} color="white" />
                <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>
                  View Progress
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
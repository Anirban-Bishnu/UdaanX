'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, User, LogOut, Target, TrendingUp, Award, Clock, Play, CheckCircle, Plus } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('udaanx_user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      window.location.href = '/auth/login';
    }
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('udaanx_user');
    window.location.href = '/';
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                UdaanX
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => window.location.href = '/courses'}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Courses
              </button>
              <button
                onClick={() => window.location.href = '/career-quiz'}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Career Quiz
              </button>
              <button
                onClick={() => window.location.href = '/progress'}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Progress
              </button>
            </nav>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">{user.name}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-gray-600">
            {user.role === 'student' 
              ? `Continue your learning journey. You're doing great!`
              : 'Manage your courses and help students succeed.'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-gray-900">{getProgressPercentage()}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Courses Enrolled</p>
                <p className="text-2xl font-bold text-gray-900">{coursesData?.courses?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quiz Score</p>
                <p className="text-2xl font-bold text-gray-900">{getQuizScore()}%</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Lessons</p>
                <p className="text-2xl font-bold text-gray-900">
                  {progressData?.progress?.filter(p => p.completed).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Career Recommendation */}
            {progressData?.careerQuizResult && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Your Career Recommendation
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {progressData.careerQuizResult.stream_name}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {progressData.careerQuizResult.stream_description}
                  </p>
                  <button
                    onClick={() => window.location.href = '/career-quiz'}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    View Full Results →
                  </button>
                </div>
              </div>
            )}

            {/* Recent Courses */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-green-600" />
                  {user.role === 'student' ? 'Continue Learning' : 'Your Courses'}
                </h3>
                {user.role === 'teacher' && (
                  <button
                    onClick={() => window.location.href = '/courses/create'}
                    className="flex items-center text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Course
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {coursesData?.courses?.slice(0, 3).map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{course.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>By {course.teacher_name || 'UdaanX Team'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => window.location.href = `/courses/${course.id}`}
                        className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        {user.role === 'student' ? 'Continue' : 'Manage'}
                      </button>
                    </div>
                  </div>
                ))}

                {(!coursesData?.courses || coursesData.courses.length === 0) && (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      {user.role === 'student' 
                        ? 'No courses enrolled yet. Start your learning journey!'
                        : 'No courses created yet. Create your first course!'
                      }
                    </p>
                    <button
                      onClick={() => window.location.href = user.role === 'student' ? '/courses' : '/courses/create'}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {user.role === 'student' ? 'Browse Courses' : 'Create Course'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {!progressData?.careerQuizResult && user.role === 'student' && (
                  <button
                    onClick={() => window.location.href = '/career-quiz'}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white p-3 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all flex items-center justify-center"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Take Career Quiz
                  </button>
                )}
                
                <button
                  onClick={() => window.location.href = '/courses'}
                  className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  {user.role === 'student' ? 'Browse Courses' : 'Manage Courses'}
                </button>
                
                <button
                  onClick={() => window.location.href = '/progress'}
                  className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Progress
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {progressData?.progress?.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Completed: {activity.lesson_title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.course_title}
                      </p>
                    </div>
                  </div>
                ))}
                
                {(!progressData?.progress || progressData.progress.length === 0) && (
                  <p className="text-gray-600 text-sm">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, User, LogOut, ArrowLeft, TrendingUp, Award, CheckCircle, Target, BarChart3, Calendar, Clock } from 'lucide-react';

export default function ProgressPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('udaanx_user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      window.location.href = '/auth/login';
    }
  }, []);

  const { data: progressData, isLoading } = useQuery({
    queryKey: ['progress', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/progress?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch progress');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
    enabled: !!user,
  });

  const handleLogout = () => {
    localStorage.removeItem('udaanx_user');
    window.location.href = '/';
  };

  const getOverallProgress = () => {
    if (!progressData?.progress || !coursesData?.courses) return 0;
    const totalLessons = coursesData.courses.reduce((acc, course) => acc + 2, 0); // Assuming 2 lessons per course
    const completedLessons = progressData.progress.filter(p => p.completed).length;
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  const getQuizScore = () => {
    if (!progressData?.quizResults) return 0;
    const correctAnswers = progressData.quizResults.filter(q => q.is_correct).length;
    const totalQuestions = progressData.quizResults.length;
    return totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  };

  const getCompletedCoursesCount = () => {
    if (!progressData?.progress || !coursesData?.courses) return 0;
    return coursesData.courses.filter(course => {
      // Check if all lessons of this course are completed
      const courseLessons = 2; // Assuming 2 lessons per course
      const completedLessons = progressData.progress.filter(p => 
        p.completed && p.course_title === course.title
      ).length;
      return completedLessons >= courseLessons;
    }).length;
  };

  const getCourseProgress = (courseTitle) => {
    if (!progressData?.progress) return 0;
    const courseLessons = 2; // Assuming 2 lessons per course
    const completedLessons = progressData.progress.filter(p => 
      p.completed && p.course_title === courseTitle
    ).length;
    return Math.round((completedLessons / courseLessons) * 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
                onClick={() => window.location.href = '/dashboard'}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Dashboard
              </button>
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
        {/* Back Button */}
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Learning Progress</h2>
          <p className="text-gray-600">Track your learning journey and achievements</p>
        </div>

        {/* Progress Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-3xl font-bold text-gray-900">{getOverallProgress()}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getOverallProgress()}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Courses</p>
                <p className="text-3xl font-bold text-gray-900">{getCompletedCoursesCount()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              out of {coursesData?.courses?.length || 0} total
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quiz Average</p>
                <p className="text-3xl font-bold text-gray-900">{getQuizScore()}%</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {progressData?.quizResults?.length || 0} questions answered
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lessons Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {progressData?.progress?.filter(p => p.completed).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Keep up the great work!
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course Progress */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                Course Progress
              </h3>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading progress...</p>
                </div>
              ) : coursesData?.courses?.length > 0 ? (
                <div className="space-y-4">
                  {coursesData.courses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{course.title}</h4>
                        <span className="text-sm font-medium text-gray-600">
                          {getCourseProgress(course.title)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getCourseProgress(course.title)}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500">{course.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No courses enrolled yet</p>
                </div>
              )}
            </div>

            {/* Career Quiz Result */}
            {progressData?.careerQuizResult && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-600" />
                  Career Guidance Result
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Recommended Stream: {progressData.careerQuizResult.stream_name}
                    </h4>
                    <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      Completed
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {progressData.careerQuizResult.stream_description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Completed on {formatDate(progressData.careerQuizResult.completed_at)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-purple-600" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {progressData?.progress?.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.lesson_title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {activity.course_title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(activity.completed_at)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {(!progressData?.progress || progressData.progress.length === 0) && (
                  <p className="text-gray-600 text-sm text-center py-4">
                    No activity yet. Start learning to see your progress here!
                  </p>
                )}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-600" />
                Achievements
              </h3>
              <div className="space-y-3">
                {getOverallProgress() >= 25 && (
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <Award className="w-6 h-6 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Getting Started</p>
                      <p className="text-xs text-gray-500">Completed 25% of courses</p>
                    </div>
                  </div>
                )}
                
                {getOverallProgress() >= 50 && (
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Award className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Halfway There</p>
                      <p className="text-xs text-gray-500">Completed 50% of courses</p>
                    </div>
                  </div>
                )}
                
                {getCompletedCoursesCount() >= 1 && (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Award className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Course Completer</p>
                      <p className="text-xs text-gray-500">Finished your first course</p>
                    </div>
                  </div>
                )}
                
                {progressData?.careerQuizResult && (
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Target className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Career Explorer</p>
                      <p className="text-xs text-gray-500">Completed career quiz</p>
                    </div>
                  </div>
                )}

                {getOverallProgress() === 0 && !progressData?.careerQuizResult && (
                  <p className="text-gray-600 text-sm text-center py-4">
                    Start learning to unlock achievements!
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/courses'}
                  className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Courses
                </button>
                
                {!progressData?.careerQuizResult && (
                  <button
                    onClick={() => window.location.href = '/career-quiz'}
                    className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Take Career Quiz
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
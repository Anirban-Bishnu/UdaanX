'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, User, LogOut, Search, Filter, Clock, Play, Star, ArrowLeft } from 'lucide-react';

export default function CoursesPage() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    const userData = localStorage.getItem('udaanx_user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      window.location.href = '/auth/login';
    }
  }, []);

  const { data: coursesData, isLoading } = useQuery({
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

  const filteredCourses = coursesData?.courses?.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'my-courses' && user.role === 'teacher') {
      return matchesSearch && course.teacher_id === user.id;
    }
    
    return matchesSearch;
  }) || [];

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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {user.role === 'student' ? 'Available Courses' : 'Manage Courses'}
          </h2>
          <p className="text-gray-600">
            {user.role === 'student' 
              ? 'Discover new skills and advance your knowledge'
              : 'Create and manage your educational content'
            }
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Courses</option>
                  {user.role === 'teacher' && (
                    <option value="my-courses">My Courses</option>
                  )}
                </select>
              </div>

              {user.role === 'teacher' && (
                <button
                  onClick={() => window.location.href = '/courses/create'}
                  className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transition-all"
                >
                  Create Course
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Course Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-white" />
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Course
                    </span>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">4.8</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>2 lessons</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      By {course.teacher_name || 'UdaanX Team'}
                    </div>
                  </div>

                  <button
                    onClick={() => window.location.href = `/courses/${course.id}`}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {user.role === 'student' ? 'Start Learning' : 'Manage Course'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No courses found' : 'No courses available'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms or filters'
                : user.role === 'student' 
                  ? 'Check back later for new courses'
                  : 'Create your first course to get started'
              }
            </p>
            {user.role === 'teacher' && !searchTerm && (
              <button
                onClick={() => window.location.href = '/courses/create'}
                className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transition-all"
              >
                Create Your First Course
              </button>
            )}
          </div>
        )}

        {/* Featured Courses Section */}
        {!searchTerm && selectedFilter === 'all' && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Featured Courses</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <BookOpen className="w-8 h-8 mb-4" />
                <h4 className="text-lg font-semibold mb-2">AI Basics</h4>
                <p className="text-blue-100 mb-4">Learn the fundamentals of Artificial Intelligence</p>
                <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Explore
                </button>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <BookOpen className="w-8 h-8 mb-4" />
                <h4 className="text-lg font-semibold mb-2">Financial Literacy</h4>
                <p className="text-green-100 mb-4">Master personal finance and investment basics</p>
                <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors">
                  Explore
                </button>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <BookOpen className="w-8 h-8 mb-4" />
                <h4 className="text-lg font-semibold mb-2">History of India</h4>
                <p className="text-purple-100 mb-4">Discover India's rich historical heritage</p>
                <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
                  Explore
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
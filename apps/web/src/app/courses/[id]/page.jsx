'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, User, LogOut, ArrowLeft, Play, FileText, CheckCircle, Clock, Award, Target } from 'lucide-react';

export default function CoursePage({ params }) {
  const [user, setUser] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const userData = localStorage.getItem('udaanx_user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      window.location.href = '/auth/login';
    }
  }, []);

  const { data: courseData, isLoading } = useQuery({
    queryKey: ['course', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch course');
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

  const { data: quizData } = useQuery({
    queryKey: ['lesson-quiz', selectedLesson?.id],
    queryFn: async () => {
      const response = await fetch(`/api/lessons/${selectedLesson.id}/quizzes`);
      if (!response.ok) throw new Error('Failed to fetch quiz');
      return response.json();
    },
    enabled: !!selectedLesson && showQuiz,
  });

  const markLessonCompleteMutation = useMutation({
    mutationFn: async ({ userId, lessonId }) => {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, lessonId }),
      });
      if (!response.ok) throw new Error('Failed to mark lesson complete');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', user?.id] });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('udaanx_user');
    window.location.href = '/';
  };

  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
    setShowQuiz(false);
    setQuizSubmitted(false);
    setQuizAnswers({});
  };

  const handleMarkComplete = () => {
    if (user && selectedLesson) {
      markLessonCompleteMutation.mutate({
        userId: user.id,
        lessonId: selectedLesson.id
      });
    }
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleQuizAnswer = (questionId, answer) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionId]: answer
    });
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    // In a real app, you'd submit to the backend here
  };

  const isLessonCompleted = (lessonId) => {
    return progressData?.progress?.some(p => p.lesson_id === lessonId && p.completed);
  };

  const getCompletedLessonsCount = () => {
    if (!courseData?.lessons || !progressData?.progress) return 0;
    return courseData.lessons.filter(lesson => 
      progressData.progress.some(p => p.lesson_id === lesson.id && p.completed)
    ).length;
  };

  const getCourseProgress = () => {
    if (!courseData?.lessons) return 0;
    const completed = getCompletedLessonsCount();
    return Math.round((completed / courseData.lessons.length) * 100);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
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
          onClick={() => window.location.href = '/courses'}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </button>

        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{courseData?.course?.title}</h2>
              <p className="text-gray-600 mb-4">{courseData?.course?.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{courseData?.lessons?.length || 0} lessons</span>
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  <span>By {courseData?.course?.teacher_name || 'UdaanX Team'}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{getCourseProgress()}%</div>
                <div className="text-sm text-gray-600 mb-4">Course Progress</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getCourseProgress()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Lessons Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Course Content</h3>
              <div className="space-y-3">
                {courseData?.lessons?.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonSelect(lesson)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedLesson?.id === lesson.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isLessonCompleted(lesson.id)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {isLessonCompleted(lesson.id) ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <span className="text-sm font-semibold">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{lesson.title}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            {lesson.content_type === 'video' ? (
                              <Play className="w-3 h-3 mr-1" />
                            ) : (
                              <FileText className="w-3 h-3 mr-1" />
                            )}
                            {lesson.content_type}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedLesson ? (
              <div className="bg-white rounded-xl shadow-lg p-8">
                {!showQuiz ? (
                  <>
                    {/* Lesson Content */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedLesson.title}</h3>
                      
                      {/* Content Area */}
                      <div className="bg-gray-100 rounded-lg p-8 mb-6 text-center">
                        {selectedLesson.content_type === 'video' ? (
                          <div>
                            <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">Video content would be displayed here</p>
                            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg inline-block">
                              Video: {selectedLesson.title}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">PDF content would be displayed here</p>
                            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block">
                              PDF: {selectedLesson.title}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Lesson Description */}
                      <div className="prose max-w-none">
                        <p className="text-gray-600">
                          This lesson covers important concepts related to {selectedLesson.title.toLowerCase()}. 
                          Take your time to understand the material before proceeding to the quiz.
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={handleMarkComplete}
                        disabled={markLessonCompleteMutation.isLoading || isLessonCompleted(selectedLesson.id)}
                        className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {isLessonCompleted(selectedLesson.id) ? 'Completed' : 'Mark as Complete'}
                      </button>
                      
                      <button
                        onClick={handleStartQuiz}
                        className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Take Quiz
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Quiz Content */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Quiz: {selectedLesson.title}
                      </h3>
                      
                      {quizData?.quizzes && !quizSubmitted ? (
                        <div className="space-y-6">
                          {quizData.quizzes.map((question, index) => (
                            <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                              <h4 className="font-semibold text-gray-900 mb-4">
                                {index + 1}. {question.question}
                              </h4>
                              <div className="space-y-3">
                                {['a', 'b', 'c', 'd'].map((option) => (
                                  <button
                                    key={option}
                                    onClick={() => handleQuizAnswer(question.id, option)}
                                    className={`w-full text-left p-3 border rounded-lg transition-all ${
                                      quizAnswers[question.id] === option
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                  >
                                    {option.toUpperCase()}. {question[`option_${option}`]}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                          
                          <button
                            onClick={handleSubmitQuiz}
                            disabled={Object.keys(quizAnswers).length !== quizData.quizzes.length}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Submit Quiz
                          </button>
                        </div>
                      ) : quizSubmitted ? (
                        <div className="text-center py-8">
                          <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                          <h4 className="text-xl font-semibold text-gray-900 mb-2">Quiz Completed!</h4>
                          <p className="text-gray-600 mb-6">Great job! You've completed the quiz for this lesson.</p>
                          <button
                            onClick={() => setShowQuiz(false)}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                          >
                            Back to Lesson
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading quiz...</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Lesson</h3>
                <p className="text-gray-600">Choose a lesson from the sidebar to start learning</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
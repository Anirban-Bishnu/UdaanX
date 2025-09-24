'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { BookOpen, ArrowLeft, ArrowRight, CheckCircle, Clock, Target, TrendingUp, MapPin, DollarSign } from 'lucide-react';

export default function CareerQuizPage() {
  const [user, setUser] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

  useEffect(() => {
    const userData = localStorage.getItem('udaanx_user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      window.location.href = '/auth/login';
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !quizCompleted) {
      handleSubmitQuiz();
    }
  }, [timeLeft, quizCompleted]);

  const { data: questionsData, isLoading } = useQuery({
    queryKey: ['career-quiz-questions'],
    queryFn: async () => {
      const response = await fetch('/api/career-quiz/questions');
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      return response.json();
    },
  });

  const submitQuizMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch('/api/career-quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data);
      setQuizCompleted(true);
    },
    onError: (error) => {
      console.error('Quiz submission error:', error);
      alert('Failed to submit quiz. Please try again.');
    },
  });

  const handleAnswerSelect = (optionKey) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionKey;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questionsData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (!user) return;
    
    submitQuizMutation.mutate({
      userId: user.id,
      answers: answers
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / (questionsData?.questions?.length || 1)) * 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading career quiz...</p>
        </div>
      </div>
    );
  }

  if (quizCompleted && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                UdaanX
              </h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Career Guidance Results</h2>
            <p className="text-gray-600">Based on your responses, here's what we recommend for you</p>
          </div>

          {/* Results Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            {/* Recommended Stream */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Recommended Stream</h3>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
                {results.recommendedStream.name}
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {results.recommendedStream.description}
              </p>
              <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                <DollarSign className="w-4 h-4 mr-2" />
                Expected Salary: {results.recommendedStream.salary_range}
              </div>
            </div>

            {/* Colleges Section */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Top Colleges in Jammu & Kashmir
              </h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.colleges.slice(0, 9).map((college, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900">{college.name}</h5>
                    <p className="text-sm text-gray-600">{college.location}</p>
                  </div>
                ))}
              </div>
              {results.colleges.length > 9 && (
                <p className="text-center text-gray-600 mt-4">
                  And {results.colleges.length - 9} more colleges available...
                </p>
              )}
            </div>

            {/* Career Options */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Career Opportunities
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {results.careers.slice(0, 8).map((career, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <h5 className="font-semibold text-gray-900">{career.title}</h5>
                      <p className="text-sm text-gray-600">{career.salary_range}</p>
                    </div>
                  </div>
                ))}
              </div>
              {results.careers.length > 8 && (
                <p className="text-center text-gray-600 mt-4">
                  And {results.careers.length - 8} more career options available...
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/courses'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Explore Courses
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <Target className="w-5 h-5 mr-2" />
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const questions = questionsData?.questions || [];
  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              {formatTime(timeLeft)}
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                UdaanX
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(getProgressPercentage())}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {currentQ?.question}
          </h2>

          <div className="space-y-4">
            {['a', 'b', 'c', 'd'].map((optionKey) => (
              <button
                key={optionKey}
                onClick={() => handleAnswerSelect(optionKey)}
                className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                  answers[currentQuestion] === optionKey
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                    answers[currentQuestion] === optionKey
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion] === optionKey && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="font-medium">
                    {optionKey.toUpperCase()}. {currentQ?.[`option_${optionKey}`]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={answers.length !== questions.length || submitQuizMutation.isLoading}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitQuizMutation.isLoading ? 'Submitting...' : 'Submit Quiz'}
              <CheckCircle className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              disabled={!answers[currentQuestion]}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
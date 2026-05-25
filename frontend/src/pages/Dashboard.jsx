import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserButton, useUser, useAuth } from '@clerk/clerk-react';
import CategoryCard from '../components/dashboard/CategoryCard';
import { syncUser, getUserInterviews, setAuthToken } from '../services/api';
import { codingSyncUser, fetchCodingPerformance } from '../services/codingApi';

const categories = [
  {
    roleKey: 'java-developer',
    label: 'Java Developer',
    description: 'Core Java, OOP, Collections, Multithreading, Spring Boot basics.',
    difficulty: 'Fresher',
  },
  {
    roleKey: 'frontend-developer',
    label: 'Frontend Developer',
    description: 'HTML, CSS, JavaScript, React.js, Browser APIs and performance.',
    difficulty: 'Fresher',
  },
  {
    roleKey: 'full-stack',
    label: 'Full Stack',
    description: 'End-to-end system design, REST APIs, databases, and web fundamentals.',
    difficulty: 'Fresher',
  },
  {
    roleKey: 'dsa-interview',
    label: 'DSA Interview',
    description: 'Data structures, algorithms, complexity analysis, problem solving.',
    difficulty: 'Fresher',
  },
  {
    roleKey: 'hr-round',
    label: 'HR Round',
    description: 'Behavioural questions, motivation, communication and culture fit.',
    difficulty: 'General',
  },
  {
    roleKey: 'cs-fundamentals',
    label: 'CS Fundamentals',
    description: 'Operating Systems, DBMS, Computer Networks, and core concepts.',
    difficulty: 'Fresher',
  },
];

export default function Dashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ count: 0, hours: 0, problemsSolved: 0 });

  useEffect(() => {
    const init = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);

        // Sync user with BOTH backends — they each own their own users table
        await Promise.all([
          syncUser({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName,
            profileImageUrl: user.imageUrl,
          }),
          codingSyncUser({
            clerkUserId: user.id,
            name: user.fullName || user.username || 'Candidate',
            email: user.primaryEmailAddress?.emailAddress || '',
          }).catch((e) => console.warn('Coding user sync skipped:', e.message)),
        ]);

        const [interviewsRes, perfRes] = await Promise.all([
          getUserInterviews(user.id),
          fetchCodingPerformance(user.id).catch(() => ({ data: { uniqueSolved: 0 } })),
        ]);

        const interviews = interviewsRes.data || [];
        const perf = perfRes.data || {};

        const totalMinutes = interviews.reduce((sum, iv) => {
          if (!iv.endTime) return sum;
          const diff = new Date(iv.endTime) - new Date(iv.startTime);
          return sum + diff / 60000;
        }, 0);

        setStats({
          count: interviews.length,
          hours: (totalMinutes / 60).toFixed(1),
          problemsSolved: perf.uniqueSolved || 0,
        });
      } catch (err) {
        console.error('Dashboard init failed:', err);
      }
    };
    if (user) init();
  }, [user, getToken]);

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5 sticky top-0 z-50 bg-dark-900/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center text-sm font-bold">
            AI
          </div>
          <span className="text-lg font-semibold tracking-tight">InterviewAI</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/history')}
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History
          </button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Greeting */}
        <div className="mb-10">
          <p className="text-gray-400 text-sm mb-1">Welcome back,</p>
          <h1 className="text-3xl font-bold text-white">
            {user?.firstName || 'Candidate'} 👋
          </h1>
          <p className="text-gray-500 mt-2">
            Choose an interview track to start your practice session.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Interviews Taken', value: stats.count, icon: '🎯' },
            { label: 'Hours Practiced', value: stats.hours, icon: '⏱️' },
            { label: 'Problems Solved', value: stats.problemsSolved, icon: '🧩' },
            { label: 'Topics Covered', value: '6', icon: '📚' },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Coding Assessment shortcut */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-1">Coding Assessment</h2>
          <p className="text-sm text-gray-500 mb-4">
            Solve DSA problems — your performance is used to personalize the AI interviewer.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/coding')}
              className="glass-card p-5 text-left transition hover:border-accent-primary/40 hover:shadow-lg hover:shadow-accent-primary/10"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl mb-2">🧩</p>
                  <h3 className="text-lg font-semibold text-white">Browse Problems</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Solve coding problems in Java, C++, or Python.
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            <button
              onClick={() => navigate('/coding/submissions')}
              className="glass-card p-5 text-left transition hover:border-accent-primary/40 hover:shadow-lg hover:shadow-accent-primary/10"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl mb-2">📋</p>
                  <h3 className="text-lg font-semibold text-white">My Submissions</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Review your coding submissions and runtimes.
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Interview Tracks */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-1">Interview Tracks</h2>
          <p className="text-sm text-gray-500">Select a track to begin a mock interview session.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <CategoryCard key={cat.roleKey} {...cat} />
          ))}
        </div>
      </main>
    </div>
  );
}

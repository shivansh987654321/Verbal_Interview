import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserButton, useUser, useAuth } from '@clerk/clerk-react';
import { getUserInterviews, getMessages, setAuthToken } from '../services/api';

const ROLE_LABELS = {
  'java-developer': 'Java Developer',
  'frontend-developer': 'Frontend Developer',
  'full-stack': 'Full Stack',
  'dsa-interview': 'DSA Interview',
  'hr-round': 'HR Round',
  'cs-fundamentals': 'CS Fundamentals',
};

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString([], {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function durationMinutes(start, end) {
  if (!end) return null;
  const diff = new Date(end) - new Date(start);
  return Math.round(diff / 60000);
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [interviews, setInterviews] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const res = await getUserInterviews(user.id);
        console.log('==== HISTORY API RESPONSE ====');
        console.log('Full axios response:', res);
        console.log('res.data:', res.data);
        console.log('Is array?:', Array.isArray(res.data));
        console.log('Length:', res.data?.length);
        if (Array.isArray(res.data) && res.data.length > 0) {
          console.log('First interview object:', res.data[0]);
          console.log('First interview keys:', Object.keys(res.data[0]));
        }
        console.log('==============================');
        setInterviews(res.data || []);
      } catch (err) {
        console.error('History load error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user, getToken]);

  const loadMessages = async (id) => {
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedMessages([]);
      return;
    }
    try {
      const token = await getToken();
      setAuthToken(token);
      const res = await getMessages(id);
      setSelectedId(id);
      setSelectedMessages(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5 sticky top-0 z-50 bg-dark-900/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <p className="text-xs text-gray-500">Dashboard</p>
            <p className="text-sm font-semibold text-white">Interview History</p>
          </div>
        </div>
        <UserButton afterSignOutUrl="/" />
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-white mb-6">Your Interview Sessions</h1>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && interviews.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-5xl mb-4">📭</div>
            <p>No interviews yet. Start your first session from the Dashboard.</p>
          </div>
        )}

        <div className="space-y-4">
          {interviews.map((iv) => {
            const duration = durationMinutes(iv.startTime, iv.endTime);
            const isOpen = selectedId === iv.id;

            return (
              <div key={iv.id} className="glass-card overflow-hidden">
                <button
                  onClick={() => loadMessages(iv.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/3 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="glass-card p-2.5 rounded-lg border-white/10">
                      <span className="text-xl">🎯</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{ROLE_LABELS[iv.role] || iv.role}</p>
                      <p className="text-sm text-gray-500">{formatDate(iv.startTime)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        iv.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' :
                        iv.status === 'ACTIVE' ? 'bg-yellow-500/10 text-yellow-400' :
                        iv.status === 'TERMINATED' ? 'bg-red-500/10 text-red-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {iv.status}
                      </span>
                      {duration != null && (
                        <p className="text-xs text-gray-500 mt-1">{duration} min</p>
                      )}
                    </div>
                    <svg className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-white/5 px-5 py-4 space-y-3 max-h-[400px] overflow-y-auto">
                    {selectedMessages.map((msg, i) => (
                      <div key={i} className={`flex gap-2 ${msg.sender === 'USER' ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                                        ${msg.sender === 'AI' ? 'bg-accent-primary text-white' : 'bg-gray-600 text-gray-200'}`}>
                          {msg.sender === 'AI' ? 'AI' : 'U'}
                        </div>
                        <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed
                                        ${msg.sender === 'AI'
                                          ? 'bg-dark-700 text-gray-200 rounded-tl-none'
                                          : 'bg-accent-primary/20 text-gray-200 rounded-tr-none'}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

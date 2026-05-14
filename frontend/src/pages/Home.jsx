import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignInButton, SignUpButton, useAuth } from '@clerk/clerk-react';

const features = [
  {
    icon: '🎤',
    title: 'Voice Interaction',
    desc: 'Speak naturally — your answers are captured via microphone and transcribed in real time.',
  },
  {
    icon: '🤖',
    title: 'AI Interviewer',
    desc: 'Powered by Groq LLaMA-3.3, asking adaptive follow-up questions just like a real interviewer.',
  },
  {
    icon: '📊',
    title: 'Full History',
    desc: 'Every conversation saved so you can review and improve after each session.',
  },
  {
    icon: '🎯',
    title: 'Role-Specific',
    desc: 'Focused tracks: Java, Frontend, Full Stack, DSA, HR, and CS Fundamentals.',
  },
];

export default function Home() {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  if (isSignedIn) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center text-sm font-bold">
            AI
          </div>
          <span className="text-lg font-semibold tracking-tight">InterviewAI</span>
        </div>
        <div className="flex items-center gap-3">
          <SignInButton mode="modal">
            <button className="px-5 py-2 text-sm text-gray-300 hover:text-white transition-colors">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="btn-primary text-sm px-5 py-2">
              Get Started
            </button>
          </SignUpButton>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/20 rounded-full px-4 py-1.5 text-sm text-accent-primary mb-8">
          <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-pulse" />
          Powered by Groq LLaMA-3.3-70B
        </div>

        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 max-w-3xl">
          Ace Your{' '}
          <span className="text-gradient">Software Developer</span>
          {' '}Interview
        </h1>

        <p className="text-xl text-gray-400 max-w-xl mb-10 leading-relaxed">
          Practice with an AI interviewer that adapts to your answers, asks real follow-up
          questions, and simulates genuine technical and HR rounds.
        </p>

        <div className="flex items-center gap-4">
          <SignUpButton mode="modal">
            <button className="btn-primary text-base px-8 py-3.5">
              Start Practicing Free
            </button>
          </SignUpButton>
          <SignInButton mode="modal">
            <button className="px-8 py-3.5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 transition-colors text-base">
              Sign In
            </button>
          </SignInButton>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-20 max-w-5xl w-full">
          {features.map((f) => (
            <div key={f.title} className="glass-card p-5 text-left hover:glow-border transition-all duration-300">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-gray-600 text-sm border-t border-white/5">
        &copy; 2025 InterviewAI — Built for fresher software developers
      </footer>
    </div>
  );
}

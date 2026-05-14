import React from 'react';
import { useNavigate } from 'react-router-dom';

const roleConfig = {
  'java-developer': {
    icon: '☕',
    color: 'from-orange-500/20 to-amber-500/10',
    border: 'border-orange-500/20',
    badge: 'bg-orange-500/10 text-orange-400',
    topics: ['OOP', 'Collections', 'Multithreading', 'Spring'],
  },
  'frontend-developer': {
    icon: '🎨',
    color: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/20',
    badge: 'bg-blue-500/10 text-blue-400',
    topics: ['HTML/CSS', 'JavaScript', 'React', 'Browser APIs'],
  },
  'full-stack': {
    icon: '⚡',
    color: 'from-purple-500/20 to-violet-500/10',
    border: 'border-purple-500/20',
    badge: 'bg-purple-500/10 text-purple-400',
    topics: ['Frontend', 'Backend', 'Databases', 'APIs'],
  },
  'dsa-interview': {
    icon: '🧠',
    color: 'from-green-500/20 to-emerald-500/10',
    border: 'border-green-500/20',
    badge: 'bg-green-500/10 text-green-400',
    topics: ['Arrays', 'Trees', 'DP', 'Graphs'],
  },
  'hr-round': {
    icon: '🤝',
    color: 'from-pink-500/20 to-rose-500/10',
    border: 'border-pink-500/20',
    badge: 'bg-pink-500/10 text-pink-400',
    topics: ['Behaviour', 'Motivation', 'Goals', 'Culture fit'],
  },
  'cs-fundamentals': {
    icon: '💡',
    color: 'from-yellow-500/20 to-amber-500/10',
    border: 'border-yellow-500/20',
    badge: 'bg-yellow-500/10 text-yellow-400',
    topics: ['OS', 'DBMS', 'CN', 'OOP Concepts'],
  },
};

export default function CategoryCard({ roleKey, label, description, difficulty }) {
  const navigate = useNavigate();
  const cfg = roleConfig[roleKey] || {
    icon: '💼',
    color: 'from-gray-500/20 to-gray-600/10',
    border: 'border-gray-500/20',
    badge: 'bg-gray-500/10 text-gray-400',
    topics: [],
  };

  return (
    <div
      className={`relative glass-card bg-gradient-to-br ${cfg.color} ${cfg.border} p-6 cursor-pointer
                  hover:scale-[1.02] hover:glow-border transition-all duration-300 group`}
      onClick={() => navigate(`/interview/${roleKey}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{cfg.icon}</div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${cfg.badge}`}>
          {difficulty || 'Fresher'}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-gradient transition-all">
        {label}
      </h3>
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">{description}</p>

      <div className="flex flex-wrap gap-1.5">
        {cfg.topics.map((t) => (
          <span key={t} className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-gray-400">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-accent-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Start Interview
        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

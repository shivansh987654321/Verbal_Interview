import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatPanel from './ChatPanel';
import MicrophoneButton from './MicrophoneButton';
import Timer from './Timer';
import WebcamPreview from './WebcamPreview';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import { useInterview } from '../../context/InterviewContext';

const ROLE_LABELS = {
  'java-developer': 'Java Developer',
  'frontend-developer': 'Frontend Developer',
  'full-stack': 'Full Stack',
  'dsa-interview': 'DSA Interview',
  'hr-round': 'HR Round',
  'cs-fundamentals': 'CS Fundamentals',
};

export default function InterviewRoom({ role }) {
  const navigate = useNavigate();
  const { messages, isLoading, interviewActive, beginInterview, submitAnswer, finishInterview } = useInterview();
  const [started, setStarted] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);

  const handleFinalTranscript = useCallback(async (text) => {
    if (text && interviewActive) {
      await submitAnswer(text);
    }
  }, [interviewActive, submitAnswer]);

  const { isListening, liveTranscript, isSupported, startListening, stopListening } = useSpeechRecognition({
    onFinalTranscript: handleFinalTranscript,
  });

  const handleStart = async () => {
    try {
      setError(null);
      await beginInterview(role);
      setStarted(true);
      setCameraOn(true);
    } catch (err) {
      setError('Failed to start interview. Check your connection and API keys.');
      console.error(err);
    }
  };

  const handleEnd = async () => {
    if (isListening) stopListening();
    setCameraOn(false);
    setEnding(true);
    try {
      await finishInterview();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      navigate('/dashboard');
    }
  };

  // Keyboard shortcut: Space = toggle mic
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' && e.target.tagName === 'BODY' && started && interviewActive && !isLoading) {
        e.preventDefault();
        isListening ? stopListening() : startListening();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started, interviewActive, isLoading, isListening, startListening, stopListening]);

  const label = ROLE_LABELS[role] || role;

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-dark-900/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <p className="text-xs text-gray-500">Mock Interview</p>
            <p className="text-sm font-semibold text-white">{label}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {started && <Timer running={interviewActive} />}
          {started && (
            <button
              onClick={handleEnd}
              disabled={ending}
              className="btn-danger text-sm px-4 py-2"
            >
              {ending ? 'Ending...' : 'End Interview'}
            </button>
          )}
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat panel */}
        <div className="flex-1 flex flex-col border-r border-white/5">
          {/* Chat header */}
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-gray-400">Live Conversation</span>
            <span className="ml-auto text-xs text-gray-600">{messages.length} messages</span>
          </div>

          <div className="flex-1 overflow-hidden">
            <ChatPanel messages={messages} isLoading={isLoading} liveTranscript={liveTranscript} />
          </div>
        </div>

        {/* Controls panel */}
        <div className="w-80 flex flex-col">
          {!started ? (
            /* Pre-interview */
            <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
              <div className="text-center">
                <div className="text-5xl mb-4">🎯</div>
                <h2 className="text-lg font-semibold text-white mb-2">{label}</h2>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Your AI interviewer will ask one question at a time. Speak clearly into your microphone.
                </p>
              </div>

              {!isSupported && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm text-center">
                  Your browser doesn't support speech recognition. Please use Chrome or Edge.
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="glass-card p-4 text-sm text-gray-400 space-y-2 w-full">
                <p className="text-gray-300 font-medium mb-1">Tips:</p>
                <p>• Speak clearly and at normal pace</p>
                <p>• Hold mic button while speaking</p>
                <p>• Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs">Space</kbd> to toggle mic</p>
                <p>• Take time to think before answering</p>
              </div>

              <button
                onClick={handleStart}
                disabled={!isSupported}
                className="btn-primary w-full text-base py-3.5"
              >
                Start Interview
              </button>
            </div>
          ) : (
            /* In-interview controls */
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Webcam preview */}
              <div className="px-4 pt-4 pb-3">
                <WebcamPreview active={cameraOn} onToggle={() => setCameraOn((v) => !v)} />
                <p className="text-[10px] text-gray-600 text-center mt-2 uppercase tracking-wide">
                  You
                </p>
              </div>

              {/* AI status */}
              <div className="px-4 pb-3 border-b border-white/5">
                <div className="glass-card p-3 text-center">
                  <div className="text-2xl mb-1">🤖</div>
                  <p className="text-xs text-gray-400">
                    {isLoading ? 'Thinking...' : isListening ? 'Listening to you...' : 'Waiting for your answer'}
                  </p>
                </div>
              </div>

              {/* Mic area */}
              <div className="flex flex-col items-center justify-center gap-5 px-6 py-6">
                <MicrophoneButton
                  isListening={isListening}
                  isDisabled={isLoading || !interviewActive}
                  onStart={startListening}
                  onStop={stopListening}
                />

                {/* Live transcript */}
                {liveTranscript && (
                  <div className="w-full glass-card p-3 animate-fade-in">
                    <p className="text-xs text-gray-500 mb-1">Live transcript:</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{liveTranscript}</p>
                  </div>
                )}

                <p className="text-xs text-gray-600 text-center">
                  Press <kbd className="bg-white/10 px-1 py-0.5 rounded">Space</kbd> to toggle mic
                </p>
              </div>

              {/* Message count */}
              <div className="px-4 py-3 border-t border-white/5">
                <div className="text-center text-xs text-gray-600">
                  {Math.floor(messages.length / 2)} question{messages.length !== 2 ? 's' : ''} answered
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

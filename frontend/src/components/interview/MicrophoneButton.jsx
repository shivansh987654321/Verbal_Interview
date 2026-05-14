import React from 'react';

export default function MicrophoneButton({ isListening, isDisabled, onStart, onStop }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        disabled={isDisabled}
        onClick={isListening ? onStop : onStart}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center
                    transition-all duration-300 focus:outline-none
                    ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                    ${isListening
                      ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/40'
                      : 'bg-accent-primary hover:bg-accent-glow shadow-lg shadow-accent-primary/30'
                    }`}
      >
        {/* Pulse rings when listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
            <span className="absolute inset-[-8px] rounded-full border-2 border-red-400/30 animate-pulse" />
          </>
        )}

        {/* Mic Icon */}
        {isListening ? (
          <svg className="w-8 h-8 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>

      <p className={`text-xs font-medium transition-colors ${
        isListening ? 'text-red-400' : isDisabled ? 'text-gray-600' : 'text-gray-400'
      }`}>
        {isListening ? 'Tap to stop recording' : isDisabled ? 'Please wait...' : 'Tap to speak'}
      </p>
    </div>
  );
}

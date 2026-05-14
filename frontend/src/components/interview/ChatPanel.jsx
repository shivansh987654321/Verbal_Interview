import React, { useEffect, useRef } from 'react';

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function MessageBubble({ msg }) {
  const isAI = msg.sender === 'AI';

  return (
    <div className={`flex items-end gap-2 animate-slide-up ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
                       ${isAI ? 'bg-accent-primary text-white' : 'bg-gray-600 text-gray-200'}`}>
        {isAI ? 'AI' : 'U'}
      </div>

      <div className={`flex flex-col gap-1 max-w-[80%] ${isAI ? 'items-start' : 'items-end'}`}>
        <div className={isAI ? 'message-ai' : 'message-user'}>
          <p className="text-sm text-gray-100 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        </div>
        <span className="text-xs text-gray-600 px-1">{formatTime(msg.timestamp)}</span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      <div className="w-7 h-7 rounded-full bg-accent-primary flex items-center justify-center text-xs font-bold text-white">
        AI
      </div>
      <div className="message-ai">
        <div className="flex items-center gap-1.5 h-5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatPanel({ messages, isLoading, liveTranscript }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, liveTranscript]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-50">
            <div className="text-4xl">🎙️</div>
            <p className="text-gray-400 text-sm">Interview will appear here...</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}

        {isLoading && <TypingIndicator />}

        {/* Live transcript preview */}
        {liveTranscript && (
          <div className="flex flex-row-reverse items-end gap-2 animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-200">
              U
            </div>
            <div className="max-w-[80%] bg-accent-primary/10 border border-accent-primary/20 rounded-2xl rounded-tr-sm px-4 py-3 opacity-70">
              <p className="text-sm text-gray-300 italic leading-relaxed">{liveTranscript}</p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

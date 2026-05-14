import React, { useState, useEffect, useRef } from 'react';

export default function Timer({ running }) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const fmt = (n) => String(n).padStart(2, '0');
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const display = h > 0 ? `${fmt(h)}:${fmt(m)}:${fmt(s)}` : `${fmt(m)}:${fmt(s)}`;
  const isLong = seconds >= 3600;

  return (
    <div className={`flex items-center gap-2 font-mono text-sm px-3 py-1.5 rounded-lg
                     ${isLong ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-white/5 text-gray-300 border border-white/10'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${running ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
      {display}
    </div>
  );
}

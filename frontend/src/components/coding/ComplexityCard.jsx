const CURVES = {
  'O(1)':        'M0,55 L80,55',
  'O(log N)':    'M0,55 Q20,40 40,25 Q60,15 80,10',
  'O(N)':        'M0,55 L80,5',
  'O(N log N)':  'M0,55 Q30,35 55,15 Q65,8 80,3',
  'O(N²)':       'M0,55 Q40,50 60,25 Q70,10 80,2',
  'O(N^2)':      'M0,55 Q40,50 60,25 Q70,10 80,2',
  'O(2^N)':      'M0,55 Q60,54 70,30 Q75,10 80,1',
};

const COLORS = {
  'O(1)':        '#10b981',
  'O(log N)':    '#10b981',
  'O(N)':        '#f59e0b',
  'O(N log N)':  '#f59e0b',
  'O(N²)':       '#f43f5e',
  'O(N^2)':      '#f43f5e',
  'O(2^N)':      '#f43f5e',
};

const norm = (s) => s.replace(/\s/g, '').toUpperCase();

function pick(map, key, fallback) {
  if (!key) return fallback;
  const match = Object.keys(map).find((k) => norm(key) === norm(k));
  return match ? map[match] : fallback;
}

export default function ComplexityCard({ analysis }) {
  if (!analysis) return null;
  const { timeComplexity, spaceComplexity, suggestion } = analysis;
  const color = pick(COLORS, timeComplexity, '#60a5fa');
  const curve = pick(CURVES, timeComplexity, CURVES['O(N)']);

  return (
    <div className="mt-3 rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-400">Efficiency</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-200">
              <span className="text-gray-500">Time complexity: </span>
              <span className="font-semibold" style={{ color }}>{timeComplexity}</span>
            </p>
            <p className="text-gray-200">
              <span className="text-gray-500">Space complexity: </span>
              <span className="font-semibold text-gray-200">{spaceComplexity}</span>
            </p>
            {suggestion && (
              <p className="mt-2 text-xs leading-relaxed text-gray-400">
                <span className="font-medium text-gray-300">Tip: </span>{suggestion}
              </p>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <svg width="80" height="60" viewBox="0 0 80 60" className="overflow-visible">
            <line x1="0" y1="58" x2="80" y2="58" stroke="#475569" strokeWidth="1" />
            <line x1="2" y1="0" x2="2" y2="58" stroke="#475569" strokeWidth="1" />
            <path d={curve} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <p className="mt-1 text-center text-xs font-bold" style={{ color }}>{timeComplexity}</p>
        </div>
      </div>
    </div>
  );
}

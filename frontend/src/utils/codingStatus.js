export function statusLabel(status) {
  return String(status || '').replaceAll('_', ' ');
}

export function statusClasses(status) {
  if (status === 'ACCEPTED') {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  }
  if (status === 'WRONG_ANSWER') {
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }
  if (status === 'RUNTIME_ERROR' || status === 'COMPILATION_ERROR') {
    return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  }
  return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
}

export function difficultyClasses(difficulty) {
  if (difficulty === 'EASY') {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  }
  if (difficulty === 'MEDIUM') {
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }
  return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
}

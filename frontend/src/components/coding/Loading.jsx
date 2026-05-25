export default function Loading({ label = 'Loading' }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-dark-800 p-6 text-sm text-gray-400">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
      {label}...
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import Badge from '../../components/coding/Badge';
import Loading from '../../components/coding/Loading';
import { fetchProblems } from '../../services/codingApi';
import { difficultyClasses } from '../../utils/codingStatus';

export default function Problems() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProblems()
      .then((res) => setProblems(res.data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-dark-900/95 px-8 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <p className="text-xs text-gray-500">Coding Assessment</p>
            <p className="text-sm font-semibold text-white">Problems</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/coding/submissions')}
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            My Submissions
          </button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Problem set</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Browse Problems</h2>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-rose-400">
            {error}
          </div>
        )}

        {!problems && !error && <Loading label="Loading problems" />}

        {problems && (
          <section className="grid gap-4">
            {problems.length === 0 && (
              <div className="rounded-lg border border-white/10 bg-dark-800 p-6 text-center text-sm text-gray-500">
                No problems available yet.
              </div>
            )}
            {problems.map((problem) => (
              <button
                key={problem.id}
                onClick={() => navigate(`/coding/problem/${problem.id}`)}
                className="rounded-lg border border-white/10 bg-dark-800 p-5 text-left transition hover:border-accent-primary/40 hover:shadow-lg hover:shadow-accent-primary/10"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{problem.title}</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(problem.tags || []).map((tag) => (
                        <Badge key={tag} className="border-white/10 bg-white/5 text-gray-400">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge className={difficultyClasses(problem.difficulty)}>
                    {problem.difficulty}
                  </Badge>
                </div>
              </button>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

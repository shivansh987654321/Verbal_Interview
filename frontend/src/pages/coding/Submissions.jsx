import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import Badge from '../../components/coding/Badge';
import Loading from '../../components/coding/Loading';
import { fetchSubmissions } from '../../services/codingApi';
import { statusClasses, statusLabel } from '../../utils/codingStatus';

export default function Submissions() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [submissions, setSubmissions] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    fetchSubmissions(user.id)
      .then((res) => setSubmissions(res.data))
      .catch((err) => setError(err.message));
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-dark-900">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-dark-900/95 px-8 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/coding')}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <p className="text-xs text-gray-500">Coding Assessment</p>
            <p className="text-sm font-semibold text-white">My Submissions</p>
          </div>
        </div>
        <UserButton afterSignOutUrl="/" />
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">History</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Submissions</h2>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-rose-400">
            {error}
          </div>
        )}

        {!submissions && !error && <Loading label="Loading submissions" />}

        {submissions && (
          <section className="overflow-hidden rounded-lg border border-white/10 bg-dark-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/5 text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Problem</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Language</th>
                    <th className="px-5 py-3">Runtime</th>
                    <th className="px-5 py-3">Memory</th>
                    <th className="px-5 py-3">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-5 text-center text-gray-500">
                        No submissions yet.
                      </td>
                    </tr>
                  ) : (
                    submissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-white/5">
                        <td className="px-5 py-4 font-medium text-white">{submission.problemTitle}</td>
                        <td className="px-5 py-4">
                          <Badge className={statusClasses(submission.status)}>
                            {statusLabel(submission.status)}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-gray-400">{submission.language}</td>
                        <td className="px-5 py-4 text-gray-400">{submission.runtime ?? 0}s</td>
                        <td className="px-5 py-4 text-gray-400">{submission.memory ?? 0} KB</td>
                        <td className="px-5 py-4 text-gray-400">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

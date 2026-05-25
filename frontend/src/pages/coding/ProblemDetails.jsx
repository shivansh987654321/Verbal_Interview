import Editor from '@monaco-editor/react';
import { CheckCircle2, FileText, Play, Send, TerminalSquare } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import Badge from '../../components/coding/Badge';
import ComplexityCard from '../../components/coding/ComplexityCard';
import Loading from '../../components/coding/Loading';
import { fetchProblem, runCode, submitCode } from '../../services/codingApi';
import { difficultyClasses, statusClasses, statusLabel } from '../../utils/codingStatus';

const languages = [
  { value: 'java',   label: 'Java'   },
  { value: 'cpp',    label: 'C++'    },
  { value: 'python', label: 'Python' },
];

function backendUserPayload(user) {
  return {
    clerkUserId: user?.id,
    name: user?.fullName || user?.username || 'Candidate',
    email: user?.primaryEmailAddress?.emailAddress || '',
  };
}

export default function ProblemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('java');
  const [code, setCode] = useState('');
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [loadingAction, setLoadingAction] = useState('');
  const [error, setError] = useState('');

  const [leftPct, setLeftPct] = useState(40);
  const [editorPct, setEditorPct] = useState(65);
  const containerRef = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => {
    fetchProblem(id)
      .then((res) => {
        setProblem(res.data);
        setCode(res.data?.starterCode || '');
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const editorLanguage = useMemo(() => {
    if (language === 'cpp' || language === 'c') return 'cpp';
    if (language === 'python') return 'python';
    return 'java';
  }, [language]);

  function changeLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    // Reset to backend starter when switching languages
    setCode(problem?.starterCode || '');
  }

  async function execute(kind) {
    setError('');
    setLoadingAction(kind);
    setRunResult(null);
    setSubmitResult(null);
    const payload = {
      ...backendUserPayload(user),
      problemId: Number(id),
      language,
      code,
      input: '',
    };
    try {
      if (kind === 'run') {
        const res = await runCode(payload);
        setRunResult(res.data);
      } else {
        const res = await submitCode(payload);
        setSubmitResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoadingAction('');
    }
  }

  function startHDrag(e) {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    function onMove(ev) {
      const rect = container.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.min(Math.max(pct, 20), 65));
    }
    function onUp() {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function startVDrag(e) {
    e.preventDefault();
    const right = rightRef.current;
    if (!right) return;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'row-resize';
    function onMove(ev) {
      const rect = right.getBoundingClientRect();
      const pct = ((ev.clientY - rect.top) / rect.height) * 100;
      setEditorPct(Math.min(Math.max(pct, 25), 80));
    }
    function onUp() {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Top nav */}
      <nav className="flex items-center justify-between border-b border-white/5 bg-dark-900/95 px-6 py-3">
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
            <p className="text-sm font-semibold text-white">{problem ? `${problem.id}. ${problem.title}` : 'Problem'}</p>
          </div>
        </div>
        <UserButton afterSignOutUrl="/" />
      </nav>

      {error && !problem && (
        <div className="m-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-rose-400">
          {error}
        </div>
      )}

      {!problem && !error && (
        <div className="p-6">
          <Loading label="Loading problem" />
        </div>
      )}

      {problem && (
        <div
          ref={containerRef}
          className="flex h-[calc(100vh-58px)] overflow-hidden p-2 text-slate-100"
        >
          {/* Left: description */}
          <section
            style={{ width: `${leftPct}%` }}
            className="min-h-0 flex-shrink-0 overflow-hidden rounded-lg border border-[#333333] bg-[#1f1f1f]"
          >
            <div className="flex h-12 items-center gap-4 border-b border-[#333333] bg-[#303030] px-4">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <FileText size={16} className="text-blue-400" />
                Description
              </span>
            </div>
            <div className="h-[calc(100%-48px)] space-y-6 overflow-y-auto p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-white">
                  {problem.id}. {problem.title}
                </h2>
                <Badge className={difficultyClasses(problem.difficulty)}>
                  {problem.difficulty}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(problem.tags || []).map((tag) => (
                  <Badge key={tag} className="border-[#444444] bg-[#303030] text-slate-200">
                    {tag}
                  </Badge>
                ))}
              </div>

              <p className="whitespace-pre-line text-[15px] leading-7 text-slate-100">
                {problem.description}
              </p>

              <div>
                <h3 className="font-semibold text-white">Examples</h3>
                <pre className="mt-3 overflow-auto rounded-md bg-[#121212] p-4 text-sm leading-6 text-slate-100">
                  {problem.examples}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-white">Constraints</h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-300">
                  {problem.constraintsText}
                </p>
              </div>
            </div>
          </section>

          {/* Horizontal drag divider */}
          <div
            onMouseDown={startHDrag}
            className="group mx-0.5 flex w-2 flex-shrink-0 cursor-col-resize items-center justify-center"
          >
            <div className="h-full w-0.5 rounded bg-[#333333] transition-colors group-hover:bg-blue-500/60" />
          </div>

          {/* Right: editor + result */}
          <section ref={rightRef} className="flex flex-1 flex-col overflow-hidden">
            {/* Editor pane */}
            <div
              style={{ height: `${editorPct}%` }}
              className="flex-shrink-0 overflow-hidden rounded-lg border border-[#333333] bg-[#1f1f1f]"
            >
              <div className="flex h-12 flex-wrap items-center justify-between gap-3 border-b border-[#333333] bg-[#303030] px-4">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <TerminalSquare size={17} className="text-emerald-400" />
                  Code
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="h-9 rounded-md border border-[#4a4a4a] bg-[#262626] px-3 text-sm font-medium text-slate-100 outline-none"
                  >
                    {languages.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={loadingAction !== ''}
                    onClick={() => execute('run')}
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-[#4a4a4a] bg-[#262626] px-4 text-sm font-semibold text-slate-100 hover:bg-[#363636] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Play size={16} />
                    {loadingAction === 'run' ? 'Running' : 'Run'}
                  </button>
                  <button
                    type="button"
                    disabled={loadingAction !== ''}
                    onClick={() => execute('submit')}
                    className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send size={16} />
                    {loadingAction === 'submit' ? 'Submitting' : 'Submit'}
                  </button>
                </div>
              </div>

              <Editor
                height="calc(100% - 48px)"
                language={editorLanguage}
                value={code}
                theme="vs-dark"
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineHeight: 22,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12 },
                }}
              />
            </div>

            {/* Vertical drag divider */}
            <div
              onMouseDown={startVDrag}
              className="group my-0.5 flex h-2 flex-shrink-0 cursor-row-resize items-center justify-center"
            >
              <div className="h-0.5 w-full rounded bg-[#333333] transition-colors group-hover:bg-blue-500/60" />
            </div>

            {/* Test result pane */}
            <div className="grid min-h-0 flex-1 overflow-hidden rounded-lg border border-[#333333] bg-[#1f1f1f] md:grid-cols-[0.95fr_1.05fr]">
              <div className="min-h-0 border-b border-[#333333] md:border-b-0 md:border-r">
                <div className="flex h-12 items-center gap-2 border-b border-[#333333] bg-[#303030] px-4 text-sm font-semibold text-white">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  Testcase
                </div>
                <div className="space-y-3 p-4">
                  <div className="inline-flex rounded-md bg-[#303030] px-3 py-1 text-xs font-semibold text-slate-200">Case 1</div>
                  <pre className="h-32 overflow-auto rounded-md bg-[#121212] p-3 text-sm leading-6 text-slate-100">
                    {formatVisibleExample(problem.examples)}
                  </pre>
                </div>
              </div>
              <div className="min-h-0">
                <div className="flex h-12 items-center gap-2 border-b border-[#333333] bg-[#303030] px-4 text-sm font-semibold text-white">
                  <TerminalSquare size={16} className="text-emerald-400" />
                  Test Result
                </div>
                <div className="h-[calc(100%-48px)] overflow-y-auto p-4">
                  {error && <p className="text-sm text-rose-400">{error}</p>}
                  {runResult && <ResultPanel result={runResult} />}
                  {submitResult && <SubmissionPanel submission={submitResult} />}
                  {!runResult && !submitResult && !error && (
                    <p className="mt-10 text-center text-sm text-slate-500">Run code to see the result.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function ErrorBlock({ label, text, color = 'red' }) {
  const styles = {
    red:    { label: 'text-red-400',     pre: 'bg-[#1a0808] border border-red-900/50 text-red-300' },
    amber:  { label: 'text-amber-400',   pre: 'bg-[#1a1200] border border-amber-900/50 text-amber-200' },
    yellow: { label: 'text-yellow-400',  pre: 'bg-[#171200] border border-yellow-900/50 text-yellow-200' },
    green:  { label: 'text-emerald-400', pre: 'bg-[#121212] text-slate-100' },
  };
  const s = styles[color] || styles.red;
  if (!text || !text.trim()) return null;
  return (
    <div className="space-y-1">
      <p className={`text-xs font-semibold uppercase tracking-wide ${s.label}`}>{label}</p>
      <pre className={`max-h-48 overflow-auto rounded-md p-3 text-sm leading-6 ${s.pre}`}>
        {text.trim()}
      </pre>
    </div>
  );
}

function ResultPanel({ result }) {
  const hasError = result.compileOutput || result.stderr;
  return (
    <div className="space-y-3">
      <Badge className={statusClasses(result.status)}>{statusLabel(result.status)}</Badge>
      <ErrorBlock label="Compilation Error" text={result.compileOutput} color="red" />
      <ErrorBlock label="Runtime Error / stderr" text={result.stderr} color="amber" />
      {result.stdout ? (
        <ErrorBlock label="Output" text={result.stdout} color="green" />
      ) : !hasError ? (
        <pre className="max-h-36 overflow-auto rounded-md bg-[#121212] p-3 text-sm text-slate-500">
          {result.message || 'No output'}
        </pre>
      ) : null}
      <p className="text-xs text-slate-500">
        Runtime: {result.runtime ?? 0}s &nbsp;|&nbsp; Memory: {result.memory ?? 0} KB
      </p>
    </div>
  );
}

function SubmissionPanel({ submission }) {
  const isError = submission.status !== 'ACCEPTED';
  return (
    <div className="space-y-3">
      <Badge className={statusClasses(submission.status)}>{statusLabel(submission.status)}</Badge>
      {submission.errorOutput ? (
        <ErrorBlock
          label={
            submission.status === 'COMPILATION_ERROR' ? 'Compilation Error' :
            submission.status === 'WRONG_ANSWER'      ? 'Wrong Answer — diff' :
            submission.status === 'RUNTIME_ERROR'     ? 'Runtime Error' : 'Error'
          }
          text={submission.errorOutput}
          color={
            submission.status === 'WRONG_ANSWER' ? 'yellow' :
            submission.status === 'RUNTIME_ERROR' ? 'amber' : 'red'
          }
        />
      ) : isError ? (
        <p className="rounded-md border border-slate-700 bg-[#1a1a1a] p-3 text-sm text-slate-400">
          {submission.status === 'TIME_LIMIT_EXCEEDED'
            ? 'Your solution exceeded the time limit. Try optimising the time complexity.'
            : submission.status === 'RUNTIME_ERROR'
            ? 'Your solution crashed during execution.'
            : 'No additional details available.'}
        </p>
      ) : null}
      <p className="text-xs text-slate-500">
        Runtime: {submission.runtime ?? 0}s &nbsp;|&nbsp; Memory: {submission.memory ?? 0} KB
      </p>
      <ComplexityCard analysis={submission.complexityAnalysis} />
    </div>
  );
}

function formatVisibleExample(examples = '') {
  const match = examples.match(/Input:\s*([\s\S]*?)\s*Output:/i);
  return match ? match[1].trim() : examples;
}

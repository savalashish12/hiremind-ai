import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../services/api";

const MockSessionPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get(`/interview/report/${id}`);
        setReport(res.data.data || res.data);
      } catch { setReport(null); }
      finally { setLoading(false); }
    })();
  }, [id]);
  if (loading) return <div className="p-6 text-slate-400 text-sm animate-pulse">Loading session...</div>;
  if (!report) return <div className="p-6 text-sm text-slate-400">Session not found. <Link to="/candidate/mock-interview/history" className="text-blue-400 hover:underline">Back to history</Link></div>;
  const questions = report.questions || [];
  const answers = report.answers || {};
  return (
    <div className="space-y-4">
      <Link to="/candidate/mock-interview/history" className="text-xs text-slate-400 hover:text-white">← History</Link>
      <h1 className="text-2xl font-extrabold text-white">{report.jobRole}</h1>
      <p className="text-xs text-slate-400">{report.overallRating} · {report.recommendation}</p>
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        {[["Communication", report.communicationScore], ["Technical", report.technicalScore], ["Confidence", report.confidenceScore]].map(([l, v]) => (
          <div key={l} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4"><p className="text-xl font-extrabold text-white">{v}</p><p className="text-slate-500 mt-1">{l}</p></div>
        ))}
      </div>
      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 text-xs">
            <p className="font-bold text-white">Q{i + 1}. {q.question || q}</p>
            <p className="text-slate-400 mt-2">Your answer: {answers[i] ?? answers[q.id] ?? "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MockSessionPage;

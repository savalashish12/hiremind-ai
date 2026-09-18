import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";

const MockHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/interview/history");
        if (res.data.success) setHistory(res.data.data);
      } catch { toast.error("Failed to load history"); }
      finally { setLoading(false); }
    })();
  }, []);
  if (loading) return <div className="p-6 text-slate-400 text-sm animate-pulse">Loading mock history...</div>;
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-white">Mock Interview History ({history.length})</h1>
        <Link to="/candidate/mock-interview" className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl">+ New Test</Link>
      </div>
      {history.length === 0 ? <p className="text-xs text-slate-500">No sessions yet.</p> :
        <div className="grid gap-3">
          {history.map((h) => (
            <Link key={h.id} to={`/candidate/mock-interview/${h.id}`} className="bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-4 text-xs flex justify-between gap-3">
              <div><p className="font-bold text-white">{h.jobRole}</p><p className="text-slate-500 mt-0.5">{new Date(h.createdAt).toLocaleString()} · {h.overallRating}</p></div>
              <span className="text-blue-400 font-bold shrink-0">View →</span>
            </Link>
          ))}
        </div>}
    </div>
  );
};

export default MockHistoryPage;

import { useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

const ComparePage = () => {
  const [ids, setIds] = useState({ a: "", b: "", jobId: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const compare = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      // Backend contract: { candidateId1, candidateId2, jobId } (candidate *user* IDs)
      const res = await API.post("/ai/compare", { candidateId1: ids.a.trim(), candidateId2: ids.b.trim(), jobId: ids.jobId.trim() });
      setResult(res.data);
      toast.success("Comparison generated!");
    } catch (err) { toast.error(err.response?.data?.message || "Compare failed — check the IDs"); }
    finally { setLoading(false); }
  };
  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-white">Compare Candidates</h1>
      <p className="text-xs text-slate-400">Side-by-side AI comparison. Tip: pick two applicants on the same job in <span className="text-slate-200 font-semibold">Applicants</span> (checkbox compare), or paste two candidate user IDs + the job ID below.</p>
      <form onSubmit={compare} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <input value={ids.a} onChange={(e) => setIds({ ...ids, a: e.target.value })} placeholder="Candidate user ID A" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500" />
        <input value={ids.b} onChange={(e) => setIds({ ...ids, b: e.target.value })} placeholder="Candidate user ID B" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500" />
        <input value={ids.jobId} onChange={(e) => setIds({ ...ids, jobId: e.target.value })} placeholder="Job ID" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500" />
        <button disabled={loading} className="sm:col-span-3 bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-2.5 rounded-xl transition-colors">{loading ? "Comparing..." : "Compare"}</button>
      </form>
      {result && <pre className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap">{typeof result === "string" ? result : JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
};

export default ComparePage;

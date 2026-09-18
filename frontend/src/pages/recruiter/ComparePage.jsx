import { useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

const ComparePage = () => {
  const [ids, setIds] = useState({ a: "", b: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const compare = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await API.post("/ai/compare", { applicationId1: ids.a, applicationId2: ids.b });
      setResult(res.data);
    } catch (err) { toast.error(err.response?.data?.message || "Compare failed — paste two Application IDs"); }
    finally { setLoading(false); }
  };
  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-white">Compare Candidates</h1>
      <p className="text-xs text-slate-400">Side-by-side AI comparison from Applicant IDs (copy IDs from Applicants page).</p>
      <form onSubmit={compare} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row gap-3 text-xs">
        <input value={ids.a} onChange={(e) => setIds({ ...ids, a: e.target.value })} placeholder="Application ID A" className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500" />
        <input value={ids.b} onChange={(e) => setIds({ ...ids, b: e.target.value })} placeholder="Application ID B" className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500" />
        <button disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl">{loading ? "..." : "Compare"}</button>
      </form>
      {result && <pre className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap">{typeof result === "string" ? result : JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
};

export default ComparePage;

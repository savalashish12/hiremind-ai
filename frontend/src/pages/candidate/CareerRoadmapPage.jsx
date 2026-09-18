import { useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";
import { Compass, FileText } from "lucide-react";

const CareerRoadmapPage = () => {
  const [targetRole, setTargetRole] = useState("");
  const [tips, setTips] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        API.get("/ai/resume-suggestions"),
        API.get(`/ai/career-roadmap?targetRole=${encodeURIComponent(targetRole)}`),
      ]);
      setTips(r1.data); setRoadmap(r2.data);
      toast.success("AI insights generated!");
    } catch { toast.error("Upload your resume first to generate insights."); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-white">AI Career Roadmap</h1>
      <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="flex-1">
          <label className="block text-[11px] text-slate-400 font-bold uppercase mb-2">Target role</label>
          <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Senior Frontend Developer" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
        </div>
        <button onClick={generate} disabled={loading || !targetRole} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-sm"> {loading ? "Analyzing..." : "Generate Path"}</button>
      </div>
      {loading && <div className="h-48 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse" />}
      {!loading && tips && roadmap && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-pink-400 flex items-center gap-2"><FileText size={15} /> Resume Tips</h3>
            {(tips.missingSkills || []).length > 0 && <div><p className="text-slate-400 font-bold uppercase text-[10px] mb-1">Missing skills</p><div className="flex flex-wrap gap-1.5">{tips.missingSkills.map((s, i) => <span key={i} className="bg-pink-500/10 text-pink-300 border border-pink-500/20 px-2 py-0.5 rounded">{s}</span>)}</div></div>}
            {(tips.resumeEnhancementTips || []).length > 0 && <ul className="list-disc pl-4 text-slate-400 space-y-1">{tips.resumeEnhancementTips.map((t, i) => <li key={i}>{t}</li>)}</ul>}
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-blue-400 flex items-center gap-2"><Compass size={15} /> Growth Steps</h3>
            {(roadmap.nextSkills || []).length > 0 && <div><p className="text-slate-400 font-bold uppercase text-[10px] mb-1">Next skills</p><div className="flex flex-wrap gap-1.5">{roadmap.nextSkills.map((s, i) => <span key={i} className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded">{s}</span>)}</div></div>}
            <div className="pl-4 border-l border-slate-800 space-y-3">{(roadmap.growthSteps || []).map((st, i) => <div key={i}><p className="font-bold text-slate-200">{st.title}</p><p className="text-slate-500">{st.description}</p></div>)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerRoadmapPage;

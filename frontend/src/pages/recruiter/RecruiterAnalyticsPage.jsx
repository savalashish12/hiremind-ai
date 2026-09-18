import { useEffect, useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";

const RecruiterAnalyticsPage = () => {
  const [a, setA] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/recruiter/dashboard/stats");
        setA(res.data.data || res.data);
      } catch { toast.error("Failed to load analytics"); }
      finally { setLoading(false); }
    })();
  }, []);
  if (loading) return <div className="p-6 text-slate-400 text-sm animate-pulse">Loading analytics...</div>;
  if (!a) return <div className="p-6 text-sm text-slate-500">No data.</div>;
  const pie = (a.applicationsByStage || []).map((x) => ({ name: x.stage, value: x.count }));
  const colors = ["#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#14b8a6", "#10b981"];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-white">Recruiter Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        {[["Jobs Posted", a.totalJobsPosted], ["Applications", a.totalApplications], ["Interviews", a.totalInterviewsScheduled], ["Hired", a.totalHired]].map(([l, v]) => (
          <div key={l} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5"><p className="text-2xl font-extrabold text-white">{v ?? 0}</p><p className="text-slate-500 mt-1">{l} · success {a.hiringSuccessRate ?? 0}%</p></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5"><h3 className="text-sm font-bold text-white mb-4">Monthly Trends</h3><div className="h-[240px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={a.monthlyTrends || []}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} /><YAxis stroke="#64748b" tick={{ fontSize: 10 }} /><Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }} /><Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} /><Line type="monotone" dataKey="hires" stroke="#10b981" strokeWidth={2} /></LineChart></ResponsiveContainer></div></div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5"><h3 className="text-sm font-bold text-white mb-4">Pipeline Stages</h3><div className="h-[240px]">{pie.length === 0 ? <p className="text-xs text-slate-500 text-center py-20">No data.</p> : <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>{pie.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }} /></PieChart></ResponsiveContainer>}</div></div>
      </div>
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5"><h3 className="text-sm font-bold text-white mb-4">Top Jobs</h3><div className="h-[240px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={a.topJobs || []}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="jobTitle" stroke="#64748b" tick={{ fontSize: 9 }} /><YAxis stroke="#64748b" tick={{ fontSize: 10 }} /><Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }} /><Bar dataKey="applicationCount" fill="#a855f7" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
    </div>
  );
};

export default RecruiterAnalyticsPage;

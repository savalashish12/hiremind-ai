import { useEffect, useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const AdminOverviewPage = () => {
  const [a, setA] = useState(null);
  useEffect(() => { (async () => { try { const res = await API.get("/admin/analytics"); setA(res.data); } catch { toast.error("Failed to load"); } })(); }, []);
  if (!a) return <div className="p-6 text-slate-400 text-sm animate-pulse">Loading overview...</div>;
  const pie = [{ name: "Candidates", value: (a.totalUsers || 0) - (a.activeRecruiters || 0) - 1 }, { name: "Recruiters", value: a.activeRecruiters || 0 }, { name: "Admin", value: 1 }];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-white">Platform Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
        {[["Total Users", a.totalUsers, "text-blue-400"], ["Recruiters", a.activeRecruiters, "text-purple-400"], ["Candidates", a.totalCandidates ?? (a.totalUsers - a.activeRecruiters - 1), "text-emerald-400"], ["Jobs", a.totalJobs, "text-yellow-400"], ["Applications", a.totalApplications, "text-pink-400"]].map(([l, v, c]) => (
          <div key={l} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5"><p className={`text-2xl font-black ${c}`}>{v}</p><p className="text-slate-500 uppercase text-[10px] font-bold mt-1">{l}</p></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5"><h3 className="text-sm font-bold text-white mb-4">User Ratio</h3><div className="h-[260px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pie} dataKey="value" nameKey="name" outerRadius={85} label={{ fill: "#94a3b8", fontSize: 10 }}>{pie.map((_, i) => <Cell key={i} fill={["#3b82f6", "#a855f7", "#ef4444"][i]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }} /></PieChart></ResponsiveContainer></div></div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5"><h3 className="text-sm font-bold text-white mb-4">Records</h3><div className="h-[260px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={[{ name: "Users", count: a.totalUsers }, { name: "Jobs", count: a.totalJobs }, { name: "Applications", count: a.totalApplications }]}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} /><YAxis stroke="#64748b" tick={{ fontSize: 10 }} /><Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }} /><Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;

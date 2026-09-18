import { useEffect, useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AdminAnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [pay, setPay] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const [r1, r2] = await Promise.allSettled([API.get("/admin/analytics"), API.get("/payment/fake/admin/stats")]);
        if (r1.status === "fulfilled") setStats(r1.value.data);
        if (r2.status === "fulfilled") setPay(r2.value.data.stats);
      } catch { toast.error("Failed"); }
    })();
  }, []);
  if (!stats) return <div className="p-6 text-slate-400 text-sm animate-pulse">Loading analytics...</div>;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-white">Platform Analytics</h1>
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5"><h3 className="text-sm font-bold text-white mb-4">Database Volume</h3><div className="h-[260px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={[{ name: "Users", count: stats.totalUsers }, { name: "Jobs", count: stats.totalJobs }, { name: "Applications", count: stats.totalApplications }]}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} /><YAxis stroke="#64748b" tick={{ fontSize: 10 }} /><Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }} /><Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
      {pay && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {[["Revenue", `₹${pay.totalRevenue?.toFixed?.(2) ?? pay.totalRevenue}`], ["Active Subs", pay.activeSubscriptions], ["Pro", pay.planDistribution?.PRO], ["Premium", pay.planDistribution?.PREMIUM]].map(([l, v]) => (
            <div key={l} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5"><p className="text-xl font-extrabold text-white">{v}</p><p className="text-slate-500 mt-1">{l}</p></div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;

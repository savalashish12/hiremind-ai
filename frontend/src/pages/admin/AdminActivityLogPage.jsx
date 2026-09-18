import { useEffect, useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";
import { Search, Download } from "lucide-react";

const ACTIONS = ["ALL", "LOGIN", "REGISTER", "JOB_CREATED", "JOB_DELETED", "APPLICATION_SUBMITTED", "INTERVIEW_SCHEDULED", "OFFER_LETTER_GENERATED", "USER_SUSPENDED", "USER_DELETED", "PAYMENT_SUBMITTED", "PAYMENT_APPROVED", "PAYMENT_REJECTED"];

const AdminActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [pg, setPg] = useState({ total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("ALL");
  const fetchLogs = async (page = 1) => {
    try {
      const params = { page, limit: 25 };
      if (action !== "ALL") params.action = action;
      if (search.trim()) params.search = search.trim();
      const res = await API.get("/admin/activity-logs", { params });
      if (Array.isArray(res.data)) { setLogs(res.data); setPg({ total: res.data.length, page: 1, pages: 1 }); }
      else { setLogs(res.data.logs || []); setPg(res.data.pagination || { total: 0, page: 1, pages: 1 }); }
    } catch { toast.error("Failed to load logs"); }
  };
  useEffect(() => { fetchLogs(1); }, []);
  const exportCsv = () => {
    if (!logs.length) return toast.error("Nothing to export");
    const header = ["Timestamp", "User", "Email", "Role", "Action", "Entity", "Details"];
    const rows = logs.map((l) => [new Date(l.createdAt).toLocaleString(), l.user?.fullName || "", l.user?.email || l.userId, l.user?.role || "", l.action, l.entity || "", `"${String(l.details || "").replace(/"/g, '""')}"`]);
    const blob = new Blob([[header.join(","), ...rows.map((r) => r.join(","))].join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `activity-log-p${pg.page}.csv`; a.click();
    toast.success("Exported!");
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <div><h1 className="text-2xl font-extrabold text-white">Activity Log</h1><p className="text-xs text-slate-500">{pg.total} events · page {pg.page}/{pg.pages || 1}</p></div>
        <button onClick={exportCsv} className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 text-xs font-bold px-4 py-2 rounded-xl"><Download size={13} /> CSV</button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchLogs(1)} placeholder="Search email, action..." className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500" /></div>
        <select value={action} onChange={(e) => setAction(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200">{ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}</select>
        <button onClick={() => fetchLogs(1)} className="bg-blue-600 text-white text-xs font-bold px-5 py-2 rounded-xl">Filter</button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-800 max-h-[550px] overflow-y-auto">
        <table className="w-full text-left text-xs min-w-[750px]">
          <thead className="sticky top-0"><tr className="bg-slate-950 text-slate-400"><th className="p-4">Time</th><th className="p-4">User</th><th className="p-4">Action</th><th className="p-4">Details</th></tr></thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {logs.map((l) => <tr key={l.id}><td className="p-4 font-mono text-[10px] text-slate-500 whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td><td className="p-4"><p className="font-bold text-slate-200">{l.user?.fullName || "—"}</p><p className="text-[10px] text-slate-500">{l.user?.email || ""}</p></td><td className="p-4"><span className="text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700">{l.action}</span></td><td className="p-4 max-w-[320px]">{l.details}</td></tr>)}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between text-xs text-slate-400"><span>{pg.total} total</span><div className="flex gap-2"><button disabled={pg.page <= 1} onClick={() => fetchLogs(pg.page - 1)} className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl disabled:opacity-40">← Prev</button><button disabled={pg.page >= (pg.pages || 1)} onClick={() => fetchLogs(pg.page + 1)} className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl disabled:opacity-40">Next →</button></div></div>
    </div>
  );
};

export default AdminActivityLogPage;

import { useEffect, useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

const InterviewsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/recruiter/interviews/calendar");
        setItems(res.data.data || res.data.interviews || res.data || []);
      } catch { toast.error("Failed to load interviews"); }
      finally { setLoading(false); }
    })();
  }, []);
  if (loading) return <div className="p-6 text-slate-400 text-sm animate-pulse">Loading interviews...</div>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-white">Scheduled Interviews ({Array.isArray(items) ? items.length : 0})</h1>
      {(Array.isArray(items) ? items : []).length === 0 ? <p className="text-xs text-slate-500">No interviews scheduled. Schedule from Applicants or Pipeline.</p> :
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead><tr className="bg-slate-950 text-slate-400"><th className="p-4">Candidate</th><th className="p-4">Job</th><th className="p-4">Date/Time</th><th className="p-4">Link</th><th className="p-4">Notes</th></tr></thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {(Array.isArray(items) ? items : []).map((it) => (
                <tr key={it.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-bold text-white">{it.candidate?.fullName}<p className="text-[10px] text-slate-500 font-normal">{it.candidate?.email}</p></td>
                  <td className="p-4">{it.job?.title}</td>
                  <td className="p-4">{it.interviewDate ? new Date(it.interviewDate).toLocaleDateString() : ""} {it.interviewTime || ""}</td>
                  <td className="p-4">{it.interviewLink ? <a href={it.interviewLink} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Join 🔗</a> : <span className="text-slate-600">—</span>}</td>
                  <td className="p-4 text-slate-400 max-w-[200px] truncate">{it.interviewerNotes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
    </div>
  );
};

export default InterviewsPage;

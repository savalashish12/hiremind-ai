import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

const RecruiterJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const fetchJobs = async () => {
    try { const res = await API.get("/jobs/my-jobs"); setJobs(Array.isArray(res.data) ? res.data : []); }
    catch { toast.error("Failed to load jobs"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchJobs(); }, []);
  const updateStatus = async (id, status) => {
    try { await API.put(`/jobs/${id}`, { status }); toast.success(`Status → ${status}`); fetchJobs(); }
    catch { toast.error("Update failed"); }
  };
  const del = async (id) => {
    if (!window.confirm("Delete this job + all applications?")) return;
    try { await API.delete(`/jobs/${id}`); toast.success("Deleted"); fetchJobs(); }
    catch { toast.error("Delete failed"); }
  };
  if (loading) return <div className="p-6 text-slate-400 text-sm animate-pulse">Loading jobs...</div>;
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-white">My Jobs ({jobs.length})</h1>
        <Link to="/recruiter/post-job" className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl">+ Post Job</Link>
      </div>
      {jobs.length === 0 ? <p className="text-xs text-slate-500">No jobs posted yet.</p> :
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
              <div className="flex justify-between gap-2"><h3 className="font-bold text-white text-sm">{job.title}</h3><span className="text-[10px] px-2 py-0.5 rounded border border-slate-700 text-slate-400 h-fit">{job.status}</span></div>
              <p className="text-slate-400 line-clamp-2">{job.description}</p>
              <p className="text-slate-500">📍 {job.location} · 💰 {job.salary} · {job.jobType?.replace("_", " ")}</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => navigate(`/recruiter/jobs/${job.id}`)} className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold py-2 rounded-xl">Detail + Edit</button>
                <button onClick={() => navigate(`/recruiter/applicants/${job.id}`)} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl">Applicants</button>
                <button onClick={() => navigate(`/recruiter/pipeline/${job.id}`)} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl">Pipeline</button>
                <button onClick={() => del(job.id)} className="bg-red-950/40 text-red-400 border border-red-900/30 px-3 py-2 rounded-xl"><Trash2 size={13} /></button>
              </div>
              <div className="flex gap-1.5 text-[10px] font-bold">
                {["OPEN", "PAUSED", "CLOSED"].map((s) => <button key={s} onClick={() => updateStatus(job.id, s)} className="bg-slate-950 border border-slate-800 text-slate-400 hover:text-white px-2 py-1 rounded-lg">{s}</button>)}
              </div>
            </div>
          ))}
        </div>}
    </div>
  );
};

export default RecruiterJobsPage;

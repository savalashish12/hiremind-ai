import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";
import EditJobModal from "../../components/EditJobModal";

const RecruiterJobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const fetchJob = async () => {
    try { const res = await API.get(`/jobs/${id}`); setJob(res.data); }
    catch { toast.error("Job not found"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchJob(); }, [id]);
  if (loading) return <div className="p-6 text-slate-400 text-sm animate-pulse">Loading...</div>;
  if (!job) return <div className="p-6 text-sm text-slate-400">Not found. <Link to="/recruiter/jobs" className="text-blue-400">Back</Link></div>;
  return (
    <div className="space-y-4">
      <Link to="/recruiter/jobs" className="text-xs text-slate-400 hover:text-white">← My Jobs</Link>
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3">
        <h1 className="text-2xl font-extrabold text-white">{job.title}</h1>
        <p className="text-xs text-slate-400">📍 {job.location} · 💰 {job.salary} · {job.jobType} · {job.status} · {job._count?.applications ?? ""} applicants</p>
        <p className="text-sm text-slate-300 whitespace-pre-line">{job.description}</p>
        <div className="flex flex-wrap gap-2">{(job.skillsRequired || []).map((s, i) => <span key={i} className="text-[11px] bg-blue-950 text-blue-300 px-3 py-1 rounded-full">{s}</span>)}</div>
        <div className="flex gap-2 pt-2">
          <button onClick={() => setEditing(true)} className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold px-5 py-2.5 rounded-xl">Edit</button>
          <button onClick={() => navigate(`/recruiter/applicants/${id}`)} className="bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl">View Applicants</button>
          <button onClick={() => navigate(`/recruiter/pipeline/${id}`)} className="bg-purple-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl">Open Pipeline</button>
        </div>
      </div>
      {editing && <EditJobModal job={job} onClose={() => { setEditing(false); fetchJob(); }} fetchRecruiterJobs={fetchJob} />}
    </div>
  );
};

export default RecruiterJobDetailPage;

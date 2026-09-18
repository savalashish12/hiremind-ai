import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import SkillGapAnalysis from "../components/SkillGapAnalysis";
import { MapPin, DollarSign, Briefcase, Building2, Users, Bookmark, ExternalLink, CalendarDays } from "lucide-react";

const STATUS_STYLES = {
  OPEN: "bg-green-500/10 text-green-400 border-green-500/20",
  PAUSED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  CLOSED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [isExternal, setIsExternal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/jobs/${id}`);
        setJob(res.data);
        setIsExternal(false);
      } catch {
        // Fallback 1: internal list search (legacy shape / eventual consistency)
        try {
          const res = await API.get("/jobs?limit=100");
          const list = Array.isArray(res.data) ? res.data : res.data.jobs || [];
          const found = list.find((j) => j.id === id);
          if (found) {
            setJob(found);
            setIsExternal(false);
            return;
          }
        } catch { /* ignore, try external next */ }
        // Fallback 2: aggregated external job
        try {
          const res = await API.get("/jobs/external?limit=100");
          const list = Array.isArray(res.data) ? res.data : res.data.jobs || [];
          const found = list.find((j) => j.id === id);
          if (found) {
            setJob({
              ...found,
              skillsRequired: found.requiredSkills || found.skills || [],
              jobType: "FULL_TIME",
            });
            setIsExternal(true);
            return;
          }
        } catch { /* ignore */ }
        setJob(null);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  useEffect(() => {
    const checkSaved = async () => {
      if (user?.role !== "CANDIDATE" || !job || isExternal) return;
      try {
        const res = await API.get("/candidate/saved-jobs");
        if (res.data.success) {
          setSaved(res.data.data.some((item) => item.jobId === job.id));
        }
      } catch { /* non-blocking */ }
    };
    checkSaved();
  }, [user, job, isExternal]);

  const handleApply = async () => {
    if (!user) {
      toast.error("Please login as a candidate to apply");
      navigate(`/login?redirect=${encodeURIComponent(`/jobs/${id}`)}`);
      return;
    }
    if (user.role !== "CANDIDATE") {
      toast.error("Only candidates can apply to jobs");
      return;
    }
    setApplying(true);
    try {
      const res = await API.post("/application/apply", { jobId: id });
      toast.success(res.data.message || "Applied successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Already applied to this job");
    } finally {
      setApplying(false);
    }
  };

  const toggleSave = async () => {
    if (!user || user.role !== "CANDIDATE") {
      toast.error("Login as a candidate to save jobs");
      navigate(`/login?redirect=${encodeURIComponent(`/jobs/${id}`)}`);
      return;
    }
    setSaving(true);
    try {
      const res = await API.post(`/candidate/saved-jobs/${job.id}`);
      if (res.data.success) {
        setSaved((s) => !s);
        toast.success(res.data.message);
      }
    } catch {
      toast.error("Failed to update saved job");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 xl:p-8 space-y-4 animate-pulse">
        <div className="h-8 w-2/3 bg-slate-800 rounded-xl" />
        <div className="h-4 w-1/3 bg-slate-800 rounded-lg" />
        <div className="h-48 bg-slate-800/60 border border-slate-800 rounded-3xl" />
      </div>
    );
  }
  if (!job) return (
    <div className="max-w-2xl mx-auto p-6 md:p-10 text-center">
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 space-y-3">
        <h1 className="text-xl font-bold text-white">Job not found</h1>
        <p className="text-xs text-slate-500">It may have been closed or removed by the recruiter.</p>
        <Link to="/jobs" className="inline-block text-sm bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl transition-colors">← Back to job board</Link>
      </div>
    </div>
  );

  const company = job.recruiter?.recruiterProfile?.companyName || job.recruiter?.companyProfile?.companyName || job.company || "Company";
  const statusCls = STATUS_STYLES[job.status] || "bg-slate-500/10 text-slate-400 border-slate-500/20";

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 xl:p-8 space-y-6 text-slate-100">
      <Link to="/jobs" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">← Back to jobs</Link>
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-5 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{job.title}</h1>
            <p className="text-sm text-blue-400 font-semibold mt-1.5 flex items-center gap-1.5"><Building2 size={14} />{company}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isExternal
              ? <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border bg-slate-700/40 text-slate-300 border-slate-600">External · {job.source || "Aggregated"}</span>
              : <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${statusCls}`}>{job.status || "OPEN"}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
          {job.location && <span className="flex items-center gap-1.5"><MapPin size={12} />{job.location}</span>}
          {job.salary && <span className="flex items-center gap-1.5"><DollarSign size={12} />{job.salary}</span>}
          {job.jobType && <span className="flex items-center gap-1.5"><Briefcase size={12} />{String(job.jobType).replace("_", " ")}</span>}
          {job._count && <span className="flex items-center gap-1.5"><Users size={12} />{job._count.applications} applicants</span>}
          {job.createdAt && <span className="flex items-center gap-1.5"><CalendarDays size={12} />Posted {new Date(job.createdAt).toLocaleDateString()}</span>}
        </div>
        {(job.skillsRequired || []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.skillsRequired.map((s, i) => (
              <span key={i} className="text-[11px] bg-blue-950 text-blue-300 border border-blue-900/30 px-3 py-1 rounded-full font-semibold">{s}</span>
            ))}
          </div>
        )}
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Job Description</h2>
          <p className="whitespace-pre-line text-sm text-slate-300 leading-relaxed">{job.description}</p>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          {isExternal ? (
            <a href={job.applyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
              Apply on source site <ExternalLink size={13} />
            </a>
          ) : (
            <button onClick={handleApply} disabled={applying} className="bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
              {applying ? "Applying..." : "Apply Now"}
            </button>
          )}
          {!isExternal && user?.role === "CANDIDATE" && (
            <button onClick={toggleSave} disabled={saving} className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500/40 disabled:opacity-50 text-slate-200 font-bold px-6 py-2.5 rounded-xl text-sm border border-slate-700 transition-colors">
              <Bookmark size={13} className={saved ? "fill-amber-400 text-amber-400" : ""} />{saved ? "Saved" : "Save Job"}
            </button>
          )}
          <Link to={user?.role === "CANDIDATE" ? "/candidate/jobs" : "/jobs"} className="bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white font-bold px-6 py-2.5 rounded-xl text-sm border border-slate-700 transition-colors">
            Browse More
          </Link>
        </div>
        {!user && <p className="text-xs text-slate-500">Viewing as guest — <Link to={`/login?redirect=${encodeURIComponent(`/jobs/${id}`)}`} className="text-blue-400 hover:underline font-semibold">login as candidate</Link> to apply, save, or see skill gap.</p>}
      </div>
      {user?.role === "CANDIDATE" && !isExternal && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-sm font-bold text-white mb-4">Your Skill Gap for this role</h2>
          <SkillGapAnalysis jobId={id} />
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;

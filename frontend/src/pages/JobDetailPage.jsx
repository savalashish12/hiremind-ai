import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import SkillGapAnalysis from "../components/SkillGapAnalysis";
import { MapPin, DollarSign, Briefcase, Building2, Users } from "lucide-react";

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/jobs/${id}`);
        setJob(res.data);
      } catch {
        // Fallback: search paginated list for the id (old data shape)
        try {
          const res = await API.get("/jobs?limit=100");
          const list = Array.isArray(res.data) ? res.data : res.data.jobs || [];
          setJob(list.find((j) => j.id === id) || null);
        } catch {
          setJob(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

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

  if (loading) return <div className="max-w-4xl mx-auto p-10 text-slate-400 text-sm animate-pulse">Loading job details...</div>;
  if (!job) return (
    <div className="max-w-4xl mx-auto p-10 text-center text-slate-400">
      <h1 className="text-xl font-bold text-white mb-2">Job not found</h1>
      <Link to="/jobs" className="text-blue-400 hover:underline text-sm">← Back to job board</Link>
    </div>
  );

  const company = job.recruiter?.recruiterProfile?.companyName || job.recruiter?.companyProfile?.companyName || job.company || "Company";

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 text-slate-100 space-y-6">
      <Link to="/jobs" className="text-xs text-slate-400 hover:text-white">← Back to jobs</Link>
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">{job.title}</h1>
          <p className="text-sm text-blue-400 font-semibold mt-1 flex items-center gap-1.5"><Building2 size={14} />{company}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-slate-400">
          {job.location && <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>}
          {job.salary && <span className="flex items-center gap-1"><DollarSign size={12} />{job.salary}</span>}
          {job.jobType && <span className="flex items-center gap-1"><Briefcase size={12} />{job.jobType.replace("_", " ")}</span>}
          {job._count && <span className="flex items-center gap-1"><Users size={12} />{job._count.applications} applicants</span>}
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
          <button onClick={handleApply} disabled={applying} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm">
            {applying ? "Applying..." : "Apply Now"}
          </button>
          <Link to={user?.role === "CANDIDATE" ? "/candidate/saved-jobs" : "/jobs"} className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-6 py-2.5 rounded-xl text-sm border border-slate-700">
            Browse More
          </Link>
        </div>
        {!user && <p className="text-xs text-slate-500">Viewing as guest — <Link to="/login" className="text-blue-400 hover:underline">login as candidate</Link> to apply, save, or see skill gap.</p>}
      </div>
      {user?.role === "CANDIDATE" && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-sm font-bold text-white mb-4">Your Skill Gap for this role</h2>
          <SkillGapAnalysis jobId={id} />
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;

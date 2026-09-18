import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";

const CandidateViewPage = () => {
  const { id } = useParams(); // candidate user id
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get(`/candidate/portfolio/${id}`);
        setPortfolio(res.data.data || res.data);
      } catch { toast.error("Candidate not found"); }
      finally { setLoading(false); }
    })();
  }, [id]);
  if (loading) return <div className="p-6 text-slate-400 text-sm animate-pulse">Loading candidate...</div>;
  if (!portfolio) return <div className="p-6 text-sm text-slate-400">Not found. <Link to="/recruiter/jobs" className="text-blue-400">Back</Link></div>;
  return (
    <div className="space-y-4 max-w-3xl">
      <Link to="/recruiter/jobs" className="text-xs text-slate-400 hover:text-white">← Back</Link>
      <h1 className="text-2xl font-extrabold text-white">Candidate Profile</h1>
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 text-xs space-y-3 text-slate-300">
        {portfolio.githubUrl && <p>GitHub: <a href={portfolio.githubUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{portfolio.githubUrl}</a></p>}
        {portfolio.linkedinUrl && <p>LinkedIn: <a href={portfolio.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{portfolio.linkedinUrl}</a></p>}
        {portfolio.portfolioUrl && <p>Portfolio: <a href={portfolio.portfolioUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{portfolio.portfolioUrl}</a></p>}
        <p className="text-slate-500">Public share: <Link to={`/portfolio/${portfolio.candidateId || id}`} className="text-blue-400 hover:underline">/portfolio/{portfolio.candidateId || id}</Link></p>
        <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto text-[11px] text-slate-400">{JSON.stringify({ projects: portfolio.projects, certifications: portfolio.certifications, achievements: portfolio.achievements }, null, 2)}</pre>
      </div>
    </div>
  );
};

export default CandidateViewPage;

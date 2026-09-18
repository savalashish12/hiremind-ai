import { useParams, Link } from "react-router-dom";
import SkillGapAnalysis from "../../components/SkillGapAnalysis";

const SkillGapPage = () => {
  const { jobId } = useParams();
  return (
    <div className="space-y-4">
      <Link to={jobId ? `/candidate/jobs/${jobId}` : "/candidate/jobs"} className="text-xs text-slate-400 hover:text-white">← Back to job</Link>
      <h1 className="text-2xl font-extrabold text-white">Skill Gap Analysis</h1>
      <p className="text-xs text-slate-400">Your profile skills vs job requirements, with course resources.</p>
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
        <SkillGapAnalysis jobId={jobId} />
      </div>
    </div>
  );
};

export default SkillGapPage;

import { useNavigate } from "react-router-dom";
import CreateJobForm from "../../components/CreateJobForm";

const PostJobPage = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-white">Post a New Job</h1>
      <p className="text-xs text-slate-400">Visible instantly on the public board at <span className="text-blue-400">/jobs</span> — no login needed to discover.</p>
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
        <CreateJobForm fetchRecruiterJobs={() => navigate("/recruiter/jobs")} />
      </div>
    </div>
  );
};

export default PostJobPage;

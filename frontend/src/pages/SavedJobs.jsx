import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import EmptyState from "../components/EmptyState";

const SavedJobs = () => {
  const location = useLocation();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await API.get("/candidate/saved-jobs");
      if (res.data.success) {
        setSavedJobs(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load saved jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, [location.pathname, location.key]);

  const handleUnsave = async (jobId) => {
    // Optimistic UI update
    setSavedJobs((prev) => prev.filter((item) => item.jobId !== jobId));
    try {
      const res = await API.post(`/candidate/saved-jobs/${jobId}`);
      if (res.data.success && !res.data.data.saved) {
        toast.success("Job unsaved successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to unsave job");
      fetchSavedJobs(); // Revert
    }
  };

  const handleApply = async (jobId) => {
    try {
      const res = await API.post("/application/apply", { jobId });
      toast.success(res.data.message || "Applied successfully!");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Already applied to this job");
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto text-white">
      <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
        My Bookmarked Jobs
      </h1>
      <p className="text-slate-400 mb-10">
        Review your saved job postings and apply directly when you are ready.
      </p>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon="🔖"
          title="No Saved Jobs"
          message="Bookmark jobs you like to apply later."
          action={{ label: "Browse Jobs", href: "/jobs" }}
        />
      ) : (
        <div className="grid gap-6">
          {savedJobs.map((item) => {
            const job = item.job;
            if (!job) return null;
            return (
              <div
                key={item.id}
                className="bg-slate-800 p-6 rounded-2xl border border-slate-755 hover:border-slate-600 shadow-lg transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-6 relative"
              >
                <div>
                  <h3 className="text-xl font-bold">{job.title}</h3>
                  <p className="text-xs text-blue-400 mt-1 font-semibold">
                    🏢 {job.recruiter?.fullName || "Verified Recruiter"}
                  </p>
                  <p className="text-xs text-slate-400 mt-3 flex flex-wrap gap-4">
                    <span>📍 {job.location}</span>
                    <span>💰 {job.salary || "Not Specified"}</span>
                    <span>🕒 {job.jobType.replace("_", " ")}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleUnsave(job.id)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-lg"
                    title="Remove bookmark"
                  >
                    🔖
                  </button>
                  <button
                    onClick={() => handleApply(job.id)}
                    className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow text-xs active:scale-95"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;

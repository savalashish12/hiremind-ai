import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

const STAGES = [
  { key: "Applied", label: "Applied", color: "border-t-slate-500 bg-slate-900/60" },
  { key: "Reviewed", label: "Reviewed", color: "border-t-blue-500 bg-blue-950/20" },
  { key: "Shortlisted", label: "Shortlisted", color: "border-t-purple-500 bg-purple-950/20" },
  { key: "InterviewScheduled", label: "Interview Scheduled", color: "border-t-yellow-500 bg-yellow-950/20" },
  { key: "Selected", label: "Selected", color: "border-t-teal-500 bg-teal-950/20" },
  { key: "Hired", label: "Hired", color: "border-t-green-500 bg-green-950/20" },
];

const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'HM';
const getAvatarBg = (score) => score >= 70 ? 'bg-green-700' : score >= 40 ? 'bg-amber-700' : score != null ? 'bg-red-700' : 'bg-slate-600';
const getScoreStyle = (score) => score >= 70 ? 'text-green-400 bg-green-900/40 border-green-800' : score >= 40 ? 'text-amber-400 bg-amber-900/40 border-amber-800' : 'text-red-400 bg-red-900/40 border-red-800';
const daysAgo = (date) => Math.max(0, Math.floor((Date.now() - new Date(date)) / 86400000));

const JobPipelineKanban = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedAppId, setDraggedAppId] = useState(null);

  const fetchPipeline = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/recruiter/pipeline/${jobId}`);
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load hiring pipeline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, [jobId]);

  const handleDragStart = (e, appId) => {
    setDraggedAppId(appId);
    e.dataTransfer.setData("text/plain", appId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Required to allow drop!
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData("text/plain") || draggedAppId;
    if (!appId) return;

    // Find the application
    const appIndex = applications.findIndex((app) => app.id === appId);
    if (appIndex === -1) return;

    const originalStage = applications[appIndex].pipelineStage || "Applied";
    if (originalStage === targetStage) return;

    // Optimistic UI update
    const updatedApps = [...applications];
    updatedApps[appIndex] = {
      ...updatedApps[appIndex],
      pipelineStage: targetStage,
    };
    setApplications(updatedApps);

    try {
      const res = await API.patch("/recruiter/pipeline/move", {
        applicationId: appId,
        newStage: targetStage,
      });

      if (res.data.success) {
        toast.success(`Candidate moved to ${targetStage}`);
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update candidate stage");
      // Revert optimistic update
      fetchPipeline();
    } finally {
      setDraggedAppId(null);
    }
  };

  const getAppsForStage = (stageKey) => {
    return applications.filter((app) => {
      const current = app.pipelineStage || "Applied";
      // Normalize comparison to tolerate status mapping fallback from DB
      if (stageKey === "Applied") return current === "Applied" || current === "APPLIED";
      if (stageKey === "Reviewed") return current === "Reviewed" || current === "REVIEWING";
      if (stageKey === "Shortlisted") return current === "Shortlisted" || current === "SHORTLISTED";
      if (stageKey === "InterviewScheduled") return current === "InterviewScheduled" || current === "INTERVIEW_SCHEDULED";
      if (stageKey === "Selected") return current === "Selected" || current === "SELECTED" || current === "INTERVIEWED";
      if (stageKey === "Hired") return current === "Hired" || current === "HIRED";
      return current === stageKey;
    });
  };
  const KanbanCard = ({ app }) => {
    return (
      <div
        draggable
        onDragStart={e => handleDragStart(e, app.id)}
        className="bg-slate-800 border border-slate-700 rounded-xl p-3 mb-2 cursor-grab active:cursor-grabbing hover:border-slate-500 transition-all group select-none"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-8 h-8 rounded-full ${getAvatarBg(app.matchScore)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
            {getInitials(app.candidate?.user?.fullName || app.candidate?.fullName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {app.candidate?.user?.fullName || app.candidate?.fullName || 'Candidate'}
            </p>
            <p className="text-[10px] text-slate-500">{daysAgo(app.createdAt || app.appliedAt)}d in stage</p>
          </div>
        </div>
        {app.matchScore != null && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getScoreStyle(app.matchScore)}`}>
            {app.matchScore}% match
          </span>
        )}
        <div className="hidden group-hover:flex gap-1 mt-2 pt-2 border-t border-slate-700/50">
          <a href={`/applicants/${app.jobId}`}
            onClick={e => e.stopPropagation()}
            className="flex-1 text-center text-[10px] py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors">
            View Profile
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="p-10 max-w-[95vw] mx-auto text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-slate-700 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Hiring Pipeline Board
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Drag and drop candidates to update their hiring pipeline progress stage in real-time.
          </p>
        </div>
        <a
          href={`/applicants/${jobId}`}
          className="bg-slate-800 hover:bg-slate-700 font-bold px-6 py-2.5 rounded-xl border border-slate-700 text-xs transition-all"
        >
          ◀ Standard Applicants View
        </a>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4">
          {STAGES.map((stage) => {
            const stageApps = getAppsForStage(stage.key);
            return (
              <div
                key={stage.key}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.key)}
                className={`min-w-[260px] snap-start flex-shrink-0 flex flex-col rounded-2xl border-t-4 border border-slate-800/80 shadow-lg min-h-[500px] transition-all p-4 ${stage.color}`}
              >
                {/* Column Title Header */}
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>
                    {stage.label}
                    <span className="bg-slate-700 text-slate-400 text-[10px] px-2 py-0.5 rounded-full ml-2">
                      {applications.filter(a => (a.pipelineStage || 'Applied') === stage.key).length}
                    </span>
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3.5 overflow-y-auto mt-3">
                  {stageApps.length === 0 ? (
                    <div className="text-center py-10 text-[10px] text-slate-600 font-medium">Drop candidates here</div>
                  ) : (
                    stageApps.map((app) => (
                      <KanbanCard key={app.id} app={app} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobPipelineKanban;

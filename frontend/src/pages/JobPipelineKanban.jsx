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
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6 items-start">
          {STAGES.map((stage) => {
            const stageApps = getAppsForStage(stage.key);
            return (
              <div
                key={stage.key}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.key)}
                className={`flex flex-col rounded-2xl border-t-4 border border-slate-800/80 shadow-lg min-h-[500px] transition-all p-4 ${stage.color}`}
              >
                {/* Column Title Header */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-850">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-200">{stage.label}</span>
                  <span className="bg-slate-850 px-2 py-0.5 rounded text-[10px] font-bold text-slate-400">
                    {stageApps.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3.5 overflow-y-auto">
                  {stageApps.length === 0 ? (
                    <div className="text-center py-10 text-[10px] text-slate-600 font-medium">Drop candidates here</div>
                  ) : (
                    stageApps.map((app) => (
                      <div
                        key={app.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.id)}
                        className="bg-slate-900 border border-slate-850 p-4 rounded-xl hover:border-slate-750 transition-all cursor-grab active:cursor-grabbing shadow hover:shadow-md relative group"
                      >
                        {/* Avatar / Initials */}
                        <div className="flex items-center gap-3 mb-3">
                          {app.candidate.candidateProfile?.profileImage ? (
                            <img
                              src={app.candidate.candidateProfile.profileImage}
                              alt="Avatar"
                              className="w-7 h-7 rounded-full object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">
                              {app.candidate.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-xs text-slate-200 truncate max-w-[120px]">
                              {app.candidate.fullName}
                            </h4>
                            <span className="text-[9px] text-slate-500">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* ATS Score Indicator */}
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>Match Score</span>
                          <strong className="text-blue-400">{app.matchScore || 0}%</strong>
                        </div>
                      </div>
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

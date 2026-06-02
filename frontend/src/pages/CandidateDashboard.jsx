import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import ResumeUpload from "../components/ResumeUpload";

const CandidateDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("applications");
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  
  // AI Suggestions
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiRoadmap, setAiRoadmap] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  // Edit Profile Form
  const [editProfile, setEditProfile] = useState({
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    profileImage: "",
    certifications: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await API.get("/application/my-applications");
      setApplications(res.data);
    } catch (error) {
      toast.error("Failed to fetch applications");
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/profile");
      setProfile(res.data);
      if (res.data?.candidateProfile) {
        setEditProfile({
          linkedinUrl: res.data.candidateProfile.linkedinUrl || "",
          githubUrl: res.data.candidateProfile.githubUrl || "",
          portfolioUrl: res.data.candidateProfile.portfolioUrl || "",
          profileImage: res.data.candidateProfile.profileImage || "",
          certifications: (res.data.candidateProfile.certifications || []).join(", "),
        });
      }
    } catch {
      toast.error("Failed to fetch profile");
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await API.get("/ai/job-recommendations");
      setRecommendations(res.data);
    } catch {
      console.log("Could not load recommendations.");
    }
  };

  const generateCareerHub = async () => {
    setLoadingAi(true);
    try {
      const [resTips, resRoad] = await Promise.all([
        API.get("/ai/resume-suggestions"),
        API.get(`/ai/career-roadmap?targetRole=${targetRole}`),
      ]);
      setAiSuggestions(resTips.data);
      setAiRoadmap(resRoad.data);
      toast.success("AI Insights generated successfully!");
    } catch {
      toast.error("Complete your profile (upload resume) to generate AI insights.");
    } finally {
      setLoadingAi(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await API.put("/auth/candidate/profile", editProfile);
      toast.success("Profile updated successfully");
      fetchProfile();
    } catch {
      toast.error("Failed to save profile changes");
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchProfile();
    fetchRecommendations();
  }, [location.pathname, location.key]);

  // Visual status timeline stages config
  const pipelineStages = [
    "APPLIED",
    "REVIEWING",
    "SHORTLISTED",
    "INTERVIEW_SCHEDULED",
    "INTERVIEWED",
    "SELECTED",
    "HIRED",
  ];

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-6 mb-10 pb-6 border-b border-slate-700">
        {profile?.candidateProfile?.profileImage ? (
          <img
            src={profile.candidateProfile.profileImage}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-xl"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold shadow-xl">
            {profile?.fullName?.charAt(0) || "C"}
          </div>
        )}
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-white">{profile?.fullName}</h1>
          <p className="text-slate-400 mt-1">{profile?.email}</p>
          <div className="flex gap-4 mt-3 justify-center md:justify-start">
            {profile?.candidateProfile?.linkedinUrl && (
              <a href={profile.candidateProfile.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm">
                🔗 LinkedIn
              </a>
            )}
            {profile?.candidateProfile?.githubUrl && (
              <a href={profile.candidateProfile.githubUrl} target="_blank" rel="noreferrer" className="text-slate-300 hover:underline text-sm">
                🐙 GitHub
              </a>
            )}
            {profile?.candidateProfile?.portfolioUrl && (
              <a href={profile.candidateProfile.portfolioUrl} target="_blank" rel="noreferrer" className="text-green-400 hover:underline text-sm">
                💼 Portfolio
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-4 border-b border-slate-800 mb-8 pb-3">
        <button
          onClick={() => setActiveTab("applications")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === "applications" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          📄 My Applications
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === "profile" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          👤 Edit Profile
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === "history" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          ⏳ Resume History
        </button>
        <button
          onClick={() => setActiveTab("career")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === "career" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          💡 AI Career Hub
        </button>
        <button
          onClick={() => setActiveTab("recommendations")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === "recommendations" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          🎯 AI Recommendations
        </button>
      </div>

      {/* Active Tab Contents */}
      {activeTab === "applications" && (
        <div className="space-y-6">
          <ResumeUpload fetchProfile={fetchProfile} />

          <h2 className="text-2xl font-bold text-white mb-6">Application Progress</h2>

          {applications.length === 0 ? (
            <div className="text-center py-10 bg-slate-800/40 rounded-xl border border-slate-700 text-slate-400">
              You haven't applied for any jobs yet.
            </div>
          ) : (
            <div className="grid gap-6">
              {applications.map((app) => {
                const isRejected = app.status === "REJECTED";
                const currentIndex = pipelineStages.indexOf(isRejected ? "REJECTED" : app.status);

                return (
                  <div key={app.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-white">{app.job.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">📍 {app.job.location} | 💰 {app.job.salary}</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-bold w-fit ${
                        isRejected ? "bg-red-900 text-red-200" :
                        app.status === "HIRED" ? "bg-green-900 text-green-200" : "bg-blue-900 text-blue-200"
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    {/* Timeline */}
                    <div className="mb-6 pt-2">
                      <div className="relative flex justify-between items-center w-full">
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-700 -translate-y-1/2 z-0"></div>
                        <div
                          className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 z-0 transition-all duration-500"
                          style={{
                            width: `${(Math.max(0, isRejected ? 2 : currentIndex) / (pipelineStages.length - 1)) * 100}%`,
                          }}
                        ></div>
                        {pipelineStages.map((stage, idx) => {
                          const isDone = idx <= currentIndex;
                          const isCurrent = stage === app.status;
                          return (
                            <div key={idx} className="relative z-10 flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                isRejected && idx >= 2 ? "bg-red-500 text-white" :
                                isCurrent ? "bg-blue-500 text-white ring-4 ring-blue-900" :
                                isDone ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400"
                              }`}>
                                {isDone ? "✓" : idx + 1}
                              </div>
                              <span className="text-[10px] text-slate-400 mt-2 hidden sm:inline whitespace-nowrap font-medium">
                                {stage.replace("_", " ")}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interview Details Block */}
                    {app.interviewDate && (
                      <div className="bg-slate-900 p-4 rounded-xl border border-teal-500/30 mt-4 space-y-2 animate-in fade-in duration-300">
                        <h4 className="font-bold text-teal-400 flex items-center gap-2">
                          📅 Scheduled Interview Details
                        </h4>
                        <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300">
                          <p>📅 <strong className="text-slate-100">Date:</strong> {new Date(app.interviewDate).toLocaleDateString()}</p>
                          <p>🕒 <strong className="text-slate-100">Time:</strong> {app.interviewTime || "Scheduled Time"}</p>
                          <p className="md:col-span-2">
                            🔗 <strong className="text-slate-100">Meeting Link:</strong>{" "}
                            <a href={app.interviewLink} target="_blank" rel="noreferrer" className="text-teal-400 hover:underline font-semibold break-all">
                              {app.interviewLink}
                            </a>
                          </p>
                          {app.interviewerNotes && (
                            <p className="md:col-span-2 pt-2 border-t border-slate-800">
                              📝 <strong className="text-slate-100">Notes from Recruiter:</strong> {app.interviewerNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Offer Letter Download Block */}
                    {app.offerLetterUrl && (
                      <div className="bg-slate-900 p-4 rounded-xl border border-blue-500/30 mt-4 space-y-3 animate-in fade-in duration-300">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                          <div>
                            <h4 className="font-bold text-blue-400 flex items-center gap-2 text-sm">
                              ✉️ Employment Offer Letter Ready!
                            </h4>
                            <p className="text-slate-400 mt-1">
                              Congratulations! You have received a formal offer letter for the position of <strong>{app.offerLetterDetails?.role || app.job.title}</strong> at <strong>{app.offerLetterDetails?.companyName || "the Hiring Company"}</strong>.
                            </p>
                          </div>
                          <a
                            href={app.offerLetterUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 inline-block text-center whitespace-nowrap"
                          >
                            Download Offer Letter 📥
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "profile" && (
        <form onSubmit={handleProfileSave} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-white">Enhance Candidate Profile</h2>

          <div>
            <label className="block text-slate-400 text-sm mb-2">Profile Image URL</label>
            <input
              type="url"
              value={editProfile.profileImage}
              onChange={(e) => setEditProfile({ ...editProfile, profileImage: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">LinkedIn URL</label>
            <input
              type="url"
              value={editProfile.linkedinUrl}
              onChange={(e) => setEditProfile({ ...editProfile, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">GitHub URL</label>
            <input
              type="url"
              value={editProfile.githubUrl}
              onChange={(e) => setEditProfile({ ...editProfile, githubUrl: e.target.value })}
              placeholder="https://github.com/username"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">Portfolio URL</label>
            <input
              type="url"
              value={editProfile.portfolioUrl}
              onChange={(e) => setEditProfile({ ...editProfile, portfolioUrl: e.target.value })}
              placeholder="https://myportfolio.com"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">Certifications (comma separated)</label>
            <textarea
              rows="3"
              value={editProfile.certifications}
              onChange={(e) => setEditProfile({ ...editProfile, certifications: e.target.value })}
              placeholder="AWS Solutions Architect, Certified Kubernetes Administrator, CSM"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="bg-blue-600 hover:bg-blue-700 transition-colors px-6 py-3 rounded-lg text-white font-bold w-full"
          >
            {savingProfile ? "Saving Details..." : "Save Profile Details"}
          </button>
        </form>
      )}

      {activeTab === "history" && (
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Resume Upload History</h2>
          
          {!profile?.candidateProfile?.resumeHistory || profile.candidateProfile.resumeHistory.length === 0 ? (
            <p className="text-slate-400">No older resumes archived. Upload a new resume to archive the current one.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-300">
                    <th className="p-4 border-b border-slate-700">File Name</th>
                    <th className="p-4 border-b border-slate-700">Uploaded Date</th>
                    <th className="p-4 border-b border-slate-700 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.candidateProfile.resumeHistory.map((res, i) => (
                    <tr key={i} className="hover:bg-slate-700/50 transition-colors border-b border-slate-700/60">
                      <td className="p-4 font-semibold text-slate-200 truncate max-w-xs">{res.name}</td>
                      <td className="p-4 text-slate-400">{new Date(res.uploadedAt).toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1 rounded transition-colors text-xs font-bold"
                        >
                          View File
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "career" && (
        <div className="space-y-8">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-slate-400 text-sm mb-2 font-medium">Desired Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Frontend Developer, DevOps Lead"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={generateCareerHub}
              disabled={loadingAi || !targetRole}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-lg disabled:opacity-50 transition-all active:scale-95"
            >
              {loadingAi ? "Analyzing..." : "Generate AI Insights"}
            </button>
          </div>

          {loadingAi && (
            <div className="space-y-4 animate-pulse">
              <div className="h-60 bg-slate-800 border border-slate-700 rounded-xl" />
              <div className="h-60 bg-slate-800 border border-slate-700 rounded-xl" />
            </div>
          )}

          {!loadingAi && aiSuggestions && aiRoadmap && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
              {/* Resume Suggestions Card */}
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md">
                <h3 className="text-xl font-bold text-pink-400 mb-6 flex items-center gap-2">
                  📝 Gemini AI Resume Suggestions
                </h3>
                <div className="space-y-6">
                  {aiSuggestions.missingSkills?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm mb-2 uppercase tracking-wide">Highly Demanded Missing Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiSuggestions.missingSkills.map((s, idx) => (
                          <span key={idx} className="bg-pink-900/30 text-pink-300 border border-pink-800/30 px-2.5 py-1 rounded-full text-xs font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiSuggestions.weakAreas?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm mb-2 uppercase tracking-wide">Weak Areas Found</h4>
                      <ul className="list-disc ml-5 space-y-1 text-slate-300 text-sm">
                        {aiSuggestions.weakAreas.map((w, idx) => <li key={idx}>{w}</li>)}
                      </ul>
                    </div>
                  )}

                  {aiSuggestions.suggestedCertifications?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm mb-2 uppercase tracking-wide">Suggested Certifications</h4>
                      <ul className="list-disc ml-5 space-y-1 text-slate-300 text-sm">
                        {aiSuggestions.suggestedCertifications.map((c, idx) => <li key={idx}>{c}</li>)}
                      </ul>
                    </div>
                  )}

                  {aiSuggestions.resumeEnhancementTips?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm mb-2 uppercase tracking-wide">Formatting & Wording Tips</h4>
                      <ul className="list-disc ml-5 space-y-1 text-slate-300 text-sm">
                        {aiSuggestions.resumeEnhancementTips.map((t, idx) => <li key={idx}>{t}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Career Growth Pathway Card */}
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md">
                <h3 className="text-xl font-bold text-violet-400 mb-6 flex items-center gap-2">
                  🗺️ AI Career Roadmap & Learning Path
                </h3>
                <div className="space-y-6">
                  {aiRoadmap.nextSkills?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm mb-2 uppercase tracking-wide">Next Key Skills to Master</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiRoadmap.nextSkills.map((s, idx) => (
                          <span key={idx} className="bg-violet-900/30 text-violet-300 border border-violet-800/30 px-2.5 py-1 rounded-full text-xs font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiRoadmap.recommendedTech?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm mb-2 uppercase tracking-wide">Recommended Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiRoadmap.recommendedTech.map((t, idx) => (
                          <span key={idx} className="bg-blue-900/30 text-blue-300 border border-blue-800/30 px-2.5 py-1 rounded-full text-xs font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiRoadmap.growthSteps?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm mb-4 uppercase tracking-wide">Structured Progression Steps</h4>
                      <div className="relative pl-6 border-l border-slate-700 space-y-6">
                        {aiRoadmap.growthSteps.map((step, idx) => (
                          <div key={idx} className="relative">
                            <div className="absolute -left-[31px] top-0 w-4 h-4 bg-violet-600 rounded-full border-4 border-slate-800"></div>
                            <h5 className="font-bold text-slate-100 text-sm">{step.title}</h5>
                            <p className="text-xs text-slate-400 mt-1">{step.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "recommendations" && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">AI Job Matching Recommendations</h2>
          {recommendations.length === 0 ? (
            <p className="text-slate-400">Complete your profile with skills to find the best recommendations.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.slice(0, 6).map((job) => (
                <div key={job.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-white">{job.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-extrabold ${
                        job.matchScore >= 80 ? "bg-green-900 text-green-200" :
                        job.matchScore >= 60 ? "bg-yellow-900 text-yellow-200" : "bg-slate-700 text-slate-300"
                      }`}>
                        {job.matchScore}% Match
                      </span>
                    </div>
                    <p className="text-xs text-blue-400 mb-4">{job.recruiter?.fullName}</p>
                    <p className="text-sm text-slate-300 line-clamp-3 mb-4">{job.description}</p>
                    
                    <div className="text-xs text-slate-400 bg-slate-900 p-3 rounded-lg border border-slate-800 mb-4">
                      <strong>AI Match Reason:</strong> {job.aiFeedback}
                    </div>
                  </div>

                  <a
                    href="/jobs"
                    className="text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-sm transition-colors mt-auto block"
                  >
                    Details & Apply
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;
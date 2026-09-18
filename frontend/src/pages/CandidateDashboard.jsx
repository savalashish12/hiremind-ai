import { useEffect, useState, useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import ResumeUpload from "../components/ResumeUpload";
import HelperMascot from "../components/HelperMascot";
import SkeletonCard, { StatCardSkeleton } from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationContext } from "../context/NotificationContext";
import {
  Mail,
  LinkIcon,
  Globe,
  Award,
  Layers,
  Calendar,
  Bell,
  ChevronRight,
  FileText,
  ExternalLink,
  Compass
} from "lucide-react";
const ProfileCompletion = ({ profile, setActiveTab }) => {
  if (!profile?.candidateProfile) return null;
  const cp = profile.candidateProfile;
  const checks = [
    { label: 'Upload resume', done: !!cp.resumeUrl, weight: 30, action: 'resume' },
    { label: 'Add skills', done: cp.skills?.length > 0, weight: 15, action: 'skills' },
    { label: 'Add LinkedIn', done: !!cp.linkedinUrl, weight: 10, action: 'linkedin' },
    { label: 'Add GitHub', done: !!cp.githubUrl, weight: 10, action: 'github' },
    { label: 'Add education', done: !!cp.education, weight: 10, action: 'education' },
    { label: 'Add summary', done: !!cp.professionalSummary, weight: 15, action: 'summary' },
    { label: 'Add photo', done: !!cp.profileImage, weight: 10, action: 'photo' },
  ];
  const percent = checks.filter(c => c.done).reduce((a, c) => a + c.weight, 0);
  if (percent >= 100) return null;
  const missing = checks.filter(c => !c.done);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6 animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-white text-sm">Complete your profile</h3>
        <span className="text-blue-400 font-bold text-sm">{percent}%</span>
      </div>
      <div className="w-full bg-slate-750 rounded-full h-2 mb-4">
        <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700"
          style={{ width: `${percent}%` }} />
      </div>
      <div className="flex flex-wrap gap-2">
        {missing.slice(0,4).map((item, i) => (
          <button key={i} onClick={() => setActiveTab('profile')}
            className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full transition-colors border border-slate-600 cursor-pointer">
            + {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const PIPELINE_STAGES = ['Applied', 'Reviewed', 'Shortlisted', 'InterviewScheduled', 'Selected', 'Hired'];
const STAGE_DISPLAY = {
  Applied: 'Applied', Reviewed: 'Reviewed', Shortlisted: 'Shortlisted',
  InterviewScheduled: 'Interview', Selected: 'Selected', Hired: 'Hired ✓'
};

const ApplicationCard = ({ app, onRespond, respondingId }) => {
  const isRejected = app.pipelineStage === 'Rejected' || app.status === 'REJECTED';
  const isOffered = app.status === 'OFFERED';
  const isHired = app.status === 'HIRED';
  const isDeclined = app.status === 'DECLINED';
  return (
    <div className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-2xl p-5 mb-4 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white text-[15px]">{app.job?.title || 'Position'}</h3>
          <p className="text-sm text-slate-400 mt-0.5">{app.job?.postedBy?.recruiterProfile?.companyName || app.job?.recruiter?.recruiterProfile?.companyName || 'Company'}</p>
        </div>
        <div className="text-right shrink-0 ml-4">
          {app.matchScore != null && (
            <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
              app.matchScore >= 70 ? 'text-green-400 bg-green-900/30 border-green-800' :
              app.matchScore >= 40 ? 'text-amber-400 bg-amber-900/30 border-amber-800' :
              'text-red-400 bg-red-900/30 border-red-800'
            }`}>{app.matchScore}% match</span>
          )}
          <p className="text-[11px] text-slate-500 mt-1">
            {new Date(app.appliedAt || app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stage stepper */}
      {isRejected ? (
        <div className="flex items-center gap-2 text-red-400 text-sm py-2">
          <div className="w-6 h-6 rounded-full bg-red-900/50 border border-red-700 flex items-center justify-center text-xs font-bold">✕</div>
          Application not moved forward
        </div>
      ) : (
        <div className="flex items-center overflow-x-auto pb-1">
          {PIPELINE_STAGES.map((stage, idx) => {
            const currentIdx = PIPELINE_STAGES.indexOf(app.pipelineStage || 'Applied');
            const done = idx < currentIdx;
            const active = idx === currentIdx;
            return (
              <div key={stage} className="flex items-center shrink-0">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-bold transition-all duration-500 ${
                    done ? 'bg-green-500 border-green-500 text-white' :
                    active ? 'border-blue-500 bg-blue-500/20 text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]' :
                    'border-slate-600 text-slate-600'
                  }`}>
                    {done ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[9px] mt-1 whitespace-nowrap font-medium ${
                    done ? 'text-green-400' : active ? 'text-blue-400' : 'text-slate-600'
                  }`}>{STAGE_DISPLAY[stage]}</span>
                </div>
                {idx < PIPELINE_STAGES.length - 1 && (
                  <div className={`w-8 h-0.5 mx-0.5 mb-3 transition-all duration-500 ${done ? 'bg-green-500' : 'bg-slate-700'}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Interview date if scheduled */}
      {app.interviewDate && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-2 text-xs text-blue-400">
          <span>📅</span>
          Interview: {new Date(app.interviewDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
          {app.interviewTime && ` at ${app.interviewTime}`}
          {app.interviewLink && (
            <a href={app.interviewLink} target="_blank" rel="noreferrer"
              className="ml-auto underline hover:text-blue-300">Join →</a>
          )}
        </div>
      )}

      {/* Offer letter block */}
      {app.offerLetterUrl && (
        <div className="mt-3 pt-3 border-t border-slate-700 flex flex-col gap-3 text-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h5 className="font-bold text-indigo-400 flex items-center gap-1.5">
                <FileText size={13} /> Official Offer Letter Issued
                {isOffered && (
                  <span className="ml-1 bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                    🎉 Offer Received
                  </span>
                )}
                {isHired && (
                  <span className="ml-1 bg-green-500/15 text-green-300 border border-green-500/30 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                    Accepted ✓
                  </span>
                )}
                {isDeclined && (
                  <span className="ml-1 bg-slate-500/15 text-slate-400 border border-slate-500/30 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                    Declined
                  </span>
                )}
              </h5>
              <p className="text-slate-450 text-[10px] mt-0.5 leading-relaxed">
                Congratulations! Issued position: <strong>{app.offerLetterDetails?.role || app.job?.title}</strong> at <strong>{app.offerLetterDetails?.companyName || "Accenture Corporate"}</strong>.
              </p>
            </div>
            <a
              href={app.offerLetterUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-green-600 hover:bg-green-550 text-white font-bold px-4.5 py-2 rounded-xl transition-all shadow-md text-xs cursor-pointer inline-flex items-center gap-1 whitespace-nowrap"
            >
              Download Offer Letter <ChevronRight size={12} />
            </a>
          </div>
          {isOffered && (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => onRespond?.(app.id, "ACCEPT")}
                disabled={respondingId === app.id}
                className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-2 rounded-xl transition-all text-xs"
              >
                {respondingId === app.id ? "Submitting..." : "Accept Offer"}
              </button>
              <button
                onClick={() => onRespond?.(app.id, "DECLINE")}
                disabled={respondingId === app.id}
                className="flex-1 bg-slate-800 hover:bg-red-600/80 disabled:opacity-50 border border-slate-700 text-slate-200 font-bold py-2 rounded-xl transition-all text-xs"
              >
                Decline Offer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CandidateDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("applications");
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const { notifications } = useContext(NotificationContext);
  
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
  const [history, setHistory] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [respondingId, setRespondingId] = useState("");

  const fetchHistory = async () => {
    try {
      const res = await API.get("/interview/history");
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch {
      console.log("Could not load interview history.");
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await API.get("/application/my-applications");
      setApplications(res.data);
    } catch {
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

  const handleOfferResponse = async (applicationId, decision) => {
    const ok = window.confirm(
      decision === "ACCEPT"
        ? "Accept this offer? Your status will update to HIRED."
        : "Decline this offer? This cannot be undone."
    );
    if (!ok) return;
    setRespondingId(applicationId);
    try {
      const res = await API.patch(`/application/${applicationId}/respond`, { decision });
      toast.success(res.data.message || "Response recorded!");
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record response");
    } finally {
      setRespondingId("");
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
    setPageLoading(true);
    Promise.allSettled([fetchApplications(), fetchProfile(), fetchRecommendations(), fetchHistory()])
      .finally(() => setPageLoading(false));
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

  // Calculate stats and profile completion details
  const hasResume = !!profile?.candidateProfile?.resumeUrl;
  const upcomingInterviews = applications.filter(app => app.interviewDate);

  const mcqAttempts = history.filter(h => h.jobRole.startsWith("[MCQ]"));
  const testsAttempted = mcqAttempts.length;

  const averageTestScore = testsAttempted > 0
    ? Math.round(mcqAttempts.reduce((acc, curr) => {
        const match = curr.overallRating.match(/Score:\s*(\d+)%/);
        return acc + (match ? parseInt(match[1]) : 0);
      }, 0) / testsAttempted)
    : 0;

  const highestTestScore = testsAttempted > 0
    ? Math.max(...mcqAttempts.map(curr => {
        const match = curr.overallRating.match(/Score:\s*(\d+)%/);
        return match ? parseInt(match[1]) : 0;
      }))
    : 0;

  // Local ATS Score calculation
  const calculateAtsLocal = (profile) => {
    if (!profile?.candidateProfile?.resumeUrl) {
      return { score: 0, health: "No Resume" };
    }
    const cp = profile.candidateProfile;
    let score = 55; // base score if they have a resume
    if (cp.professionalSummary && cp.professionalSummary.length > 10) score += 8;
    if (cp.education && cp.education.length > 5) score += 7;
    if (cp.experience && cp.experience.length > 10) score += 10;
    if (cp.skills && cp.skills.length > 0) {
      score += Math.min(12, cp.skills.length * 1.5);
    }
    if (cp.linkedinUrl) score += 3;
    if (cp.githubUrl) score += 3;
    
    // cap at 95 unless they have certifications
    if (cp.certifications && cp.certifications.length > 0) {
      score += Math.min(5, cp.certifications.length * 1.5);
    }
    score = Math.min(98, score);
    
    let health = "Requires Optimization";
    if (score >= 80) health = "Excellent";
    else if (score >= 65) health = "Good";

    return { score, health };
  };

  const atsMetrics = calculateAtsLocal(profile);
  const atsScore = atsMetrics.score;
  const resumeHealth = atsMetrics.health;

  // Profile Completion Calculation
  let profileCompletion = 10; // base registered user
  if (profile?.candidateProfile) {
    const cp = profile.candidateProfile;
    if (cp.profileImage) profileCompletion += 15;
    if (cp.linkedinUrl) profileCompletion += 15;
    if (cp.githubUrl) profileCompletion += 15;
    if (cp.portfolioUrl) profileCompletion += 10;
    if (cp.resumeUrl) profileCompletion += 20;
    if (cp.skills && cp.skills.length > 0) profileCompletion += 15;
  }
  profileCompletion = Math.min(100, profileCompletion);

  // Interview Readiness Index
  let interviewReadiness = 20; // base index
  if (profile?.candidateProfile?.resumeUrl) interviewReadiness += 25;
  if (testsAttempted > 0) {
    interviewReadiness += 15 + Math.min(25, averageTestScore * 0.3);
  }
  const liveAttempts = history.filter(h => !h.jobRole.startsWith("[MCQ]"));
  if (liveAttempts.length > 0) {
    interviewReadiness += 15;
  }
  interviewReadiness = Math.min(100, Math.round(interviewReadiness));

  if (pageLoading) {
    return (
      <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid gap-4">{Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen space-y-8 text-slate-100">
      
      {/* 1. TOP HEADER WITH STATS OVERVIEW */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full lg:w-1/3 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-850 p-6 shadow-xl relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-lg"></div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {profile?.candidateProfile?.profileImage ? (
                <img
                  src={profile.candidateProfile.profileImage}
                  alt="Avatar"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/20 shadow-md shadow-blue-500/5"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-md shadow-blue-500/15">
                  {profile?.fullName?.charAt(0) || "C"}
                </div>
              )}
              <div className="truncate">
                <h2 className="text-xl font-extrabold text-white truncate">{profile?.fullName || "Candidate"}</h2>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                  <Mail size={12} className="text-slate-500" /> {profile?.email}
                </p>
              </div>
            </div>

            {/* Social Links Badge Row */}
            <div className="flex gap-2.5 pt-2">
              {profile?.candidateProfile?.linkedinUrl ? (
                <a href={profile.candidateProfile.linkedinUrl} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-950 border border-slate-850 text-blue-400 hover:text-white transition-colors" title="LinkedIn">
                  <LinkIcon size={14} />
                </a>
              ) : (
                <span className="p-2 rounded-xl bg-slate-950/40 border border-slate-850/50 text-slate-600" title="LinkedIn Placeholder"><LinkIcon size={14} /></span>
              )}
              {profile?.candidateProfile?.githubUrl ? (
                <a href={profile.candidateProfile.githubUrl} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-950 border border-slate-850 text-slate-300 hover:text-white transition-colors" title="GitHub">
                  <ExternalLink size={14} />
                </a>
              ) : (
                <span className="p-2 rounded-xl bg-slate-950/40 border border-slate-850/50 text-slate-600" title="GitHub Placeholder"><ExternalLink size={14} /></span>
              )}
              {profile?.candidateProfile?.portfolioUrl ? (
                <a href={profile.candidateProfile.portfolioUrl} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-950 border border-slate-850 text-cyan-400 hover:text-white transition-colors" title="Portfolio">
                  <Globe size={14} />
                </a>
              ) : (
                <span className="p-2 rounded-xl bg-slate-950/40 border border-slate-850/50 text-slate-600" title="Portfolio Placeholder"><Globe size={14} /></span>
              )}
            </div>

            {/* Academics & Verification status */}
            <div className="pt-3 border-t border-slate-850 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <Award size={13} className="text-blue-500" /> Academic Degree:
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                profile?.candidateProfile?.degreeUrl ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
              }`}>
                {profile?.candidateProfile?.degreeUrl ? "Verified Upload" : "Pending Verify"}
              </span>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-850 flex gap-2">
            <button
              onClick={() => setActiveTab("profile")}
              className="bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold py-2 rounded-xl text-xs flex-1 border border-slate-800 transition-colors"
            >
              Update Profile Details
            </button>
            <Link
              to="/candidate/portfolio"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs flex-1 text-center transition-all inline-block shadow-md shadow-blue-500/10"
            >
              My Portfolio
            </Link>
          </div>
        </motion.div>

        {/* 6 visually stunning KPI cards grid */}
        <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: ATS Score */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-850 p-5 shadow-xl relative overflow-hidden flex flex-col justify-between h-44"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ATS Score</span>
                <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 font-bold">Live Scan</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-extrabold text-white">{atsScore} <span className="text-xs text-slate-500 font-normal">/ 100</span></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2.5 leading-relaxed">
                {hasResume ? "Standard ATS format verified." : "Please upload your resume to score."}
              </p>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2">
              <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${atsScore}%` }}></div>
            </div>
          </motion.div>

          {/* Card 2: Resume Health */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-850 p-5 shadow-xl relative overflow-hidden flex flex-col justify-between h-44"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Resume Health</span>
                <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 font-bold">Calculated</span>
              </div>
              <div className="text-2xl font-extrabold text-white flex items-center gap-2 mt-1">
                {hasResume ? (
                  <span className={atsScore >= 80 ? "text-green-400" : "text-yellow-400"}>{resumeHealth}</span>
                ) : (
                  <span className="text-slate-500">No Resume</span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                {hasResume ? "Checked structure, formatting, and key sectors." : "Upload your resume in the panel below."}
              </p>
            </div>
            <div className="text-[9px] text-slate-500 self-end">
              <Link to="/candidate/ats" className="text-blue-400 font-bold hover:underline">ATS Optimizer →</Link>
            </div>
          </motion.div>

          {/* Card 3: Tests Attempted */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-850 p-5 shadow-xl relative overflow-hidden flex flex-col justify-between h-44"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tests Attempted</span>
                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold">MCQs</span>
              </div>
              <div className="text-3xl font-extrabold text-white mt-1">{testsAttempted} <span className="text-xs text-slate-500 font-normal">attempt{testsAttempted !== 1 ? 's' : ''}</span></div>
              <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                {testsAttempted > 0 ? `Latest: ${new Date(mcqAttempts[0].createdAt).toLocaleDateString()}` : "Launch a mock test to measure progress."}
              </p>
            </div>
            <div className="text-[9px] text-slate-500 self-end">
              <Link to="/candidate/mock-interview" className="text-blue-400 font-bold hover:underline">Mock Center →</Link>
            </div>
          </motion.div>

          {/* Card 4: Average Test Score */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-850 p-5 shadow-xl relative overflow-hidden flex flex-col justify-between h-44"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg Test Score</span>
                <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 font-bold">Percent</span>
              </div>
              <div className="text-3xl font-extrabold text-white mt-1">{averageTestScore}%</div>
              <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                {testsAttempted > 0 ? `Highest recorded score: ${highestTestScore}%` : "No test records found."}
              </p>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2">
              <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${averageTestScore}%` }}></div>
            </div>
          </motion.div>

          {/* Card 5: Interview Readiness */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-850 p-5 shadow-xl relative overflow-hidden flex flex-col justify-between h-44"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Readiness Index</span>
                <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 font-bold">Calculated</span>
              </div>
              <div className="text-3xl font-extrabold text-rose-400 mt-1">{interviewReadiness}%</div>
              <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                {interviewReadiness >= 80 ? "You are fully job ready!" : "Complete more mock tests to boost readiness."}
              </p>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2">
              <div className="bg-rose-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${interviewReadiness}%` }}></div>
            </div>
          </motion.div>

          {/* Card 6: Profile Completion */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-850 p-5 shadow-xl relative overflow-hidden flex flex-col justify-between h-44"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Profile Status</span>
                <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 font-bold">Completion</span>
              </div>
              <div className="text-3xl font-extrabold text-cyan-400 mt-1">{profileCompletion}%</div>
              <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                {profileCompletion === 100 ? "Profile is fully complete!" : "Add details or links to reach 100%."}
              </p>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2">
              <div className="bg-cyan-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${profileCompletion}%` }}></div>
            </div>
          </motion.div>

        </div>

      </div>

      {/* 2. LAYOUT BODY SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column Dashboard Widgets */}
        <div className="lg:col-span-8 space-y-8 w-full">
          
          <ProfileCompletion profile={profile} setActiveTab={setActiveTab} />

          {/* Tabs switch Menu */}
          <div className="flex flex-wrap gap-2.5 border-b border-slate-900 pb-3">
            <button
              onClick={() => setActiveTab("applications")}
              className={`px-4.5 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                activeTab === "applications" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white border border-slate-850"
              }`}
            >
              📄 My Applications
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4.5 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                activeTab === "profile" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white border border-slate-850"
              }`}
            >
              👤 Edit Profile details
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4.5 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                activeTab === "history" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white border border-slate-850"
              }`}
            >
              ⏳ Resume history
            </button>
            <button
              onClick={() => setActiveTab("career")}
              className={`px-4.5 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                activeTab === "career" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white border border-slate-850"
              }`}
            >
              💡 Career Growth hub
            </button>
            <button
              onClick={() => setActiveTab("recommendations")}
              className={`px-4.5 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                activeTab === "recommendations" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white border border-slate-850"
              }`}
            >
              🎯 Job recommendations
            </button>
          </div>

          {/* Active Tab contents */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              {activeTab === "applications" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 w-full"
                >
                  <div className="bg-slate-900/60 border border-slate-850 rounded-3xl p-6">
                    <ResumeUpload fetchProfile={fetchProfile} currentResumeUrl={profile?.candidateProfile?.resumeUrl} />
                  </div>

                  <h3 className="text-xl font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
                    <Layers size={18} className="text-blue-500" /> Active Application Trackers
                  </h3>

                  {applications.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900/20 rounded-2xl border border-slate-850 text-slate-500 font-semibold text-xs">
                      You haven't submitted any job applications yet. Go to <Link to="/jobs" className="text-blue-400 hover:underline font-bold">Browse Jobs</Link> to start.
                    </div>
                  ) : (
                    <div className="grid gap-5">
                      {applications.map((app) => (
                        <ApplicationCard key={app.id} app={app} onRespond={handleOfferResponse} respondingId={respondingId} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "profile" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-slate-900/60 border border-slate-850 p-6 md:p-8 rounded-3xl"
                >
                  <form onSubmit={handleProfileSave} className="space-y-6 text-xs font-semibold">
                    <h3 className="text-lg font-bold text-white mb-2">Configure Professional Portfolio</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 mb-2">Profile Image URL</label>
                        <input
                          type="url"
                          value={editProfile.profileImage}
                          onChange={(e) => setEditProfile({ ...editProfile, profileImage: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-2">LinkedIn URL</label>
                        <input
                          type="url"
                          value={editProfile.linkedinUrl}
                          onChange={(e) => setEditProfile({ ...editProfile, linkedinUrl: e.target.value })}
                          placeholder="https://linkedin.com/in/username"
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-2">GitHub URL</label>
                        <input
                          type="url"
                          value={editProfile.githubUrl}
                          onChange={(e) => setEditProfile({ ...editProfile, githubUrl: e.target.value })}
                          placeholder="https://github.com/username"
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-2">Portfolio URL</label>
                        <input
                          type="url"
                          value={editProfile.portfolioUrl}
                          onChange={(e) => setEditProfile({ ...editProfile, portfolioUrl: e.target.value })}
                          placeholder="https://myportfolio.com"
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-2">Verified Professional Certifications (comma-separated)</label>
                      <textarea
                        rows="3"
                        value={editProfile.certifications}
                        onChange={(e) => setEditProfile({ ...editProfile, certifications: e.target.value })}
                        placeholder="AWS Solutions Architect, Google Professional Cloud Architect, CKA"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="bg-blue-600 hover:bg-blue-500 transition-colors py-3 rounded-xl text-white font-bold w-full cursor-pointer shadow-md shadow-blue-500/10 text-xs"
                    >
                      {savingProfile ? "Saving details..." : "Save Portfolio Settings"}
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === "history" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-slate-900/60 border border-slate-850 p-6 md:p-8 rounded-3xl"
                >
                  <h3 className="text-lg font-bold text-white mb-6">Archive Resume Database</h3>
                  
                  {!profile?.candidateProfile?.resumeHistory || profile.candidateProfile.resumeHistory.length === 0 ? (
                    <p className="text-slate-400 text-xs">No older resumes archived yet. Re-uploading a new resume automatically archives the previous version.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-850">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-950 text-slate-400">
                            <th className="p-4 font-bold border-b border-slate-850">Archived Document</th>
                            <th className="p-4 font-bold border-b border-slate-850">Upload Timestamp</th>
                            <th className="p-4 font-bold border-b border-slate-850 text-right">View</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-slate-350">
                          {profile.candidateProfile.resumeHistory.map((res, i) => (
                            <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                              <td className="p-4 font-semibold max-w-xs truncate">{res.name}</td>
                              <td className="p-4 text-slate-500">{new Date(res.uploadedAt).toLocaleString()}</td>
                              <td className="p-4 text-right">
                                <a
                                  href={`http://localhost:5000/api/candidate/document?url=${encodeURIComponent(res.url)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg border border-blue-900/20 text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  View CV
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "career" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 w-full"
                >
                  <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-3xl flex flex-col sm:flex-row gap-4 items-end text-xs">
                    <div className="flex-1 w-full text-left">
                      <label className="block text-slate-400 mb-2 font-medium">Desired Target Job Profile</label>
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. Senior Frontend Developer, Java DevOps Engineer"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      onClick={generateCareerHub}
                      disabled={loadingAi || !targetRole}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-3 rounded-xl disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
                    >
                      {loadingAi ? "Analyzing..." : "Generate Tech Pathways"}
                    </button>
                  </div>

                  {loadingAi && (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-60 bg-slate-900/40 border border-slate-850 rounded-2xl" />
                      <div className="h-60 bg-slate-900/40 border border-slate-850 rounded-2xl" />
                    </div>
                  )}

                  {!loadingAi && aiSuggestions && aiRoadmap && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs">
                      
                      {/* Resume suggestions */}
                      <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-3xl space-y-5 text-left">
                        <h4 className="text-sm font-bold text-pink-400 flex items-center gap-1.5 pb-2 border-b border-slate-900">
                          <FileText size={15} /> Resume Enhancement Tips
                        </h4>
                        
                        <div className="space-y-4 leading-relaxed">
                          {aiSuggestions.missingSkills?.length > 0 && (
                            <div>
                              <h5 className="font-bold text-slate-300 uppercase text-[10px] tracking-wide mb-1.5">Missing Technologies</h5>
                              <div className="flex flex-wrap gap-1.5">
                                {aiSuggestions.missingSkills.map((s, idx) => (
                                  <span key={idx} className="bg-pink-500/5 text-pink-400 border border-pink-500/10 px-2 py-0.5 rounded text-[10px] font-semibold">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {aiSuggestions.weakAreas?.length > 0 && (
                            <div>
                              <h5 className="font-bold text-slate-300 uppercase text-[10px] tracking-wide mb-1.5">Weak Structure Areas</h5>
                              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                                {aiSuggestions.weakAreas.map((w, idx) => <li key={idx}>{w}</li>)}
                              </ul>
                            </div>
                          )}

                          {aiSuggestions.resumeEnhancementTips?.length > 0 && (
                            <div>
                              <h5 className="font-bold text-slate-300 uppercase text-[10px] tracking-wide mb-1.5">Formatting Corrections</h5>
                              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                                {aiSuggestions.resumeEnhancementTips.map((t, idx) => <li key={idx}>{t}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Learning paths */}
                      <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-3xl space-y-5 text-left">
                        <h4 className="text-sm font-bold text-blue-400 flex items-center gap-1.5 pb-2 border-b border-slate-900">
                          <Compass size={15} /> Structural Tech Progression
                        </h4>
                        
                        <div className="space-y-4">
                          {aiRoadmap.nextSkills?.length > 0 && (
                            <div>
                              <h5 className="font-bold text-slate-300 uppercase text-[10px] tracking-wide mb-1.5">Next Skills to Master</h5>
                              <div className="flex flex-wrap gap-1.5">
                                {aiRoadmap.nextSkills.map((s, idx) => (
                                  <span key={idx} className="bg-blue-500/5 text-blue-400 border border-blue-500/10 px-2 py-0.5 rounded text-[10px] font-semibold">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {aiRoadmap.growthSteps?.length > 0 && (
                            <div>
                              <h5 className="font-bold text-slate-300 uppercase text-[10px] tracking-wide mb-3">Milestone Progress Step</h5>
                              <div className="pl-4 border-l border-slate-800 space-y-4 leading-normal">
                                {aiRoadmap.growthSteps.map((step, idx) => (
                                  <div key={idx} className="relative">
                                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-blue-500 rounded-full border border-slate-900 shadow-md"></div>
                                    <p className="font-bold text-slate-200">{step.title}</p>
                                    <p className="text-[10px] text-slate-450 mt-0.5">{step.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "recommendations" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 w-full text-left"
                >
                  <h3 className="text-xl font-bold text-white border-b border-slate-900 pb-2">AI Match recommendations</h3>
                  
                  {recommendations.length === 0 ? (
                    <p className="text-slate-500 text-xs">Upload your resume to receive semantically aligned job recommendations.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {recommendations.slice(0, 6).map((job) => (
                        <div key={job.id} className="bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-850 hover:border-slate-800 transition-colors flex flex-col justify-between text-xs space-y-4">
                          <div>
                            <div className="flex justify-between items-start gap-3">
                              <h4 className="font-bold text-white text-sm">{job.title}</h4>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold whitespace-nowrap ${
                                job.matchScore >= 80 ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                                job.matchScore >= 60 ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : "bg-slate-850 text-slate-500"
                              }`}>
                                {job.matchScore}% Match
                              </span>
                            </div>
                            <p className="text-[10px] text-blue-400 mt-0.5">🏢 {job.recruiter?.fullName || "Corporate"}</p>
                            <p className="text-slate-400 mt-2 line-clamp-2 leading-relaxed">{job.description}</p>
                            
                            <div className="text-[10px] text-slate-450 bg-slate-950 p-2.5 rounded-lg border border-slate-850 mt-3 leading-normal">
                              <strong>Why Match:</strong> {job.aiFeedback}
                            </div>
                          </div>

                          <Link
                            to="/jobs"
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-center transition-all mt-2 select-none"
                          >
                            Details & Apply
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Right Column Dashboard Widgets (Interviews & Notifications) */}
        <div className="lg:col-span-4 space-y-8 w-full">
          
          {/* Upcoming Interviews widget */}
          <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-850 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5 border-b border-slate-950 pb-2.5">
              <Calendar size={14} className="text-blue-400" /> Upcoming Interviews ({upcomingInterviews.length})
            </h3>
            
            <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
              {upcomingInterviews.length === 0 ? (
                <p className="text-slate-500 text-xs py-8 text-center font-medium italic">No upcoming interviews scheduled</p>
              ) : (
                upcomingInterviews.map((app) => (
                  <div key={app.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 flex flex-col gap-2 text-xs">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-slate-200 truncate max-w-[150px]">{app.job.title}</p>
                      <span className="text-[9px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/15">Active</span>
                    </div>
                    <div className="text-[10px] text-slate-400 space-y-1">
                      <p>📅 Date: {new Date(app.interviewDate).toLocaleDateString()}</p>
                      <p>🕒 Time: {app.interviewTime || "Scheduled Time"}</p>
                    </div>
                    <a
                      href={app.interviewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white py-1.5 rounded-lg border border-blue-900/20 text-center font-bold transition-all"
                    >
                      Launch Call 🔗
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notifications widget */}
          <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-850 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5 border-b border-slate-950 pb-2.5">
              <Bell size={14} className="text-indigo-400" /> Latest Alerts ({notifications.length})
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <p className="text-slate-500 text-xs py-8 text-center font-medium italic">No notifications logged</p>
              ) : (
                notifications.slice(0, 6).map((n) => (
                  <div key={n.id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-xs space-y-1 text-left">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-indigo-400">{n.title}</span>
                      <span className="text-slate-500">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-400 leading-normal">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      <HelperMascot />
    </div>
  );
};

export default CandidateDashboard;
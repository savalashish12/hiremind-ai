import React, { useEffect, useState, useContext, useMemo } from "react";
import { useLocation } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import SkillGapAnalysis from "../components/SkillGapAnalysis";
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  DollarSign,
  Briefcase,
  Bookmark,
  ExternalLink,
  SlidersHorizontal,
  X,
  FileText,
  Sparkles,
  Clipboard,
  Download,
  GraduationCap
} from "lucide-react";
import { JobCardSkeleton } from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";

const AVATAR_COLORS = ['bg-blue-600','bg-purple-600','bg-teal-600','bg-pink-600','bg-amber-600','bg-indigo-600'];
const getAvatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const getScoreBadge = (score) => {
  if (!score) return null;
  if (score >= 70) return { cls: 'bg-green-900/50 text-green-400 border border-green-800', label: `${score}% match` };
  if (score >= 40) return { cls: 'bg-amber-900/50 text-amber-400 border border-amber-800', label: `${score}% match` };
  return { cls: 'bg-red-900/50 text-red-400 border border-red-800', label: `${score}% match` };
};
const getDaysAgo = (dateStr) => {
  const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days/7)}w ago`;
};

const JobCard = React.memo(({ job, isApplied, isSaved, onApply, onToggleSave, onOpen, isExternal }) => {
  const initials = (job.company || job.recruiter?.recruiterProfile?.companyName || job.recruiter?.companyProfile?.companyName || job.postedBy?.recruiterProfile?.companyName || 'HM').slice(0,2).toUpperCase();
  const avatarColor = getAvatarColor(initials);
  const scoreBadge = getScoreBadge(job.matchScore);
  const typeColors = { FULL_TIME: 'bg-blue-900/50 text-blue-300', PART_TIME: 'bg-purple-900/50 text-purple-300', INTERNSHIP: 'bg-teal-900/50 text-teal-300', CONTRACT: 'bg-amber-900/50 text-amber-300' };

  return (
    <div
      onClick={() => onOpen(job)}
      className="bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/20 group relative"
    >
      {/* Source badge for external */}
      {isExternal && (
        <span className="absolute top-3 right-3 text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full border border-slate-600">
          {job.source || 'External'}
        </span>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-11 h-11 ${avatarColor} rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-[15px] leading-tight truncate group-hover:text-blue-400 transition-colors">{job.title}</h3>
          <p className="text-slate-400 text-xs mt-0.5 truncate">{job.company || job.recruiter?.recruiterProfile?.companyName || job.recruiter?.companyProfile?.companyName || job.postedBy?.recruiterProfile?.companyName || 'Company'}</p>
        </div>
        {!isExternal && (
          <button onClick={e => { e.stopPropagation(); onToggleSave(job.id); }}
            className="shrink-0 p-1 text-slate-500 hover:text-amber-400 transition-colors">
            <Bookmark size={16} className={isSaved ? 'fill-amber-400 text-amber-400' : ''} />
          </button>
        )}
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {job.location && (
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <MapPin size={10} />{job.location}
          </span>
        )}
        {job.jobType && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors[job.jobType] || 'bg-slate-700 text-slate-300'}`}>
            {job.jobType?.replace('_',' ')}
          </span>
        )}
        {job.salary && (
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <DollarSign size={10} />{job.salary}
          </span>
        )}
      </div>

      {/* Skills */}
      {(job.skillsRequired || job.skills || job.skillsNeeded)?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {(job.skillsRequired || job.skills || job.skillsNeeded).slice(0,3).map((s,i) => (
            <span key={i} className="text-[10px] bg-slate-700/70 text-slate-300 px-2 py-0.5 rounded-full">{s}</span>
          ))}
          {(job.skillsRequired || job.skills || job.skillsNeeded).length > 3 && (
            <span className="text-[10px] text-slate-500">+{(job.skillsRequired||job.skills||job.skillsNeeded).length - 3} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          {scoreBadge && <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${scoreBadge.cls}`}>{scoreBadge.label}</span>}
          <span className="text-[10px] text-slate-500">{getDaysAgo(job.createdAt || job.postedDate)}</span>
        </div>
        {isApplied ? (
          <span className="text-[11px] bg-green-900/50 text-green-400 border border-green-800 px-3 py-1 rounded-lg font-medium">✓ Applied</span>
        ) : (
          <button onClick={e => { e.stopPropagation(); onApply(job); }}
            className="text-[11px] bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-medium transition-colors">
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
});

const Jobs = () => {
  const routerLocation = useLocation();
  const [jobs, setJobs] = useState([]);
  const [externalJobs, setExternalJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  // Saved jobs IDs state for bookmarks
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  // Filter States
  const [jobSourceFilter, setJobSourceFilter] = useState("ALL"); // "ALL", "INTERNAL", "EXTERNAL"
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [jobType, setJobType] = useState("ALL");
  const [skillFilter, setSkillFilter] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar drawer state

  // Detailed Modal states
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalTab, setModalTab] = useState("details"); // "details", "gap", "cover"
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [coverLetterText, setCoverLetterText] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Match Preview states
  const [matchPreview, setMatchPreview] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await API.get("/jobs");
      // Handle backend returning { jobs } paginated wrapper or raw array
      const internalList = Array.isArray(res.data) ? res.data : res.data.jobs || [];
      setJobs(internalList);
      
      const extRes = await API.get("/jobs/external");
      const externalList = Array.isArray(extRes.data) ? extRes.data : extRes.data.jobs || [];
      setExternalJobs(externalList);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    if (user?.role !== "CANDIDATE") return;
    try {
      const res = await API.get("/candidate/saved-jobs");
      if (res.data.success) {
        setSavedJobIds(new Set(res.data.data.map((item) => item.jobId)));
      }
    } catch (err) {
      console.log("Could not fetch saved jobs:", err);
    }
  };

  const fetchApplications = async () => {
    if (user?.role !== "CANDIDATE") return;
    try {
      const res = await API.get("/application/my-applications");
      setAppliedJobIds(new Set(res.data.map((app) => app.jobId)));
    } catch (err) {
      console.log("Could not fetch applied applications:", err);
    }
  };

  const applyToJob = async (jobId) => {
    try {
      const res = await API.post("/application/apply", { jobId });
      toast.success(res.data.message || "Applied successfully!");
      setAppliedJobIds(prev => {
        const next = new Set(prev);
        next.add(jobId);
        return next;
      });
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Already applied to this job");
    }
  };

  const toggleSave = async (jobId) => {
    const nextSet = new Set(savedJobIds);
    if (nextSet.has(jobId)) {
      nextSet.delete(jobId);
    } else {
      nextSet.add(jobId);
    }
    setSavedJobIds(nextSet);

    try {
      const res = await API.post(`/candidate/saved-jobs/${jobId}`);
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update saved job");
      fetchSavedJobs(); // Revert
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!selectedJob) return;
    setGeneratingLetter(true);
    try {
      const res = await API.post("/candidate/cover-letter", { jobId: selectedJob.id });
      if (res.data.success) {
        setCoverLetterText(res.data.data);
        toast.success("AI generated your cover letter!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Make sure you have uploaded a resume first.");
    } finally {
      setGeneratingLetter(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetterText);
    toast.success("Cover letter copied to clipboard!");
  };

  const downloadCoverLetterPDF = () => {
    if (!coverLetterText) return;
    const doc = new jsPDF();
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(18);
    doc.text("Cover Letter", 20, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Role: ${selectedJob.title}`, 20, 33);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 38);
    
    doc.setDrawColor(200);
    doc.line(20, 42, 190, 42);
    
    doc.setFontSize(11);
    doc.setTextColor(50);
    const splitText = doc.splitTextToSize(coverLetterText, 170);
    doc.text(splitText, 20, 52);
    
    doc.save(`${selectedJob.title.replace(/\s+/g, "_")}_Cover_Letter.pdf`);
    toast.success("Downloaded PDF successfully!");
  };

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
    fetchApplications();
  }, [user, routerLocation.pathname, routerLocation.key]);

  const combinedJobs = useMemo(() => {
    return [
      ...jobs.map(j => ({ ...j, isExternal: false })),
      ...externalJobs.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        location: e.location,
        salary: e.salary || "Best in Industry",
        jobType: "FULL_TIME",
        skillsRequired: e.requiredSkills || e.skills || [],
        isExternal: true,
        applyUrl: e.applyUrl,
        company: e.company,
        source: e.source,
        summary: e.summary,
        category: e.category,
        experienceLevel: e.experienceLevel || "Mid"
      }))
    ];
  }, [jobs, externalJobs]);

  const filteredJobs = useMemo(() => {
    return combinedJobs.filter((job) => {
      if (jobSourceFilter === "INTERNAL" && job.isExternal) return false;
      if (jobSourceFilter === "EXTERNAL" && !job.isExternal) return false;

      const searchTarget = job.isExternal
        ? `${job.title} ${job.company} ${job.description}`.toLowerCase()
        : `${job.title} ${job.recruiter?.fullName || ""} ${job.description}`.toLowerCase();
      const matchesSearch = !search || searchTarget.includes(search.toLowerCase());

      const matchesLocation =
        !location || job.location.toLowerCase().includes(location.toLowerCase());

      const getNumericSalary = (val) => {
        if (!val) return 0;
        return parseInt(val.replace(/[^0-9]/g, ""), 10) || 0;
      };
      const jobSal = getNumericSalary(job.salary);
      const filterSal = parseInt(minSalary, 10) || 0;
      const matchesSalary = !filterSal || jobSal >= filterSal;

      const matchesJobType = job.isExternal || jobType === "ALL" || job.jobType === jobType;

      const matchesSkills =
        !skillFilter ||
        job.skillsRequired.some((s) => s.toLowerCase().includes(skillFilter.toLowerCase()));

      const isJobOpen = job.isExternal || job.status === "OPEN" || !job.status;

      return matchesSearch && matchesLocation && matchesSalary && matchesJobType && matchesSkills && isJobOpen;
    });
  }, [combinedJobs, jobSourceFilter, search, location, minSalary, jobType, skillFilter]);

  const displayedJobs = useMemo(() => {
    return filteredJobs.slice(0, page * ITEMS_PER_PAGE);
  }, [filteredJobs, page]);

  const handleApplyClick = async (e, job) => {
    e.stopPropagation();
    if (!user || user.role !== 'CANDIDATE') {
      toast.error('Please login as a candidate to apply');
      return;
    }
    setMatchPreview({ job, data: null });
    setMatchLoading(true);
    try {
      const res = await API.get(`/ats/match?jobId=${job.id}`);
      setMatchPreview({ job, data: res.data.data });
    } catch {
      setMatchPreview({ job, data: null });
    } finally {
      setMatchLoading(false);
    }
  };

  const confirmApply = async () => {
    if (!matchPreview?.job) return;
    await applyToJob(matchPreview.job.id);
    setMatchPreview(null);
  };

  return (
    <div className="w-full p-4 sm:p-6 xl:p-8 text-white">
      
      {/* Upper header summary */}
      <div className="mb-10 text-left">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Aggregated Career Board
        </h1>
        <p className="text-slate-400 mt-2 text-sm md:text-base leading-relaxed">
          Unlock standard vacancies or aggregated remote job matches instantly powered by Gemini AI matching.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 xl:gap-8">
        
        {/* Mobile Filter Toggle Drawer button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 text-slate-300 py-3 rounded-xl mb-1 cursor-pointer w-full font-semibold text-xs"
        >
          <SlidersHorizontal size={14} /> Refine Search Options
        </button>

        {/* Sidebar Filters */}
        <div
          className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 p-6 border-r border-slate-900 transform transition-transform duration-300 ease-in-out overflow-y-auto
            lg:relative lg:translate-x-0 lg:z-0 lg:w-auto lg:bg-transparent lg:p-0 lg:border-0 lg:overflow-visible
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="flex justify-between items-center mb-6 lg:hidden">
            <h4 className="font-bold text-white uppercase text-xs tracking-wider">Refine Options</h4>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-850"
            >
              <X size={15} />
            </button>
          </div>

          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl space-y-6 text-left shadow-lg">
            
            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2.5 text-[10px]">Job Source</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850 text-[10px] font-bold">
                {["ALL", "INTERNAL", "EXTERNAL"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setJobSourceFilter(mode)}
                    className={`py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                      jobSourceFilter === mode ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    {mode.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2.5 text-[10px]">Filter by Region</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input
                  type="text"
                  placeholder="e.g. Bangalore, Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2.5 text-[10px]">Filter by Skills</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input
                  type="text"
                  placeholder="e.g. React, Node.js"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2.5 text-[10px]">Minimum Budget Salary</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input
                  type="text"
                  placeholder="e.g. 500000"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2.5 text-[10px]">Employment Agreement</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-350 focus:outline-none focus:border-blue-500 font-semibold"
              >
                <option value="ALL">All Schedule Agreements</option>
                <option value="FULL_TIME">Full Time Employment</option>
                <option value="PART_TIME">Part Time Employment</option>
                <option value="INTERNSHIP">Internship program</option>
                <option value="CONTRACT">Contract agreement</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSearch("");
                setLocation("");
                setMinSalary("");
                setJobType("ALL");
                setSkillFilter("");
                setJobSourceFilter("ALL");
                setPage(1);
                toast.success("Filters reset successfully");
              }}
              className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-white py-2 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
            >
              Reset Filters
            </button>

          </div>
        </div>

        {/* Backdrop for mobile drawers */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Right side list column */}
        <div className="space-y-6 w-full min-w-0">
          
          {/* Search Input */}
          <div className="relative w-full shadow-md rounded-xl">
            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by keywords, titles, recruiters..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900/60 border border-slate-850 rounded-xl pl-12 pr-4 py-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
             {loading ? Array(6).fill(0).map((_,i) => <JobCardSkeleton key={i} />) :
              displayedJobs.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState
                    icon="💼"
                    title="No Jobs Available"
                    message="New jobs are fetched every 12 hours. Try different keywords or reset filters."
                  />
                </div>
              ) : (
               displayedJobs.map(job => (
                 <JobCard
                   key={job.id}
                   job={job}
                   isApplied={appliedJobIds.has(job.id)}
                   isSaved={savedJobIds.has(job.id)}
                   onApply={handleApplyClick}
                   onToggleSave={toggleSave}
                   onOpen={setSelectedJob}
                   isExternal={!!job.isExternal}
                 />
               ))
             )
            }
          </div>

          {displayedJobs.length < filteredJobs.length && !loading && (
            <div className="text-center mt-8">
              <button onClick={() => setPage(p => p+1)} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer">
                Load More ({filteredJobs.length - displayedJobs.length} remaining)
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Modal overlays */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-950/40">
                <div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-white">{selectedJob.title}</h3>
                  <p className="text-xs text-blue-400 mt-1 font-semibold">
                    🏢 {selectedJob.isExternal ? selectedJob.company : (selectedJob.recruiter?.recruiterProfile?.companyName || selectedJob.recruiter?.companyProfile?.companyName || selectedJob.recruiter?.fullName || "Company")} | 📍 {selectedJob.location} | 💰 {selectedJob.salary || "Not Specified"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 p-2 rounded-xl text-xs font-bold border border-slate-800 cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {/* Modal Menu Tabs */}
              {user?.role === "CANDIDATE" && !selectedJob.isExternal && (
                <div className="flex border-b border-slate-850 bg-slate-950/20 px-6">
                  <button
                    onClick={() => setModalTab("details")}
                    className={`py-4 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                      modalTab === "details" ? "border-b-blue-500 text-blue-400" : "border-transparent text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    <Briefcase size={12} /> Job Details
                  </button>
                  <button
                    onClick={() => setModalTab("gap")}
                    className={`py-4 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                      modalTab === "gap" ? "border-b-blue-500 text-blue-400" : "border-transparent text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    <GraduationCap size={13} /> Skill Compliance Gap
                  </button>
                  <button
                    onClick={() => setModalTab("cover")}
                    className={`py-4 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                      modalTab === "cover" ? "border-b-blue-500 text-blue-400" : "border-transparent text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    <FileText size={12} /> AI Cover Letter
                  </button>
                </div>
              )}

              {/* Modal Body */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-slate-900/40 text-xs md:text-sm">
                
                {/* External Scraped Summary */}
                {selectedJob.isExternal && selectedJob.summary && (
                  <div className="bg-blue-500/5 border border-blue-500/10 p-4.5 rounded-2xl mb-6 flex gap-3 items-start">
                    <Sparkles className="text-blue-400 mt-0.5 shrink-0" size={16} />
                    <div>
                      <h5 className="font-bold text-blue-400 uppercase text-[10px] tracking-wide mb-1">
                        Gemini AI Scraped Summary
                      </h5>
                      <p className="text-slate-350 leading-relaxed">{selectedJob.summary}</p>
                    </div>
                  </div>
                )}

                {modalTab === "details" && (
                  <div className="space-y-6 text-slate-300 leading-relaxed">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Job Description</h4>
                      <p className="whitespace-pre-line text-slate-400 text-xs md:text-sm">{selectedJob.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Technical Skills Compliance</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.skillsRequired?.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-blue-950 text-blue-400 border border-blue-900/20 px-3 py-1.5 rounded-xl text-xs font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === "gap" && <SkillGapAnalysis jobId={selectedJob.id} />}

                {modalTab === "cover" && (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center bg-slate-950/30 p-4 rounded-xl border border-slate-850 text-xs">
                      <p className="text-slate-400 max-w-md">
                        Compiles a tailored cover letter customized specifically to your candidate resume and this JD parameters.
                      </p>
                      <button
                        onClick={handleGenerateCoverLetter}
                        disabled={generatingLetter}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                      >
                        {generatingLetter ? "Generating..." : coverLetterText ? "🔄 Draft Again" : "✨ Write Cover Letter"}
                      </button>
                    </div>

                    {generatingLetter && (
                      <div className="py-12 text-center animate-pulse">
                        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-500 text-xs font-semibold">Gemini AI is parsing and drafting cover letter...</p>
                      </div>
                    )}

                    {!generatingLetter && coverLetterText && (
                      <div className="space-y-4">
                        <textarea
                           rows="10"
                          className="w-full bg-slate-950 border border-slate-850 rounded-2xl p-4.5 text-xs md:text-sm text-slate-300 leading-relaxed focus:outline-none focus:border-blue-500 shadow-inner"
                          value={coverLetterText}
                          onChange={(e) => setCoverLetterText(e.target.value)}
                        ></textarea>

                        <div className="flex gap-2">
                          <button
                            onClick={copyToClipboard}
                            className="bg-slate-850 hover:bg-slate-800 text-slate-200 font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-800"
                          >
                            <Clipboard size={13} /> Copy Text
                          </button>
                          <button
                            onClick={downloadCoverLetterPDF}
                            className="bg-slate-850 hover:bg-slate-800 text-slate-200 font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-800"
                          >
                            <Download size={13} /> Download PDF
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex justify-end gap-2.5">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="bg-slate-850 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer border border-slate-800"
                >
                  Cancel
                </button>
                {user?.role === "CANDIDATE" && (
                  selectedJob.isExternal ? (
                    <a
                      href={selectedJob.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-green-600 hover:bg-green-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md text-center active:scale-95 inline-flex items-center gap-1 cursor-pointer"
                    >
                      Apply Web <ExternalLink size={12} />
                    </a>
                  ) : (
                    appliedJobIds.has(selectedJob.id) ? (
                      <span className="bg-green-900/50 text-green-400 border border-green-800 px-5 py-2.5 rounded-xl text-xs font-bold text-center inline-flex items-center">
                        ✓ Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          handleApplyClick(selectedJob);
                          setSelectedJob(null);
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        Apply Position
                      </button>
                    )
                  )
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Apply modal */}
      {matchPreview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
          onClick={() => setMatchPreview(null)}>
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-0.5">Apply to {matchPreview.job.title}</h2>
            <p className="text-slate-400 text-sm mb-5">{matchPreview.job.company || matchPreview.job.recruiter?.recruiterProfile?.companyName || matchPreview.job.recruiter?.companyProfile?.companyName || matchPreview.job.postedBy?.recruiterProfile?.companyName || 'Company'}</p>

            {matchLoading ? (
              <div className="flex items-center gap-3 text-slate-400 text-sm py-6">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Checking your resume match...
              </div>
            ) : matchPreview.data?.matchScore != null ? (
              <div>
                <div className={`flex items-center gap-4 p-4 rounded-2xl mb-4 ${
                  matchPreview.data.matchScore >= 70 ? 'bg-green-900/20 border border-green-800/50' :
                  matchPreview.data.matchScore >= 40 ? 'bg-amber-900/20 border border-amber-800/50' :
                  'bg-red-900/20 border border-red-800/50'
                }`}>
                  <span className={`text-4xl font-bold ${
                    matchPreview.data.matchScore >= 70 ? 'text-green-400' :
                    matchPreview.data.matchScore >= 40 ? 'text-amber-400' : 'text-red-400'
                  }`}>{matchPreview.data.matchScore}%</span>
                  <div>
                    <p className="text-white font-medium text-sm">Resume Match Score</p>
                    <p className="text-slate-400 text-xs mt-0.5">{matchPreview.data.tip}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {matchPreview.data.matchingSkills?.length > 0 && (
                    <div>
                      <p className="text-xs text-green-400 font-semibold mb-2">✓ You have</p>
                      <div className="flex flex-col gap-1">
                        {matchPreview.data.matchingSkills.slice(0, 4).map((s, i) => (
                          <span key={i} className="text-[11px] bg-green-900/30 text-green-300 border border-green-800/60 rounded-full px-2 py-0.5">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {matchPreview.data.missingSkills?.length > 0 && (
                    <div>
                      <p className="text-xs text-red-400 font-semibold mb-2">✕ Missing</p>
                      <div className="flex flex-col gap-1">
                        {matchPreview.data.missingSkills.slice(0, 4).map((s, i) => (
                          <span key={i} className="text-[11px] bg-red-900/30 text-red-300 border border-red-800/60 rounded-full px-2 py-0.5">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm mb-5 py-4">
                Upload your resume in the candidate dashboard to see how well you match this role before applying.
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setMatchPreview(null)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition-colors">
                Cancel
              </button>
              <button onClick={confirmApply}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors">
                Apply Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
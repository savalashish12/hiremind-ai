import { useEffect, useState, useContext } from "react";
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

const Jobs = () => {
  const routerLocation = useLocation();
  const [jobs, setJobs] = useState([]);
  const [externalJobs, setExternalJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  // Saved jobs IDs state for bookmarks
  const [savedJobIds, setSavedJobIds] = useState(new Set());

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

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await API.get("/jobs");
      setJobs(res.data);
      
      const extRes = await API.get("/jobs/external");
      setExternalJobs(extRes.data);
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

  const applyToJob = async (jobId) => {
    try {
      const res = await API.post("/application/apply", { jobId });
      toast.success(res.data.message || "Applied successfully!");
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
  }, [user, routerLocation.pathname, routerLocation.key]);

  const combinedJobs = [
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

  const filteredJobs = combinedJobs.filter((job) => {
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

  const getCompanyColor = (name) => {
    const colors = [
      "from-blue-500 to-indigo-500",
      "from-purple-500 to-pink-500",
      "from-teal-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-cyan-500 to-blue-500"
    ];
    return colors[name.length % colors.length];
  };

  const getInitials = (name) => {
    if (!name) return "C";
    return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      
      {/* Title */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Available Opportunities
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">Discover internal openings and aggregated placement postings.</p>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-300 font-bold px-4 py-2.5 rounded-xl hover:text-white transition-all text-xs"
        >
          <SlidersHorizontal size={14} /> Filters
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2.5 mb-8 border-b border-slate-900 pb-4">
        <button
          onClick={() => setJobSourceFilter("ALL")}
          className={`px-4.5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer ${
            jobSourceFilter === "ALL"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-850"
          }`}
        >
          🌐 All Positions ({jobs.length + externalJobs.length})
        </button>
        <button
          onClick={() => setJobSourceFilter("INTERNAL")}
          className={`px-4.5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer ${
            jobSourceFilter === "INTERNAL"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-850"
          }`}
        >
          💼 Internal Postings ({jobs.length})
        </button>
        <button
          onClick={() => setJobSourceFilter("EXTERNAL")}
          className={`px-4.5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer ${
            jobSourceFilter === "EXTERNAL"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-850"
          }`}
        >
          🤖 External Scraped Web Jobs ({externalJobs.length})
        </button>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative items-start">
        
        {/* Filters Sidebar (Collapsible in mobile drawer, sticky in desktop) */}
        <aside className={`lg:block bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-850 space-y-6 lg:sticky lg:top-24 w-full z-40 transition-all duration-300 ${
          sidebarOpen ? "fixed inset-y-0 left-0 w-80 z-50 bg-slate-950 p-8 shadow-2xl block overflow-y-auto" : "hidden"
        }`}>
          <div className="flex justify-between items-center lg:hidden pb-4 border-b border-slate-900">
            <h3 className="text-base font-bold text-white">Filter Parameters</h3>
            <button onClick={() => setSidebarOpen(false)} className="p-1 rounded bg-slate-900 border border-slate-850 text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
          
          <h3 className="hidden lg:flex items-center gap-2 text-base font-bold text-slate-200">
            <SlidersHorizontal size={14} className="text-blue-400" /> Filter Criteria
          </h3>

          <div className="space-y-4 text-xs font-medium">
            <div>
              <label className="block text-slate-400 font-semibold mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input
                  type="text"
                  placeholder="Remote, India..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-2">Minimum Salary</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input
                  type="number"
                  placeholder="e.g. 600000"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-2">Job Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Schedules</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-2">Skills Tag Search</label>
              <input
                type="text"
                placeholder="React, Java..."
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={() => {
                setLocation("");
                setMinSalary("");
                setJobType("ALL");
                setSkillFilter("");
                setSearch("");
                setSidebarOpen(false);
              }}
              className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 py-2.5 rounded-xl font-bold transition-all mt-4 border border-slate-850 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </aside>

        {/* Jobs List Panel */}
        <div className="lg:col-span-3 space-y-6 w-full">
          
          {/* Search Input */}
          <div className="relative w-full shadow-md rounded-xl">
            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by keywords, titles, recruiters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-850 rounded-xl pl-12 pr-4 py-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-slate-900/40 p-6 rounded-2xl border border-slate-850 animate-pulse h-44" />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-slate-850">
              <p className="text-lg text-slate-400 font-bold mb-1">No vacancies match your query</p>
              <p className="text-xs text-slate-500">Modify keywords or reset filters sidebar.</p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid gap-5"
            >
              <AnimatePresence>
                {filteredJobs.map((job) => {
                  const companyName = job.isExternal ? job.company : (job.recruiter?.fullName || "Company");
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={job.id}
                      className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-850 hover:border-slate-750 shadow-md hover:shadow-xl hover:shadow-blue-500/[0.01] transition-all relative group"
                    >
                      {/* Bookmark Icon */}
                      {user?.role === "CANDIDATE" && !job.isExternal && (
                        <button
                          onClick={() => toggleSave(job.id)}
                          className={`absolute top-6 right-6 p-2 rounded-xl border transition-all cursor-pointer ${
                            savedJobIds.has(job.id)
                              ? "bg-blue-600/10 border-blue-500 text-blue-400"
                              : "bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300"
                          }`}
                          title={savedJobIds.has(job.id) ? "Unsave Job" : "Save Job"}
                        >
                          <Bookmark size={15} fill={savedJobIds.has(job.id) ? "currentColor" : "none"} />
                        </button>
                      )}

                      {/* External Label Badge */}
                      {job.isExternal && (
                        <span className="absolute top-6 right-6 bg-purple-950/40 border border-purple-900/30 text-purple-300 font-bold px-2.5 py-0.5 rounded-lg text-[9px] tracking-wide uppercase">
                          Aggregated Web
                        </span>
                      )}

                      {/* Header metadata row */}
                      <div className="flex gap-4 items-start mb-4 pr-14">
                        
                        {/* Company initials mock logo */}
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${getCompanyColor(companyName)} flex items-center justify-center font-bold text-white text-sm shadow-md`}>
                          {getInitials(companyName)}
                        </div>

                        <div>
                          <h2
                            onClick={() => {
                              setSelectedJob(job);
                              setModalTab("details");
                              setCoverLetterText("");
                            }}
                            className="text-lg md:text-xl font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
                          >
                            {job.title}
                          </h2>
                          <p className="text-xs text-blue-400 font-medium mt-0.5">
                            🏢 {companyName} {job.isExternal && `(via ${job.source})`}
                          </p>
                        </div>
                      </div>

                      <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-6">
                        <span className="flex items-center gap-1">📍 {job.location}</span>
                        <span className="flex items-center gap-1">💰 {job.salary || "Best in Industry"}</span>
                        {!job.isExternal && (
                          <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-850 uppercase font-semibold text-[9px]">
                            {job.jobType.replace("_", " ")}
                          </span>
                        )}
                      </div>

                      {/* Footer tags and triggers row */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-slate-900/60">
                        <div className="flex flex-wrap gap-1.5">
                          {job.skillsRequired.slice(0, 4).map((skill, index) => (
                            <span
                              key={index}
                              className="bg-blue-500/5 text-blue-400 border border-blue-500/10 px-2.5 py-0.5 rounded-lg text-[10px] font-semibold"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skillsRequired.length > 4 && (
                            <span className="text-slate-600 text-[10px] self-center ml-1">+{job.skillsRequired.length - 4} more</span>
                          )}
                        </div>

                        <div className="flex gap-2.5 w-full sm:w-auto">
                          <button
                            onClick={() => {
                              setSelectedJob(job);
                              setModalTab("details");
                              setCoverLetterText("");
                            }}
                            className="bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold px-4 py-2 rounded-xl transition-all cursor-pointer text-xs flex-1 sm:flex-none text-center"
                          >
                            Details
                          </button>

                          {user?.role === "CANDIDATE" && (
                            job.isExternal ? (
                              <a
                                href={job.applyUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-green-600 hover:bg-green-500 text-white font-bold px-4.5 py-2 rounded-xl transition-all shadow-md active:scale-95 text-xs flex-1 sm:flex-none text-center inline-flex items-center justify-center gap-1 cursor-pointer"
                              >
                                Apply Web <ExternalLink size={12} />
                              </a>
                            ) : (
                              <button
                                onClick={() => applyToJob(job.id)}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-md active:scale-95 text-xs flex-1 sm:flex-none cursor-pointer"
                              >
                                Apply Now
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
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
                    🏢 {selectedJob.isExternal ? selectedJob.company : selectedJob.recruiter?.fullName} | 📍 {selectedJob.location} | 💰 {selectedJob.salary || "Not Specified"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 p-2 rounded-xl text-xs font-bold border border-slate-800"
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
                      modalTab === "details" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    <Briefcase size={12} /> Job Details
                  </button>
                  <button
                    onClick={() => setModalTab("gap")}
                    className={`py-4 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                      modalTab === "gap" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    <GraduationCap size={13} /> Skill Compliance Gap
                  </button>
                  <button
                    onClick={() => setModalTab("cover")}
                    className={`py-4 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                      modalTab === "cover" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-500 hover:text-slate-350"
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
                        {selectedJob.skillsRequired.map((skill, index) => (
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
                    <button
                      onClick={() => {
                        applyToJob(selectedJob.id);
                        setSelectedJob(null);
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Apply Position
                    </button>
                  )
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Jobs;
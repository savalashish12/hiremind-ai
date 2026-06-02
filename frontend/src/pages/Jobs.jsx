import { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import SkillGapAnalysis from "../components/SkillGapAnalysis";
import { jsPDF } from "jspdf";

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

  return (
    <div className="p-10 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-white tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
        Available Jobs
      </h1>

      {/* Tabs for Internal vs External */}
      <div className="flex flex-wrap gap-4 mb-8 border-b border-slate-800 pb-4">
        <button
          onClick={() => setJobSourceFilter("ALL")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            jobSourceFilter === "ALL" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
          }`}
        >
          🌐 All Positions ({jobs.length + externalJobs.length})
        </button>
        <button
          onClick={() => setJobSourceFilter("INTERNAL")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            jobSourceFilter === "INTERNAL" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
          }`}
        >
          💼 Internal Jobs ({jobs.length})
        </button>
        <button
          onClick={() => setJobSourceFilter("EXTERNAL")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            jobSourceFilter === "EXTERNAL" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
          }`}
        >
          🤖 External Scraped Web Jobs ({externalJobs.length})
        </button>
      </div>

      {/* Filter and Search Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
        {/* Left Filters Panel */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 h-fit space-y-6">
          <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            ⚙️ Filters
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location</label>
            <input
              type="text"
              placeholder="e.g. San Francisco, Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Min Salary</label>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Job Type</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="CONTRACT">Contract</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Filter by Skill</label>
            <input
              type="text"
              placeholder="e.g. React, Node.js"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => {
              setLocation("");
              setMinSalary("");
              setJobType("ALL");
              setSkillFilter("");
              setSearch("");
            }}
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded-lg text-sm transition-colors font-semibold"
          >
            Clear All Filters
          </button>
        </div>

        {/* Right Jobs Listing */}
        <div className="lg:col-span-3 space-y-6">
          <div className="w-full">
            <input
              type="text"
              placeholder="Search jobs by title, company, description, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-md transition-all"
            />
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-slate-800 p-6 rounded-xl border border-slate-700 animate-pulse h-40" />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/40 rounded-2xl border border-slate-700">
              <p className="text-xl text-slate-400 mb-2">No matching jobs found</p>
              <p className="text-sm text-slate-500">Try tweaking your search terms or filters.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 relative"
                >
                  {/* Bookmark Button */}
                  {user?.role === "CANDIDATE" && !job.isExternal && (
                    <button
                      onClick={() => toggleSave(job.id)}
                      className="absolute top-6 right-6 p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 transition-all text-xl"
                      title={savedJobIds.has(job.id) ? "Unsave Job" : "Save Job"}
                    >
                      {savedJobIds.has(job.id) ? "🔖" : "🏷️"}
                    </button>
                  )}

                  {/* External Badge */}
                  {job.isExternal && (
                    <span className="absolute top-6 right-6 bg-purple-900/60 border border-purple-800 text-purple-300 font-bold px-3 py-1 rounded-lg text-[10px] tracking-wide uppercase">
                      Aggregated External
                    </span>
                  )}

                  <div className="flex justify-between items-start mb-4 pr-12">
                    <div>
                      <h2
                        onClick={() => {
                          setSelectedJob(job);
                          setModalTab("details");
                          setCoverLetterText("");
                        }}
                        className="text-2xl font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
                      >
                        {job.title}
                      </h2>
                      <p className="text-sm text-blue-400 font-medium mt-1">
                        🏢 {job.isExternal ? `${job.company} (via ${job.source})` : (job.recruiter?.fullName || "Verified Recruiter")}
                      </p>
                    </div>
                    {!job.isExternal && (
                      <span className="bg-slate-700/60 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-300">
                        {job.jobType.replace("_", " ")}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6">
                    <span className="flex items-center gap-1.5">📍 {job.location}</span>
                    <span className="flex items-center gap-1.5">💰 {job.salary || "Not Specified"}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-slate-700/60">
                    <div className="flex flex-wrap gap-2">
                      {job.skillsRequired.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-900/40 text-blue-300 border border-blue-800/30 px-3 py-1 rounded-full text-xs font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setModalTab("details");
                          setCoverLetterText("");
                        }}
                        className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95 text-sm"
                      >
                        View Details
                      </button>

                      {user?.role === "CANDIDATE" && (
                        job.isExternal ? (
                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 text-sm inline-block text-center"
                          >
                            Apply Externally ↗
                          </a>
                        ) : (
                          <button
                            onClick={() => applyToJob(job.id)}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 text-sm"
                          >
                            Apply Now
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Premium Detailed Job Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-950/40">
              <div>
                <h3 className="text-2xl font-extrabold text-white">{selectedJob.title}</h3>
                <p className="text-sm text-blue-400 mt-1">
                  🏢 {selectedJob.isExternal ? `${selectedJob.company} (via ${selectedJob.source})` : selectedJob.recruiter?.fullName} | 📍 {selectedJob.location} | 💰 {selectedJob.salary || "Not specified"}
                </p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-2 rounded-xl text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Navigation */}
            {user?.role === "CANDIDATE" && !selectedJob.isExternal && (
              <div className="flex border-b border-slate-800 bg-slate-950/20 px-6">
                <button
                  onClick={() => setModalTab("details")}
                  className={`py-4 px-6 font-semibold text-sm border-b-2 transition-all ${
                    modalTab === "details" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  📋 Job Details
                </button>
                <button
                  onClick={() => setModalTab("gap")}
                  className={`py-4 px-6 font-semibold text-sm border-b-2 transition-all ${
                    modalTab === "gap" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  ⚡ Skill Gap Analysis
                </button>
                <button
                  onClick={() => setModalTab("cover")}
                  className={`py-4 px-6 font-semibold text-sm border-b-2 transition-all ${
                    modalTab === "cover" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  ✉️ AI Cover Letter
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto flex-1 bg-slate-900/60">
              {/* External Summary */}
              {selectedJob.isExternal && selectedJob.summary && (
                <div className="bg-blue-950/20 border border-blue-900/30 p-5 rounded-2xl mb-6">
                  <h5 className="font-bold text-blue-300 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    ✨ Gemini AI Job Summary
                  </h5>
                  <p className="text-slate-300 text-sm leading-relaxed">{selectedJob.summary}</p>
                </div>
              )}

              {modalTab === "details" && (
                <div className="space-y-6 text-white text-sm leading-relaxed">
                  <div>
                    <h4 className="text-base font-bold text-slate-200 mb-2.5">Job Description</h4>
                    <p className="text-slate-300 whitespace-pre-line">{selectedJob.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-base font-bold text-slate-200 mb-2.5">Key Skills Required</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skillsRequired.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-900/30 text-blue-300 border border-blue-800/20 px-3 py-1.5 rounded-full text-xs font-semibold"
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
                <div className="space-y-6 text-white text-sm">
                  <div className="flex justify-between items-center bg-slate-950/20 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-400 max-w-md">
                      Generate a professional, custom cover letter based on this job description and your profile resume.
                    </p>
                    <button
                      onClick={handleGenerateCoverLetter}
                      disabled={generatingLetter}
                      className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
                    >
                      {generatingLetter ? "Generating..." : coverLetterText ? "🔄 Regenerate" : "✨ Generate Cover Letter"}
                    </button>
                  </div>

                  {generatingLetter && (
                    <div className="py-10 text-center animate-pulse">
                      <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-400 text-xs">Gemini AI is drafting cover letter...</p>
                    </div>
                  )}

                  {!generatingLetter && coverLetterText && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <textarea
                        rows="12"
                        className="w-full bg-slate-950 border border-slate-850 rounded-2xl p-5 text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-purple-500 shadow-inner"
                        value={coverLetterText}
                        onChange={(e) => setCoverLetterText(e.target.value)}
                      ></textarea>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={copyToClipboard}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                        >
                          📋 Copy to Clipboard
                        </button>
                        <button
                          onClick={downloadCoverLetterPDF}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                        >
                          📥 Download as PDF
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex justify-end gap-3">
              <button
                onClick={() => setSelectedJob(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
              >
                Cancel
              </button>
              {user?.role === "CANDIDATE" && (
                selectedJob.isExternal ? (
                  <a
                    href={selectedJob.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md text-center active:scale-95"
                  >
                    Apply Externally ↗
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      applyToJob(selectedJob.id);
                      setSelectedJob(null);
                    }}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md active:scale-95"
                  >
                    Apply Now
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
import { useEffect, useState, useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from "recharts";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Printer,
  UploadCloud,
  Send,
  Trash2,
  Calendar
} from "lucide-react";

import CreateJobForm from "../components/CreateJobForm";
import EditJobModal from "../components/EditJobModal";
import EmptyState from "../components/EmptyState";
import SkeletonCard, { StatCardSkeleton } from "../components/SkeletonCard";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("jobs");
  const [jobs, setJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const { notifications } = useContext(NotificationContext);

  // Upgraded Analytics State
  const [analytics, setAnalytics] = useState({
    totalJobsPosted: 0,
    activeJobs: 0,
    totalApplications: 0,
    thisMonthApplications: 0,
    totalInterviewsScheduled: 0,
    upcomingInterviews: 0,
    totalHired: 0,
    hiringSuccessRate: 0,
    monthlyTrends: [],
    topJobs: [],
    applicationsByStage: [],
    scheduledInterviewsList: []
  });

  // Knowledge base RAG module state
  const [documents, setDocuments] = useState([]);
  const [docFile, setDocFile] = useState(null);
  const [docMeta, setDocMeta] = useState({ title: "", category: "POLICY" });
  const [uploading, setUploading] = useState(false);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [asking, setAsking] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const fetchRecruiterJobs = async () => {
    try {
      const res = await API.get("/jobs/my-jobs");
      setJobs(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await API.get("/recruiter/dashboard/stats");
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await API.get("/ai/knowledge/documents");
      setDocuments(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setDashboardLoading(true);
    Promise.allSettled([fetchRecruiterJobs(), fetchAnalytics(), fetchDocuments()])
      .finally(() => setDashboardLoading(false));
  }, [location.pathname, location.key]);

  const updateJobStatus = async (jobId, newStatus) => {
    try {
      await API.put(`/jobs/${jobId}`, { status: newStatus });
      toast.success(`Job status updated to ${newStatus}`);
      fetchRecruiterJobs();
      fetchAnalytics();
    } catch {
      toast.error("Failed to update job status");
    }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await API.delete(`/jobs/${jobId}`);
      toast.success("Job deleted successfully");
      fetchRecruiterJobs();
      fetchAnalytics();
    } catch {
      toast.error("Failed to delete job");
    }
  };

  // RAG functions
  const handleDocUpload = async (e) => {
    e.preventDefault();
    if (!docFile) return toast.error("Please select a file to upload");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", docFile);
    formData.append("title", docMeta.title || docFile.name);
    formData.append("category", docMeta.category);

    try {
      await API.post("/ai/knowledge/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Document analyzed and stored!");
      setDocFile(null);
      setDocMeta({ title: "", category: "POLICY" });
      fetchDocuments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDocDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await API.delete(`/ai/knowledge/documents/${id}`);
      toast.success("Document deleted");
      fetchDocuments();
    } catch {
      toast.error("Failed to delete document");
    }
  };

  const askRAGAssistant = async (e) => {
    e.preventDefault();
    if (!chatQuestion.trim()) return;
    const userMsg = chatQuestion;
    setChatQuestion("");
    setChatHistory(prev => [...prev, { sender: "recruiter", text: userMsg }]);
    setAsking(true);

    try {
      const res = await API.post("/ai/knowledge/ask", { question: userMsg });
      // New API returns { answer, sources, retrievedChunks }; old fallback is a plain string
      const answer = typeof res.data?.answer === "string" ? res.data.answer : res.data?.answer || "No answer returned.";
      setChatHistory(prev => [...prev, { sender: "ai", text: answer, sources: res.data?.sources || [] }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { sender: "ai", text: error.response?.data?.message || "Failed to query documents." }]);
    } finally {
      setAsking(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  // Pie chart mapping
  const pieData = (analytics.applicationsByStage || []).map(item => ({
    name: item.stage.replace("_", " "),
    value: item.count
  }));

  const colors = ["#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#14b8a6", "#10b981", "#f59e0b"];

  if (dashboardLoading) {
    return (
      <div className="w-full p-4 sm:p-6 xl:p-8 min-h-screen space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid gap-4">{Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 xl:p-8 text-slate-100 print:p-0 print:bg-white print:text-black min-h-screen space-y-8">
      
      {/* 1. HEADER ROW */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900/60 pb-6 print:mb-6 print:pb-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent print:text-black print:bg-none print:text-3xl">
            Recruiter Workspace
          </h1>
          <p className="text-slate-450 text-xs md:text-sm mt-1 print:hidden">Manage open listings, evaluate candidate matching metrics, and query HR guidelines.</p>
        </div>

        {/* Tab Controllers */}
        <div className="flex gap-2.5 print:hidden bg-slate-900/40 p-1 border border-slate-850 rounded-2xl">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "jobs" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            💼 Open Roles
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "analytics" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            📊 Analytics Hub
          </button>
          <button
            onClick={() => setActiveTab("knowledge")}
            className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "knowledge" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            🧠 Knowledge Base
          </button>
        </div>
      </div>

      {/* 2. TAB TRANSITIONS CONTENT */}
      <AnimatePresence mode="wait">
        
        {activeTab === "jobs" && (
          <motion.div
            key="jobs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8 print:hidden"
          >
            <div className="bg-slate-900/60 border border-slate-850 rounded-3xl p-6">
              <CreateJobForm fetchRecruiterJobs={fetchRecruiterJobs} />
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-slate-900 pb-2.5">Corporate Job Postings</h2>
              {jobs.length === 0 ? (
                <EmptyState
                  icon="📋"
                  title="No Jobs Posted"
                  message="Post your first job using the form above to start hiring."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {jobs.map((job) => (
                    <div key={job.id} className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-850 hover:border-slate-800 transition-colors flex flex-col justify-between space-y-6">
                      <div>
                        <div className="flex justify-between items-start gap-3">
                          <h3 className="text-lg font-bold text-white leading-snug">{job.title}</h3>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border ${
                            job.status === "OPEN" ? "bg-green-950 text-green-400 border-green-900/30" :
                            job.status === "PAUSED" ? "bg-yellow-950 text-yellow-400 border-yellow-900/30" : "bg-slate-950 text-slate-400 border-slate-850"
                          }`}>
                            {job.status || "OPEN"}
                          </span>
                        </div>
                        <p className="text-slate-450 text-xs leading-relaxed mt-2 line-clamp-3">{job.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 mt-4">
                          <span className="flex items-center gap-0.5">📍 {job.location}</span>
                          <span className="flex items-center gap-0.5">💰 {job.salary}</span>
                          <span className="flex items-center gap-0.5">🕒 {job.jobType.replace("_", " ")}</span>
                        </div>
                      </div>

                      <div className="space-y-3.5">
                        {/* Status switcher action strip */}
                        <div className="flex gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-850 items-center justify-between text-[10px]">
                          <span className="font-bold text-slate-500">Quick Status:</span>
                          <div className="flex gap-1.5 font-bold">
                            <button
                              onClick={() => updateJobStatus(job.id, "OPEN")}
                              className="bg-green-600/10 text-green-400 hover:bg-green-600 hover:text-white px-2 py-0.5 rounded transition-colors"
                            >
                              Open
                            </button>
                            <button
                              onClick={() => updateJobStatus(job.id, "PAUSED")}
                              className="bg-yellow-600/10 text-yellow-400 hover:bg-yellow-600 hover:text-white px-2 py-0.5 rounded transition-colors"
                            >
                              Pause
                            </button>
                            <button
                              onClick={() => updateJobStatus(job.id, "CLOSED")}
                              className="bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white px-2 py-0.5 rounded transition-colors"
                            >
                              Close
                            </button>
                          </div>
                        </div>

                        {/* Control buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/recruiter/applicants/${job.id}`)}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            View Applicants
                          </button>
                          <button
                            onClick={() => setEditingJob(job)}
                            className="bg-slate-800 hover:bg-slate-755 text-slate-200 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer border border-slate-750"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteJob(job.id)}
                            className="bg-red-950/30 text-red-400 hover:bg-red-650 hover:text-white border border-red-900/20 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "analytics" && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center print:hidden">
              <h2 className="text-xl font-bold text-white">Evaluation Analytics Summary</h2>
              <button
                onClick={printReport}
                className="bg-indigo-650 hover:bg-indigo-600 text-white px-4.5 py-2.5 rounded-xl transition-colors font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={13} /> Export PDF Report
              </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-4 print:gap-4 text-left">
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-850 shadow-md print:bg-white print:text-black print:border-gray-300">
                <span className="text-3xl font-extrabold text-blue-400">{analytics.totalJobsPosted}</span>
                <p className="mt-1 text-slate-400 text-xs print:text-gray-650">Total Vacancies ({analytics.activeJobs} Active)</p>
              </div>
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-850 shadow-md print:bg-white print:text-black print:border-gray-300">
                <span className="text-3xl font-extrabold text-purple-400">{analytics.totalApplications}</span>
                <p className="mt-1 text-slate-400 text-xs print:text-gray-650">Applicants Volume ({analytics.thisMonthApplications} New)</p>
              </div>
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-850 shadow-md print:bg-white print:text-black print:border-gray-300">
                <span className="text-3xl font-extrabold text-yellow-500">{analytics.totalInterviewsScheduled}</span>
                <p className="mt-1 text-slate-400 text-xs print:text-gray-650">Interviews ({analytics.upcomingInterviews} Pending)</p>
              </div>
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-850 shadow-md print:bg-white print:text-black print:border-gray-300">
                <span className="text-3xl font-extrabold text-green-400">{analytics.totalHired}</span>
                <p className="mt-1 text-slate-400 text-xs print:text-gray-650">Hires (Success: {analytics.hiringSuccessRate}%)</p>
              </div>
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Line chart: Applications vs Hires */}
              <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-850 shadow-md print:bg-white print:border-gray-300 text-left">
                <h3 className="text-sm font-bold text-white mb-6 print:text-black">Applications Trend Timeline</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={analytics.monthlyTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }} />
                      <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} name="Applications" />
                      <Line type="monotone" dataKey="hires" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Hires" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Donut chart: Stages */}
              <div className="lg:col-span-1 bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-850 shadow-md print:bg-white print:border-gray-300 text-left">
                <h3 className="text-sm font-bold text-white mb-6 print:text-black">Applications Stages Compliancy</h3>
                <div className="h-[250px] flex items-center justify-center">
                  {pieData.length === 0 ? (
                    <p className="text-slate-500 text-center py-20 text-xs">No stage metrics logged.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={3}
                          label={{ fill: '#94a3b8', fontSize: 9 }}
                        >
                          {pieData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Bar chart: Top Jobs */}
              <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-850 shadow-md print:bg-white print:border-gray-300 text-left">
                <h3 className="text-sm font-bold text-white mb-6 print:text-black">Top Jobs Sourcing Volume</h3>
                <div className="h-[250px]">
                  {analytics.topJobs?.length === 0 ? (
                    <p className="text-slate-500 text-center py-20 text-xs">No application logs across job vacancies.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analytics.topJobs || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="jobTitle" stroke="#64748b" tick={{ fontSize: 9 }} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }} />
                        <Bar dataKey="applicationCount" fill="#a855f7" radius={[4, 4, 0, 0]} name="Applications" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Recent notifications logger feed */}
              <div className="lg:col-span-1 bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-850 shadow-md flex flex-col h-[340px] text-left">
                <h3 className="text-sm font-bold text-white mb-4">Sourcing Activity Feed</h3>
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
                  {notifications.length === 0 ? (
                    <p className="text-slate-550 text-center py-20 italic">No recent activities.</p>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div key={n.id} className="bg-slate-950/70 p-3 rounded-xl border border-slate-850/60 flex flex-col gap-1 leading-normal">
                        <div className="flex justify-between items-center text-[9px] font-mono">
                          <span className="font-bold text-blue-400">{n.title}</span>
                          <span className="text-slate-550">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-400">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Scheduled interviews */}
            <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-850 shadow-md text-left">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-500" /> Corporate Meeting Schedules
              </h3>
              {!analytics.scheduledInterviewsList || analytics.scheduledInterviewsList.length === 0 ? (
                <p className="text-slate-500 text-xs py-8 text-center italic">No active interviews scheduled.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-850">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 font-semibold">
                        <th className="p-4 border-b border-slate-850">Candidate Initiator</th>
                        <th className="p-4 border-b border-slate-850">Role Profile</th>
                        <th className="p-4 border-b border-slate-850">Scheduled Date / Time</th>
                        <th className="p-4 border-b border-slate-850">Link</th>
                        <th className="p-4 border-b border-slate-850 text-right">Interviewer Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-300">
                      {analytics.scheduledInterviewsList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-white">{item.candidate?.fullName}</p>
                            <p className="text-[10px] text-slate-500">{item.candidate?.email}</p>
                          </td>
                          <td className="p-4 text-slate-350">{item.job?.title}</td>
                          <td className="p-4 font-semibold text-slate-350">
                            {item.interviewDate ? new Date(item.interviewDate).toLocaleDateString() : ""} - {item.interviewTime || "N/A"}
                          </td>
                          <td className="p-4">
                            {item.interviewLink ? (
                              <a
                                href={item.interviewLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-400 hover:underline font-bold"
                              >
                                Join Call 🔗
                              </a>
                            ) : (
                              <span className="text-slate-600">No Link</span>
                            )}
                          </td>
                          <td className="p-4 text-slate-450 truncate max-w-xs text-right" title={item.interviewerNotes || ""}>
                            {item.interviewerNotes || "None"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </motion.div>
        )}

        {activeTab === "knowledge" && (
          <motion.div
            key="knowledge"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left print:hidden"
          >
            {/* Upload guidelines files panel */}
            <div className="lg:col-span-4 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-850 space-y-6 h-fit text-xs font-semibold">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5 border-b border-slate-950 pb-3">
                <UploadCloud size={16} className="text-blue-500" /> Upload Policies
              </h3>
              
              <form onSubmit={handleDocUpload} className="space-y-4">
                <div>
                  <label className="block text-slate-400 mb-1.5">Document Title</label>
                  <input
                    type="text"
                    placeholder="e.g. TCS Interview Checklist"
                    value={docMeta.title}
                    onChange={(e) => setDocMeta({ ...docMeta, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5">Category</label>
                  <select
                    value={docMeta.category}
                    onChange={(e) => setDocMeta({ ...docMeta, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="POLICY">Company Policy</option>
                    <option value="JD">Job Description (JD)</option>
                    <option value="GUIDELINE">Interview Guidelines</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5">Select PDF / TXT File</label>
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={(e) => setDocFile(e.target.files[0])}
                    className="w-full text-slate-450 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-blue-600/10 file:text-blue-400 hover:file:bg-blue-600/20 cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading || !docFile}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer mt-2"
                >
                  {uploading ? "Analyzing & Storing..." : "Upload Guidelines Document"}
                </button>
              </form>

              <div className="border-t border-slate-950 pt-5 space-y-3">
                <h4 className="font-bold text-xs text-slate-350">Indexed Guidelines ({documents.length})</h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {documents.length === 0 ? (
                    <p className="text-slate-500 font-medium italic">No indexed files.</p>
                  ) : (
                    documents.map(d => (
                      <div key={d.id} className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex justify-between items-center text-[11px] gap-3">
                        <div className="truncate">
                          <p className="font-bold text-slate-200 truncate" title={d.title}>{d.title}</p>
                          <span className="text-[9px] text-slate-500 font-bold uppercase">{d.category}{d.content ? ` · ~${Math.ceil(d.content.length / 900)} chunks` : ""}</span>
                        </div>
                        <button
                          onClick={() => handleDocDelete(d.id)}
                          className="text-red-500 hover:text-red-400 font-bold cursor-pointer transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* RAG Chat assistant */}
            <div className="lg:col-span-8 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-850 flex flex-col h-[550px] overflow-hidden shadow-lg">
              <div className="bg-slate-950/60 p-4 border-b border-slate-850">
                <h3 className="font-bold text-purple-400 flex items-center gap-1.5">
                  <Brain size={16} /> Knowledge Base AI Assistant (RAG)
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Asks questions about leaves, jd profiles, or interview guidelines indexes on the fly.</p>
              </div>

              {/* Chat histories */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/20 font-sans text-xs">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-slate-500 py-24 italic leading-relaxed">
                    💬 No queries executed yet. Type questions like:<br />
                    "Summarize our React interview checklist requirements." or "What is our guidelines leave policy?"
                  </div>
                ) : (
                  chatHistory.map((chat, idx) => (
                    <div key={idx} className={`flex ${chat.sender === "recruiter" ? "justify-end" : "justify-start"}`}>
                      <div className={`p-3.5 rounded-2xl max-w-md ${
                        chat.sender === "recruiter"
                          ? "bg-blue-600 text-white rounded-tr-none shadow-md"
                          : "bg-slate-950 text-slate-350 border border-slate-850 rounded-tl-none leading-relaxed shadow-sm"
                      }`}>
                        <p className="whitespace-pre-wrap">{chat.text}</p>
                        {chat.sender !== "recruiter" && chat.sources?.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-1">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-purple-400">Sources ({chat.sources.length})</p>
                            {chat.sources.map((s) => (
                              <p key={s.docId} className="text-[10px] text-slate-400" title={s.excerpt}>
                                📄 <span className="font-semibold text-slate-300">{s.title}</span>
                                <span className="text-slate-500"> · {s.category}</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                
                {asking && (
                  <div className="flex justify-start">
                    <div className="bg-slate-950 border border-slate-855 p-3 rounded-2xl rounded-tl-none text-slate-500 animate-pulse font-semibold">
                      AI assistant is parsing documents context...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={askRAGAssistant} className="p-4 bg-slate-950/80 border-t border-slate-900 flex gap-3">
                <input
                  type="text"
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  placeholder="Ask something about company policies guidelines..."
                  className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={asking || !chatQuestion.trim()}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all cursor-pointer inline-flex items-center gap-1"
                >
                  Ask AI <Send size={12} />
                </button>
              </form>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          fetchRecruiterJobs={fetchRecruiterJobs}
          fetchAnalytics={fetchAnalytics}
        />
      )}
    </div>
  );
};

export default RecruiterDashboard;
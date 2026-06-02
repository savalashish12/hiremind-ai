import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from "recharts";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

import CreateJobForm from "../components/CreateJobForm";
import EditJobModal from "../components/EditJobModal";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("jobs");
  const [jobs, setJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null);

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
    applicationsByStage: []
  });

  // Knowledge base RAG module state
  const [documents, setDocuments] = useState([]);
  const [docFile, setDocFile] = useState(null);
  const [docMeta, setDocMeta] = useState({ title: "", category: "POLICY" });
  const [uploading, setUploading] = useState(false);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [asking, setAsking] = useState(false);

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
    fetchRecruiterJobs();
    fetchAnalytics();
    fetchDocuments();
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
    } catch (error) {
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
      setChatHistory(prev => [...prev, { sender: "ai", text: res.data.answer }]);
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
    name: item.stage,
    value: item.count
  }));

  const colors = ["#3b82f6", "#6366f1", "#a855f7", "#eab308", "#14b8a6", "#22c55e"];

  return (
    <div className="p-10 max-w-7xl mx-auto print:p-0 print:bg-white print:text-black">
      {/* Print Hide Navbar area and dashboard title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 print:mb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent print:text-black print:bg-none print:text-3xl">
            Recruiter Dashboard
          </h1>
          <p className="text-slate-400 mt-1 print:hidden">Manage open roles, analyze statistics, and query policy databases.</p>
        </div>

        <div className="flex gap-3 print:hidden">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "jobs" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            💼 Manage Jobs
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "analytics" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            📊 Analytics Hub
          </button>
          <button
            onClick={() => setActiveTab("knowledge")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "knowledge" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            🧠 Knowledge Base
          </button>
        </div>
      </div>

      {activeTab === "jobs" && (
        <div className="space-y-10 print:hidden animate-in fade-in duration-300">
          <CreateJobForm fetchRecruiterJobs={fetchRecruiterJobs} />

          <div className="grid gap-6">
            <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-3">Active Postings</h2>
            {jobs.length === 0 ? (
              <p className="text-slate-400">No jobs posted yet. Build a new posting above to start receiving candidates!</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <div key={job.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-white">{job.title}</h3>
                        <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                          job.status === "OPEN" ? "bg-green-950 text-green-300" :
                          job.status === "PAUSED" ? "bg-yellow-955 text-yellow-300" : "bg-slate-700 text-slate-300"
                        }`}>
                          {job.status || "OPEN"}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm line-clamp-3 mb-4">{job.description}</p>
                      
                      <div className="flex gap-4 text-xs text-slate-400 mb-6">
                        <span>📍 {job.location}</span>
                        <span>💰 {job.salary}</span>
                        <span>🕒 {job.jobType.replace("_", " ")}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Status quick actions */}
                      <div className="flex gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-700/60 items-center justify-between text-xs">
                        <span className="font-semibold text-slate-400">Change Status:</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => updateJobStatus(job.id, "OPEN")}
                            className="bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white px-2 py-1 rounded transition-all font-bold"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => updateJobStatus(job.id, "PAUSED")}
                            className="bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600 hover:text-white px-2 py-1 rounded transition-all font-bold"
                          >
                            Pause
                          </button>
                          <button
                            onClick={() => updateJobStatus(job.id, "CLOSED")}
                            className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-2 py-1 rounded transition-all font-bold"
                          >
                            Close
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate(`/applicants/${job.id}`)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl transition-all"
                        >
                          View Applicants
                        </button>
                        <button
                          onClick={() => setEditingJob(job)}
                          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteJob(job.id)}
                          className="bg-red-900/40 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/20 px-4 py-2 rounded-xl transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-10 animate-in fade-in duration-300">
          <div className="flex justify-between items-center print:hidden">
            <h2 className="text-2xl font-bold text-white">Visual Platform Metrics</h2>
            <button
              onClick={printReport}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg transition-colors font-bold shadow-md shadow-indigo-900/30 flex items-center gap-2"
            >
              🖨️ Export PDF Report
            </button>
          </div>

          {/* Cards metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md print:bg-white print:text-black print:border-gray-300">
              <h3 className="text-3xl font-extrabold text-blue-400">{analytics.totalJobsPosted}</h3>
              <p className="mt-1 text-slate-400 text-sm print:text-gray-600">Jobs Posted ({analytics.activeJobs} Active)</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md print:bg-white print:text-black print:border-gray-300">
              <h3 className="text-3xl font-extrabold text-purple-400">{analytics.totalApplications}</h3>
              <p className="mt-1 text-slate-400 text-sm print:text-gray-600">Applications ({analytics.thisMonthApplications} New)</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md print:bg-white print:text-black print:border-gray-300">
              <h3 className="text-3xl font-extrabold text-yellow-500">{analytics.totalInterviewsScheduled}</h3>
              <p className="mt-1 text-slate-400 text-sm print:text-gray-600">Interviews ({analytics.upcomingInterviews} Upcoming)</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md print:bg-white print:text-black print:border-gray-300">
              <h3 className="text-3xl font-extrabold text-green-400">{analytics.totalHired}</h3>
              <p className="mt-1 text-slate-400 text-sm print:text-gray-600">Hires (Success Rate: {analytics.hiringSuccessRate}%)</p>
            </div>
          </div>

          {/* Upgraded charts layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Line chart: Applications vs Hires */}
            <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md print:bg-white print:border-gray-300">
              <h3 className="text-lg font-bold text-white mb-6 print:text-black">Monthly Applications vs Hires</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.monthlyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name="Applications" />
                    <Line type="monotone" dataKey="hires" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Hires" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut chart: Stages */}
            <div className="lg:col-span-1 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md print:bg-white print:border-gray-300">
              <h3 className="text-lg font-bold text-white mb-6 print:text-black">Applications by Stage</h3>
              <div className="h-[300px]">
                {pieData.length === 0 ? (
                  <p className="text-slate-500 text-center py-20 text-xs">No application stages logged yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={5}
                        label
                      >
                        {pieData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Bar chart: Top Jobs */}
            <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md print:bg-white print:border-gray-300">
              <h3 className="text-lg font-bold text-white mb-6 print:text-black">Top 5 Jobs by Application Volume</h3>
              <div className="h-[300px]">
                {analytics.topJobs?.length === 0 ? (
                  <p className="text-slate-500 text-center py-20 text-xs">No active applications across your job postings.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.topJobs || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="jobTitle" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip />
                      <Bar dataKey="applicationCount" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Applications" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="lg:col-span-1 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md flex flex-col h-[360px]">
              <h3 className="text-lg font-bold text-white mb-4">Recent Activity Feed</h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {notifications.length === 0 ? (
                  <p className="text-slate-500 text-center py-20">No recent activity detected.</p>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div key={n.id} className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-blue-400">{n.title}</span>
                        <span className="text-slate-500">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Scheduled Interviews Section */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md mt-8">
            <h3 className="text-lg font-bold text-white mb-4">🗓️ Scheduled Interviews List</h3>
            {!analytics.scheduledInterviewsList || analytics.scheduledInterviewsList.length === 0 ? (
              <p className="text-slate-400 text-sm">No interviews scheduled yet. Change an applicant's status to "Interview Scheduled" to set one up!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-900 text-slate-300">
                      <th className="p-4 border-b border-slate-700">Candidate</th>
                      <th className="p-4 border-b border-slate-700">Job Title</th>
                      <th className="p-4 border-b border-slate-700">Date & Time</th>
                      <th className="p-4 border-b border-slate-700">Meeting Link</th>
                      <th className="p-4 border-b border-slate-700">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.scheduledInterviewsList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-700/50 transition-colors border-b border-slate-700/60">
                        <td className="p-4 font-semibold text-slate-200">
                          <div>
                            <p>{item.candidate?.fullName}</p>
                            <p className="text-xs text-slate-400">{item.candidate?.email}</p>
                          </div>
                        </td>
                        <td className="p-4 text-slate-300">{item.job?.title}</td>
                        <td className="p-4 text-slate-300">
                          {item.interviewDate ? new Date(item.interviewDate).toLocaleDateString() : ""} - {item.interviewTime || "N/A"}
                        </td>
                        <td className="p-4">
                          {item.interviewLink ? (
                            <a
                              href={item.interviewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:underline font-semibold"
                            >
                              Join Call 🔗
                            </a>
                          ) : (
                            <span className="text-slate-500">No Link</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-400 text-xs truncate max-w-xs" title={item.interviewerNotes || ""}>
                          {item.interviewerNotes || "None"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "knowledge" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden animate-in fade-in duration-300">
          {/* Docs upload panel */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-6 h-fit">
            <h3 className="text-xl font-bold text-white">📁 Document Base</h3>
            
            <form onSubmit={handleDocUpload} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-2">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Leave Policy, HR Guidelines"
                  value={docMeta.title}
                  onChange={(e) => setDocMeta({ ...docMeta, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-2">Category</label>
                <select
                  value={docMeta.category}
                  onChange={(e) => setDocMeta({ ...docMeta, category: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="POLICY">Company Policy</option>
                  <option value="JD">Job Description (JD)</option>
                  <option value="GUIDELINE">Interview Guidelines</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-2">Select File (PDF or Text)</label>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={(e) => setDocFile(e.target.files[0])}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600/10 file:text-blue-400 hover:file:bg-blue-600/20"
                />
              </div>

              <button
                type="submit"
                disabled={uploading || !docFile}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm transition-all disabled:opacity-50"
              >
                {uploading ? "Analyzing..." : "Upload & Index Document"}
              </button>
            </form>

            <div className="border-t border-slate-700 pt-6">
              <h4 className="font-bold text-sm text-slate-200 mb-3">Indexed Documents ({documents.length})</h4>
              <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                {documents.map(d => (
                  <div key={d.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-200 truncate max-w-[150px]">{d.title}</p>
                      <span className="text-[10px] text-slate-500 font-bold tracking-wide uppercase">{d.category}</span>
                    </div>
                    <button
                      onClick={() => handleDocDelete(d.id)}
                      className="text-red-500 hover:text-red-400 font-bold"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RAG interactive chatbot */}
          <div className="lg:col-span-2 bg-slate-800 rounded-2xl border border-slate-700 flex flex-col h-[550px] overflow-hidden shadow-lg">
            <div className="bg-slate-900 p-4 border-b border-slate-700">
              <h3 className="font-bold text-purple-400 flex items-center gap-2">
                🤖 Knowledge AI Assistant (RAG)
              </h3>
              <p className="text-xs text-slate-500 mt-1">Queries the uploaded policy documents and guidelines to answer questions instantly.</p>
            </div>

            {/* Chats */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-900/30">
              {chatHistory.length === 0 ? (
                <div className="text-center text-slate-500 py-20 text-sm">
                  💬 Ask questions like: "What is our leave policy for interns?" or "Summarize our React interview guidelines."
                </div>
              ) : (
                chatHistory.map((chat, idx) => (
                  <div key={idx} className={`flex ${chat.sender === "recruiter" ? "justify-end" : "justify-start"}`}>
                    <div className={`p-3.5 rounded-2xl max-w-md text-sm ${
                      chat.sender === "recruiter"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none leading-relaxed"
                    }`}>
                      {chat.text}
                    </div>
                  </div>
                ))
              )}
              {asking && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl rounded-tl-none text-xs text-slate-400 animate-pulse">
                    AI Assistant is thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={askRAGAssistant} className="p-4 bg-slate-900 border-t border-slate-700 flex gap-3">
              <input
                type="text"
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                placeholder="Ask something about company policies..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={asking || !chatQuestion.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
              >
                Ask AI
              </button>
            </form>
          </div>
        </div>
      )}

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
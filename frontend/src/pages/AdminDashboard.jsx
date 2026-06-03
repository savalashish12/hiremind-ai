import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Users,
  Briefcase,
  FileText,
  Clock,
  Trash2,
  Lock,
  Unlock,
  Layers,
  Activity,
  Heart,
  TrendingUp,
  Search
} from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logSearch, setLogSearch] = useState("");

  const fetchAnalytics = async () => {
    try {
      const res = await API.get("/admin/analytics");
      setAnalytics(res.data);
    } catch {
      toast.error("Failed to fetch admin analytics");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch {
      toast.error("Failed to fetch users");
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await API.get("/admin/jobs");
      setJobs(res.data);
    } catch {
      toast.error("Failed to fetch jobs");
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await API.get("/admin/activity-logs");
      setLogs(res.data);
    } catch {
      toast.error("Failed to fetch system logs");
    }
  };

  const toggleSuspension = async (id, currentStatus) => {
    try {
      const nextStatus = !currentStatus;
      await API.put(`/admin/users/${id}/suspend`, { isSuspended: nextStatus });
      toast.success(`User ${nextStatus ? "suspended" : "activated"} successfully`);
      fetchUsers();
      fetchAnalytics();
    } catch {
      toast.error("Failed to update suspension status");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user and all their profile data? This action is irreversible.")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success("User deleted successfully");
      fetchUsers();
      fetchAnalytics();
      fetchJobs();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting? This will delete all applications submitted for it.")) return;
    try {
      await API.delete(`/admin/jobs/${jobId}`);
      toast.success("Job posting deleted");
      fetchJobs();
      fetchAnalytics();
    } catch {
      toast.error("Failed to delete job posting");
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchAnalytics(), fetchUsers(), fetchJobs(), fetchLogs()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const roleChartData = analytics ? [
    { name: "Candidates", value: analytics.totalUsers - analytics.activeRecruiters - 1 },
    { name: "Recruiters", value: analytics.activeRecruiters },
    { name: "Admin", value: 1 }
  ] : [];

  const COLORS = ["#3b82f6", "#a855f7", "#ef4444"];

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(logSearch.toLowerCase()) ||
    l.details.toLowerCase().includes(logSearch.toLowerCase()) ||
    l.userId.toLowerCase().includes(logSearch.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen space-y-8 text-slate-100">
      
      {/* Title */}
      <div className="flex justify-between items-center border-b border-slate-900/60 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Admin Administration Panel
          </h1>
          <p className="text-slate-450 text-xs md:text-sm mt-1">Audit active profiles, review platform analytics, and manage database records.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 bg-slate-900/40 p-1 border border-slate-850 rounded-2xl">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "overview" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            📈 Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "users" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            👥 Users
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "jobs" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            💼 Jobs
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "logs" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            📜 Activity Logs
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 bg-slate-900/40 rounded-3xl border border-slate-850" />
          <div className="h-60 bg-slate-900/40 rounded-3xl border border-slate-850" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          
          {activeTab === "overview" && analytics && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8 text-left"
            >
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
                <div className="bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-850 shadow-md">
                  <span className="text-2xl font-black text-blue-400">{analytics.totalUsers}</span>
                  <p className="mt-1 text-slate-400 text-[10px] uppercase font-bold tracking-wider">Total Users</p>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-850 shadow-md">
                  <span className="text-2xl font-black text-purple-400">{analytics.activeRecruiters}</span>
                  <p className="mt-1 text-slate-400 text-[10px] uppercase font-bold tracking-wider">Recruiters</p>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-850 shadow-md">
                  <span className="text-2xl font-black text-emerald-400">{analytics.totalCandidates || (analytics.totalUsers - analytics.activeRecruiters - 1)}</span>
                  <p className="mt-1 text-slate-400 text-[10px] uppercase font-bold tracking-wider">Candidates</p>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-850 shadow-md">
                  <span className="text-2xl font-black text-yellow-500">{analytics.totalJobs}</span>
                  <p className="mt-1 text-slate-400 text-[10px] uppercase font-bold tracking-wider">Open Jobs</p>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-850 shadow-md">
                  <span className="text-2xl font-black text-pink-400">{analytics.totalApplications}</span>
                  <p className="mt-1 text-slate-400 text-[10px] uppercase font-bold tracking-wider">Applications</p>
                </div>
              </div>

              {/* System Health Section */}
              <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-850 shadow-md space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5 border-b border-slate-950 pb-3">
                  <Activity size={15} className="text-emerald-400" /> Platform Infrastructure Health
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex justify-between items-center">
                    <span className="text-slate-450">PostgreSQL DB</span>
                    <span className="text-green-400 flex items-center gap-1">● Active</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex justify-between items-center">
                    <span className="text-slate-450">Prisma client</span>
                    <span className="text-green-400 flex items-center gap-1">● Sync</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex justify-between items-center">
                    <span className="text-slate-450">Gemini AI API</span>
                    <span className="text-green-400 flex items-center gap-1">● Online</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex justify-between items-center">
                    <span className="text-slate-450">Nodemailer MT</span>
                    <span className="text-green-400 flex items-center gap-1">● Loaded</span>
                  </div>
                </div>
              </div>

              {/* Charts grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pie Chart */}
                <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-850 shadow-md">
                  <h3 className="text-sm font-bold text-white mb-6">User Accounts Ratio</h3>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={roleChartData} dataKey="value" nameKey="name" outerRadius={90} label={{ fill: '#94a3b8', fontSize: 10 }}>
                          {roleChartData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-850 shadow-md">
                  <h3 className="text-sm font-bold text-white mb-6">Database Records Count</h3>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: "Users", count: analytics.totalUsers },
                        { name: "Vacancies", count: analytics.totalJobs },
                        { name: "Applications", count: analytics.totalApplications }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Record Volume" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-3xl overflow-hidden shadow-lg text-left"
            >
              <div className="p-6 border-b border-slate-850 bg-slate-950/40">
                <h2 className="text-xl font-bold text-white">Manage Registrants Database</h2>
                <p className="text-xs text-slate-450 mt-1">Suspend access or purge redundant accounts records.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 font-semibold">
                      <th className="p-4 border-b border-slate-850">User Profile Name</th>
                      <th className="p-4 border-b border-slate-850">Email Address</th>
                      <th className="p-4 border-b border-slate-850">System Role</th>
                      <th className="p-4 border-b border-slate-850">Access Status</th>
                      <th className="p-4 border-b border-slate-850">Signup Timestamp</th>
                      <th className="p-4 border-b border-slate-850 text-right">Moderator Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="p-4 font-bold text-white">{user.fullName}</td>
                        <td className="p-4 text-slate-350">{user.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border ${
                            user.role === 'ADMIN' ? 'bg-red-950 text-red-400 border-red-900/30' : 
                            user.role === 'RECRUITER' ? 'bg-purple-950 text-purple-400 border-purple-900/30' : 'bg-blue-950 text-blue-400 border-blue-900/30'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 font-bold">
                          <span className={`px-2 py-0.5 rounded text-[9px] ${
                            user.isSuspended ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-green-500/10 text-green-400 border border-green-500/20"
                          }`}>
                            {user.isSuspended ? "SUSPENDED" : "ACTIVE"}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2 text-xs">
                          <button
                            onClick={() => toggleSuspension(user.id, user.isSuspended)}
                            disabled={user.role === "ADMIN"}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer disabled:opacity-30 ${
                              user.isSuspended 
                                ? "bg-green-600/10 text-green-400 hover:bg-green-600 hover:text-white border border-green-500/20"
                                : "bg-yellow-600/10 text-yellow-400 hover:bg-yellow-600 hover:text-white border border-yellow-500/20"
                            }`}
                          >
                            {user.isSuspended ? "Re-Activate" : "Suspend"}
                          </button>
                          <button 
                            onClick={() => deleteUser(user.id)}
                            disabled={user.role === 'ADMIN'}
                            className="bg-red-650/10 text-red-400 hover:bg-red-650 hover:text-white border border-red-500/20 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer disabled:opacity-30"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === "jobs" && (
            <motion.div
              key="jobs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-3xl overflow-hidden shadow-lg text-left"
            >
              <div className="p-6 border-b border-slate-850 bg-slate-950/40">
                <h2 className="text-xl font-bold text-white">Manage Vacancies Listings</h2>
                <p className="text-xs text-slate-450 mt-1">Purge vacancies records and associated applications pipelines from the database.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 font-semibold">
                      <th className="p-4 border-b border-slate-850">Role Title</th>
                      <th className="p-4 border-b border-slate-850">Recruiter Host</th>
                      <th className="p-4 border-b border-slate-850">Location</th>
                      <th className="p-4 border-b border-slate-850">CTC Salary</th>
                      <th className="p-4 border-b border-slate-850">Created Date</th>
                      <th className="p-4 border-b border-slate-850 text-right">Moderator Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-855 text-slate-350">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="p-4 font-bold text-white">{job.title}</td>
                        <td className="p-4 text-slate-300">
                          <div>
                            <p className="font-bold text-slate-200">{job.recruiter?.fullName}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{job.recruiter?.email}</p>
                          </div>
                        </td>
                        <td className="p-4 text-slate-350">{job.location}</td>
                        <td className="p-4 text-slate-350">{job.salary || "N/A"}</td>
                        <td className="p-4 text-slate-500">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => deleteJob(job.id)}
                            className="bg-red-650/10 text-red-400 hover:bg-red-650 hover:text-white border border-red-500/20 px-4.5 py-2 rounded-xl font-bold cursor-pointer transition-colors"
                          >
                            Purge Listing
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === "logs" && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-3xl overflow-hidden shadow-lg text-left space-y-4 p-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-850">
                <div>
                  <h2 className="text-xl font-bold text-white">System Audit Log Trail</h2>
                  <p className="text-xs text-slate-450 mt-1">Audit logs representing actions dispatched across system modules.</p>
                </div>
                
                {/* Audit logs filter input */}
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Search logs details..."
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-550 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-850">
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 font-semibold sticky top-0 z-15 shadow">
                        <th className="p-4 border-b border-slate-850">Timestamp</th>
                        <th className="p-4 border-b border-slate-850">Action Event Code</th>
                        <th className="p-4 border-b border-slate-850">Event Details Log</th>
                        <th className="p-4 border-b border-slate-850">User ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-855 text-slate-350">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-10 text-slate-500 italic">No activity audit logs found matching criteria.</td>
                        </tr>
                      ) : (
                        filteredLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                            <td className="p-4 text-slate-500 font-mono text-[10px]">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="p-4 font-bold">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border ${
                                log.action.includes('CREATED') ? 'bg-green-500/5 text-green-400 border-green-500/10' :
                                log.action.includes('UPLOADED') ? 'bg-blue-500/5 text-blue-400 border-blue-500/10' :
                                log.action.includes('SCHEDULED') ? 'bg-yellow-500/5 text-yellow-400 border-yellow-500/10' : 'bg-purple-500/5 text-purple-400 border-purple-500/10'
                              }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="p-4 text-slate-200 leading-normal">{log.details}</td>
                            <td className="p-4 text-slate-500 font-mono text-[10px] truncate max-w-[150px]" title={log.userId}>
                              {log.userId}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      )}

    </div>
  );
};

export default AdminDashboard;

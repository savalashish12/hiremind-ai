import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-300">
      <h1 className="text-4xl font-extrabold mb-10 text-white bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
        Admin Administration Panel
      </h1>

      {/* Tabs list */}
      <div className="flex flex-wrap gap-4 border-b border-slate-800 mb-8 pb-3">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === "overview" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          📈 Platform Overview
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === "users" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          👥 Manage Users
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === "jobs" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          💼 Manage Jobs
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === "logs" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          📜 Activity Audit Logs
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 bg-slate-800 rounded-xl" />
          <div className="h-60 bg-slate-800 rounded-xl" />
        </div>
      ) : (
        <>
          {activeTab === "overview" && analytics && (
            <div className="space-y-10">
              {/* Stat Cards */}
              <div className="grid md:grid-cols-5 gap-6">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md">
                  <h2 className="text-3xl font-extrabold text-blue-400">{analytics.totalUsers}</h2>
                  <p className="mt-1 text-slate-400 text-xs uppercase tracking-wide">Total Users</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md">
                  <h2 className="text-3xl font-extrabold text-purple-400">{analytics.activeRecruiters}</h2>
                  <p className="mt-1 text-slate-400 text-xs uppercase tracking-wide">Recruiters</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md">
                  <h2 className="text-3xl font-extrabold text-emerald-400">{analytics.totalCandidates || (analytics.totalUsers - analytics.activeRecruiters - 1)}</h2>
                  <p className="mt-1 text-slate-400 text-xs uppercase tracking-wide">Candidates</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md">
                  <h2 className="text-3xl font-extrabold text-yellow-400">{analytics.totalJobs}</h2>
                  <p className="mt-1 text-slate-400 text-xs uppercase tracking-wide">Jobs Posted</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md">
                  <h2 className="text-3xl font-extrabold text-pink-400">{analytics.totalApplications}</h2>
                  <p className="mt-1 text-slate-400 text-xs uppercase tracking-wide">Applications</p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Role Ratio Chart */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md">
                  <h3 className="text-xl font-bold text-white mb-6">User Roles Breakdown</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={roleChartData} dataKey="value" nameKey="name" outerRadius={100} label>
                          {roleChartData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Performance volume chart */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md">
                  <h3 className="text-xl font-bold text-white mb-6">System Volume Counts</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: "Users", count: analytics.totalUsers },
                        { name: "Jobs", count: analytics.totalJobs },
                        { name: "Applications", count: analytics.totalApplications }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
              <div className="p-6 border-b border-slate-700 bg-slate-900/40">
                <h2 className="text-2xl font-bold text-white">Manage Registrants</h2>
                <p className="text-xs text-slate-400 mt-1">Suspend access or delete account records from the database.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-900 text-slate-300">
                      <th className="p-4 border-b border-slate-700">Full Name</th>
                      <th className="p-4 border-b border-slate-700">Email Address</th>
                      <th className="p-4 border-b border-slate-700">System Role</th>
                      <th className="p-4 border-b border-slate-700">Status</th>
                      <th className="p-4 border-b border-slate-700">Joined On</th>
                      <th className="p-4 border-b border-slate-700 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-700/50 transition-colors border-b border-slate-700/60">
                        <td className="p-4 font-semibold text-slate-200">{user.fullName}</td>
                        <td className="p-4 text-slate-300">{user.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${
                            user.role === 'ADMIN' ? 'bg-red-950 text-red-300 border border-red-900/30' : 
                            user.role === 'RECRUITER' ? 'bg-purple-950 text-purple-300 border border-purple-900/30' : 'bg-blue-950 text-blue-300 border border-blue-900/30'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            user.isSuspended ? "bg-red-900 text-red-200 animate-pulse" : "bg-green-900 text-green-200"
                          }`}>
                            {user.isSuspended ? "SUSPENDED" : "ACTIVE"}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2.5">
                          <button
                            onClick={() => toggleSuspension(user.id, user.isSuspended)}
                            disabled={user.role === "ADMIN"}
                            className={`px-3 py-1 rounded transition-colors text-xs font-bold disabled:opacity-40 ${
                              user.isSuspended 
                                ? "bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white"
                                : "bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600 hover:text-white"
                            }`}
                          >
                            {user.isSuspended ? "Activate" : "Suspend"}
                          </button>
                          <button 
                            onClick={() => deleteUser(user.id)}
                            disabled={user.role === 'ADMIN'}
                            className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-3 py-1 rounded transition-colors text-xs font-bold disabled:opacity-40"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "jobs" && (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
              <div className="p-6 border-b border-slate-700 bg-slate-900/40">
                <h2 className="text-2xl font-bold text-white">Manage Job Postings</h2>
                <p className="text-xs text-slate-400 mt-1">Review or delete jobs currently indexable across the system.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-900 text-slate-300">
                      <th className="p-4 border-b border-slate-700">Job Title</th>
                      <th className="p-4 border-b border-slate-700">Recruiter</th>
                      <th className="p-4 border-b border-slate-700">Location</th>
                      <th className="p-4 border-b border-slate-700">Salary</th>
                      <th className="p-4 border-b border-slate-700">Created On</th>
                      <th className="p-4 border-b border-slate-700 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-700/50 transition-colors border-b border-slate-700/60">
                        <td className="p-4 font-semibold text-slate-200">{job.title}</td>
                        <td className="p-4 text-slate-300">
                          <div>
                            <p className="font-bold text-slate-200">{job.recruiter?.fullName}</p>
                            <p className="text-[10px] text-slate-550">{job.recruiter?.email}</p>
                          </div>
                        </td>
                        <td className="p-4 text-slate-300">{job.location}</td>
                        <td className="p-4 text-slate-300">{job.salary || "N/A"}</td>
                        <td className="p-4 text-slate-400">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => deleteJob(job.id)}
                            className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-xl transition-colors text-xs font-bold"
                          >
                            Delete Posting
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
              <div className="p-6 border-b border-slate-700 bg-slate-900/40">
                <h2 className="text-2xl font-bold text-white">System Activity Audit Trail</h2>
                <p className="text-xs text-slate-400 mt-1">Audit log records representing operations performed across the system.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-900 text-slate-300">
                      <th className="p-4 border-b border-slate-700">Timestamp</th>
                      <th className="p-4 border-b border-slate-700">Action Event</th>
                      <th className="p-4 border-b border-slate-700">Operation Details</th>
                      <th className="p-4 border-b border-slate-700">Initiator ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-slate-500 font-medium italic">No activity logs recorded yet.</td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-700/50 transition-colors border-b border-slate-700/60">
                          <td className="p-4 text-slate-450 font-mono text-xs">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${
                              log.action.includes('CREATED') ? 'bg-green-950 text-green-300 border border-green-900/30' :
                              log.action.includes('UPLOADED') ? 'bg-blue-950 text-blue-300 border border-blue-900/30' :
                              log.action.includes('SCHEDULED') ? 'bg-yellow-950 text-yellow-300 border border-yellow-900/30' : 'bg-purple-950 text-purple-300 border border-purple-900/30'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="p-4 text-slate-200">{log.details}</td>
                          <td className="p-4 text-slate-450 font-mono text-xs truncate max-w-[150px]" title={log.userId}>
                            {log.userId}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

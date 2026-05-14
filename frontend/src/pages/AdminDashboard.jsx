import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);

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

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      fetchUsers();
      fetchAnalytics();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchUsers();
  }, []);

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-300">
      <h1 className="text-4xl font-bold mb-10 text-white">Admin Dashboard</h1>

      {analytics && (
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-3xl font-bold text-blue-400">{analytics.totalUsers}</h2>
            <p className="mt-2 text-slate-400">Total Users</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-3xl font-bold text-purple-400">{analytics.activeRecruiters}</h2>
            <p className="mt-2 text-slate-400">Recruiters</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-3xl font-bold text-green-400">{analytics.totalJobs}</h2>
            <p className="mt-2 text-slate-400">Total Jobs</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-3xl font-bold text-yellow-400">{analytics.totalApplications}</h2>
            <p className="mt-2 text-slate-400">Applications</p>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <h2 className="text-2xl font-bold p-6 border-b border-slate-700">Manage Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-300">
                <th className="p-4 border-b border-slate-700">Name</th>
                <th className="p-4 border-b border-slate-700">Email</th>
                <th className="p-4 border-b border-slate-700">Role</th>
                <th className="p-4 border-b border-slate-700">Joined</th>
                <th className="p-4 border-b border-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="p-4 border-b border-slate-700 font-medium">{user.fullName}</td>
                  <td className="p-4 border-b border-slate-700 text-slate-300">{user.email}</td>
                  <td className="p-4 border-b border-slate-700">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      user.role === 'ADMIN' ? 'bg-red-900 text-red-200' : 
                      user.role === 'RECRUITER' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 border-b border-slate-700 text-sm text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 border-b border-slate-700 text-right">
                    <button 
                      onClick={() => deleteUser(user.id)}
                      disabled={user.role === 'ADMIN'}
                      className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-3 py-1 rounded transition-colors disabled:opacity-50"
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
    </div>
  );
};

export default AdminDashboard;

import { useEffect, useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const fetchUsers = async () => {
    try { const res = await API.get("/admin/users"); setUsers(Array.isArray(res.data) ? res.data : []); }
    catch { toast.error("Failed to fetch users"); }
  };
  useEffect(() => { fetchUsers(); }, []);
  const toggle = async (id, cur) => {
    try { await API.put(`/admin/users/${id}/suspend`, { isSuspended: !cur }); toast.success("Updated"); fetchUsers(); }
    catch { toast.error("Failed"); }
  };
  const del = async (id) => {
    if (!window.confirm("Delete user + all data? Irreversible.")) return;
    try { await API.delete(`/admin/users/${id}`); toast.success("Deleted"); fetchUsers(); }
    catch { toast.error("Failed"); }
  };
  const shown = users.filter((u) => filter === "ALL" || u.role === filter);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-extrabold text-white">Users ({shown.length}/{users.length})</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200">
          <option value="ALL">All roles</option><option value="CANDIDATE">Candidates</option><option value="RECRUITER">Recruiters</option><option value="ADMIN">Admins</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead><tr className="bg-slate-950 text-slate-400"><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {shown.map((u) => (
              <tr key={u.id} className="hover:bg-slate-900/40">
                <td className="p-4 font-bold text-white">{u.fullName}</td><td className="p-4">{u.email}</td>
                <td className="p-4"><span className="text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700">{u.role}</span></td>
                <td className="p-4">{u.isSuspended ? <span className="text-red-400 font-bold">SUSPENDED</span> : <span className="text-green-400 font-bold">ACTIVE</span>}</td>
                <td className="p-4 text-right space-x-2">
                  <button disabled={u.role === "ADMIN"} onClick={() => toggle(u.id, u.isSuspended)} className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl font-bold disabled:opacity-30">{u.isSuspended ? "Activate" : "Suspend"}</button>
                  <button disabled={u.role === "ADMIN"} onClick={() => del(u.id)} className="bg-red-600/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-xl font-bold disabled:opacity-30">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;

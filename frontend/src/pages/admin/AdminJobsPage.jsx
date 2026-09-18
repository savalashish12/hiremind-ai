import { useEffect, useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const fetchJobs = async () => {
    try { const res = await API.get("/admin/jobs"); setJobs(Array.isArray(res.data) ? res.data : []); }
    catch { toast.error("Failed to fetch jobs"); }
  };
  useEffect(() => { fetchJobs(); }, []);
  const del = async (id) => {
    if (!window.confirm("Delete job + all applications?")) return;
    try { await API.delete(`/admin/jobs/${id}`); toast.success("Deleted"); fetchJobs(); }
    catch { toast.error("Failed"); }
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-white">All Jobs ({jobs.length})</h1>
      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead><tr className="bg-slate-950 text-slate-400"><th className="p-4">Title</th><th className="p-4">Recruiter</th><th className="p-4">Location</th><th className="p-4">Salary</th><th className="p-4 text-right">Action</th></tr></thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {jobs.map((j) => (
              <tr key={j.id} className="hover:bg-slate-900/40">
                <td className="p-4 font-bold text-white">{j.title}</td>
                <td className="p-4">{j.recruiter?.fullName}<p className="text-[10px] text-slate-500">{j.recruiter?.email}</p></td>
                <td className="p-4">{j.location}</td><td className="p-4">{j.salary || "—"}</td>
                <td className="p-4 text-right"><button onClick={() => del(j.id)} className="bg-red-600/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl font-bold">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminJobsPage;

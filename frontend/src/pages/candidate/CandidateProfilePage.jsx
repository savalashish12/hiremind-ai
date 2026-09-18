import { useEffect, useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

const CandidateProfilePage = () => {
  const [form, setForm] = useState({ linkedinUrl: "", githubUrl: "", portfolioUrl: "", profileImage: "", certifications: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/auth/profile");
        const cp = res.data?.candidateProfile || {};
        setForm({
          linkedinUrl: cp.linkedinUrl || "", githubUrl: cp.githubUrl || "",
          portfolioUrl: cp.portfolioUrl || "", profileImage: cp.profileImage || "",
          certifications: (cp.certifications || []).join(", "),
        });
      } catch { toast.error("Failed to load profile"); }
      finally { setLoading(false); }
    })();
  }, []);

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await API.put("/auth/candidate/profile", form); toast.success("Profile updated!"); }
    catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-6 text-slate-400 text-sm animate-pulse">Loading profile...</div>;
  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-white">Edit Profile</h1>
      <form onSubmit={save} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
        {[["profileImage", "Profile Image URL"], ["linkedinUrl", "LinkedIn URL"], ["githubUrl", "GitHub URL"], ["portfolioUrl", "Portfolio URL"]].map(([k, label]) => (
          <div key={k}><label className="block text-slate-400 font-bold mb-1.5">{label}</label>
          <input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500" /></div>
        ))}
        <div><label className="block text-slate-400 font-bold mb-1.5">Certifications (comma-separated)</label>
        <textarea rows="3" value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500" /></div>
        <button disabled={saving} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl">{saving ? "Saving..." : "Save Profile"}</button>
      </form>
    </div>
  );
};

export default CandidateProfilePage;

import { useEffect, useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";
import ResumeUpload from "../../components/ResumeUpload";
import { Link } from "react-router-dom";

const ResumeUploadPage = () => {
  const [profile, setProfile] = useState(null);
  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/profile");
      setProfile(res.data);
    } catch { toast.error("Failed to fetch profile"); }
  };
  useEffect(() => { fetchProfile(); }, []);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Resume Upload & ATS</h1>
        <p className="text-xs text-slate-400 mt-1">Upload PDF → Gemini parses skills, experience, summary. Re-upload archives old versions.</p>
      </div>
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
        <ResumeUpload fetchProfile={fetchProfile} currentResumeUrl={profile?.candidateProfile?.resumeUrl} />
      </div>
      {profile?.candidateProfile?.resumeUrl && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 text-xs text-slate-300 space-y-2">
          <p><span className="text-slate-500 font-bold uppercase text-[10px]">Current resume: </span><a href={profile.candidateProfile.resumeUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">View PDF</a></p>
          <p><span className="text-slate-500 font-bold uppercase text-[10px]">Skills: </span>{(profile.candidateProfile.skills || []).join(", ") || "—"}</p>
          <Link to="/candidate/ats-score" className="inline-block mt-2 text-blue-400 font-bold hover:underline">Check detailed ATS breakdown →</Link>
        </div>
      )}
      {profile?.candidateProfile?.resumeHistory?.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 text-xs">
          <h3 className="font-bold text-white mb-3">Resume history ({profile.candidateProfile.resumeHistory.length})</h3>
          <ul className="space-y-2 text-slate-400">
            {profile.candidateProfile.resumeHistory.map((r, i) => (
              <li key={i} className="flex justify-between gap-3"><span className="truncate">{r.name}</span><span className="text-slate-600 shrink-0">{new Date(r.uploadedAt).toLocaleString()}</span></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResumeUploadPage;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";

const CandidateApplications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState("");

  const fetchApps = async () => {
    try {
      const res = await API.get("/application/my-applications");
      setApps(Array.isArray(res.data) ? res.data : res.data.applications || []);
    } catch {
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApps(); }, []);

  const respond = async (appId, decision) => {
    if (!window.confirm(decision === "ACCEPT" ? "Accept this offer?" : "Decline this offer?")) return;
    setRespondingId(appId);
    try {
      await API.patch(`/application/${appId}/respond`, { decision });
      toast.success("Response recorded!");
      fetchApps();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setRespondingId("");
    }
  };

  if (loading) return <div className="p-6 text-slate-400 text-sm animate-pulse">Loading applications...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-white">My Applications ({apps.length})</h1>
      {apps.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500">
          No applications yet. <Link to="/candidate/jobs" className="text-blue-400 font-bold hover:underline">Browse jobs →</Link>
        </div>
      ) : apps.map((app) => (
        <div key={app.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-sm">
          <div className="flex justify-between items-start gap-3">
            <div>
              <h3 className="font-bold text-white">{app.job?.title || "Position"}</h3>
              <p className="text-xs text-slate-400">{app.job?.location} · {app.pipelineStage} · {app.status}</p>
              {app.matchScore != null && <p className="text-[11px] text-green-400 mt-1">{app.matchScore}% match</p>}
              {app.interviewDate && (
                <p className="text-[11px] text-blue-400 mt-1">📅 {new Date(app.interviewDate).toLocaleDateString()} {app.interviewTime || ""} {app.interviewLink && <a href={app.interviewLink} target="_blank" rel="noreferrer" className="underline">Join →</a>}</p>
              )}
            </div>
            <span className="text-[10px] text-slate-500">{new Date(app.createdAt).toLocaleDateString()}</span>
          </div>
          {app.offerLetterUrl && (
            <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap gap-2 items-center">
              <a href={app.offerLetterUrl} target="_blank" rel="noreferrer" className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-xl">Download Offer</a>
              {app.status === "OFFERED" && (
                <>
                  <button disabled={respondingId === app.id} onClick={() => respond(app.id, "ACCEPT")} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl">Accept</button>
                  <button disabled={respondingId === app.id} onClick={() => respond(app.id, "DECLINE")} className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold px-4 py-2 rounded-xl">Decline</button>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CandidateApplications;

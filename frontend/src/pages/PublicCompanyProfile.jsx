import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

const PublicCompanyProfile = () => {
  const { recruiterId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPublicProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`/recruiter/company-profile/${recruiterId}`);
      if (res.data.success && res.data.data) {
        setProfile(res.data.data);
      } else {
        setError("Company profile not initialized by this recruiter.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch company profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicProfile();
  }, [recruiterId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-white">
        <p className="text-red-400 font-bold">⚠️ {error || "Profile Not Found"}</p>
        <a href="/" className="mt-4 bg-slate-800 text-xs px-4 py-2 rounded-lg inline-block font-semibold">
          Return Home
        </a>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-4xl mx-auto text-white">
      <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-slate-700">
          {profile.logo ? (
            <img src={profile.logo} alt="Company Logo" className="w-20 h-20 object-cover rounded-2xl border border-slate-700 shadow-md" />
          ) : (
            <div className="w-20 h-20 bg-blue-600 flex items-center justify-center text-2xl font-bold rounded-2xl shadow-md">
              {profile.companyName ? profile.companyName.charAt(0) : "C"}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-extrabold">{profile.companyName}</h1>
            <p className="text-sm text-blue-400 font-medium mt-1">
              🏢 {profile.industry || "Industry category"} | 📍 {profile.location || "Location undefined"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/50 p-5 rounded-2xl border border-slate-850 text-xs">
          <div>
            <span className="text-slate-500 font-bold block mb-0.5">Website</span>
            {profile.website ? (
              <a href={profile.website} target="_blank" rel="noreferrer" className="text-blue-450 hover:underline">
                Visit Site ↗
              </a>
            ) : (
              <span className="text-slate-400">-</span>
            )}
          </div>
          <div>
            <span className="text-slate-500 font-bold block mb-0.5">Team Size</span>
            <span className="text-slate-200">{profile.teamSize || "-"}</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold block mb-0.5">Founded</span>
            <span className="text-slate-200">{profile.founded || "-"}</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold block mb-0.5">Headquarters</span>
            <span className="text-slate-200">{profile.location || "-"}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-200">About the Company</h2>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {profile.about || "No additional description available."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicCompanyProfile;

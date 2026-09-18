import { useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

const CompanyProfileManager = () => {
  const [profile, setProfile] = useState({
    companyName: "",
    logo: "",
    website: "",
    industry: "",
    teamSize: "",
    about: "",
    location: "",
    founded: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await API.get("/recruiter/company-profile");
      if (res.data.success && res.data.data) {
        setProfile({
          companyName: res.data.data.companyName || "",
          logo: res.data.data.logo || "",
          website: res.data.data.website || "",
          industry: res.data.data.industry || "",
          teamSize: res.data.data.teamSize || "",
          about: res.data.data.about || "",
          location: res.data.data.location || "",
          founded: res.data.data.founded || "",
        });
      }
    } catch (err) {
      console.log("Could not load company profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("logo", file);

    try {
      const res = await API.post("/recruiter/company-profile/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setProfile((prev) => ({ ...prev, logo: res.data.data.url }));
        toast.success("Logo uploaded to Cloudinary!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload logo image");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile.companyName.trim()) return toast.error("Company name is required");

    setLoading(true);
    try {
      const res = await API.patch("/recruiter/company-profile", profile);
      if (res.data.success) {
        toast.success("Company profile saved successfully!");
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save company profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 xl:p-8 text-white">
      <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
        Company Profile Manager
      </h1>
      <p className="text-slate-400 mb-10">
        Setup your brand details to present to candidates on job postings and company hubs.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-slate-200">Company Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={profile.companyName}
                onChange={handleTextChange}
                placeholder="e.g. Acme Corp"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Website URL</label>
              <input
                type="url"
                name="website"
                value={profile.website}
                onChange={handleTextChange}
                placeholder="e.g. https://acme.org"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Industry</label>
              <select
                name="industry"
                value={profile.industry}
                onChange={handleTextChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Industry</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Finance & Fintech">Finance & Fintech</option>
                <option value="Healthcare">Healthcare</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Team Size</label>
              <select
                name="teamSize"
                value={profile.teamSize}
                onChange={handleTextChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Team Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleTextChange}
                placeholder="e.g. San Francisco, CA"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Founded Year</label>
              <input
                type="number"
                name="founded"
                value={profile.founded}
                onChange={handleTextChange}
                placeholder="e.g. 2021"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Company Logo</label>
            <div className="flex items-center gap-4">
              {profile.logo ? (
                <img src={profile.logo} alt="Logo" className="w-14 h-14 object-cover rounded-xl border border-slate-750" />
              ) : (
                <div className="w-14 h-14 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center text-xs text-slate-500 font-bold">Logo</div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600/10 file:text-blue-400 hover:file:bg-blue-600/20 cursor-pointer"
              />
            </div>
            {uploadingLogo && <p className="text-[10px] text-blue-400 mt-1">Uploading logo to Cloudinary...</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">About the Company</label>
            <textarea
              name="about"
              value={profile.about}
              onChange={handleTextChange}
              rows="4"
              placeholder="Tell candidates about your company's mission, values, and stack..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-3 rounded-xl disabled:opacity-50 transition-all text-sm"
          >
            {loading ? "Saving Changes..." : "Save Profile Details"}
          </button>
        </form>

        {/* Live Preview Panel */}
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl space-y-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-4 border-b border-slate-700 pb-2">
              Candidate View Live Preview
            </span>

            <div className="flex items-center gap-4 mb-6">
              {profile.logo ? (
                <img src={profile.logo} alt="Company Logo" className="w-16 h-16 object-cover rounded-2xl border border-slate-700 shadow-md" />
              ) : (
                <div className="w-16 h-16 bg-blue-600 flex items-center justify-center text-xl font-bold rounded-2xl shadow-md">
                  {profile.companyName ? profile.companyName.charAt(0) : "C"}
                </div>
              )}
              <div>
                <h3 className="text-2xl font-extrabold">{profile.companyName || "Acme Corporation"}</h3>
                <p className="text-xs text-blue-400 mt-1 font-semibold">
                  {profile.industry || "Industry category"} | {profile.location || "Location undefined"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-850 text-xs mb-6">
              <div>
                <span className="text-slate-500 font-bold block mb-0.5">Website</span>
                {profile.website ? (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                    {profile.website}
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

            <div className="space-y-2">
              <h4 className="font-bold text-sm text-slate-200">About the Company</h4>
              <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                {profile.about || "Specify company insights to showcase your team culture and workspace perks to prospective applicants."}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700 bg-slate-800/20 text-center">
            <span className="text-[10px] text-slate-500 font-medium">
              Profile will be active at public URL: <strong className="text-slate-400">/company/[recruiter_id]</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfileManager;

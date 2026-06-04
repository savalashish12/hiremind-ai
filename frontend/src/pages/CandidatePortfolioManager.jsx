import { useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

const CandidatePortfolioManager = () => {
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // GitHub Stats State
  const [gitStats, setGitStats] = useState(null);
  const [fetchingGit, setFetchingGit] = useState(false);

  // Loading States
  const [loading, setLoading] = useState(false);

  // Credentials upload state
  const [degreeFile, setDegreeFile] = useState(null);
  const [certificatesFiles, setCertificatesFiles] = useState([]);
  const [uploadingCreds, setUploadingCreds] = useState(false);
  const [degreeUrl, setDegreeUrl] = useState("");
  const [certUrls, setCertUrls] = useState([]);

  // Dynamic Array form states
  const [newProject, setNewProject] = useState({ name: "", techStack: "", description: "", githubUrl: "", liveUrl: "" });
  const [newCert, setNewCert] = useState({ name: "", issuer: "", date: "", url: "" });
  const [newAchievement, setNewAchievement] = useState("");

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await API.get("/candidate/portfolio");
      if (res.data.success && res.data.data) {
        const data = res.data.data;
        setGithubUrl(data.githubUrl || "");
        setLinkedinUrl(data.linkedinUrl || "");
        setPortfolioUrl(data.portfolioUrl || "");
        setProjects(data.projects || []);
        setCertifications(data.certifications || []);
        setAchievements(data.achievements || []);

        // Load credentials data
        const profile = data.candidate?.candidateProfile;
        if (profile) {
          setDegreeUrl(profile.degreeUrl || "");
          setCertUrls(profile.certUrls || []);
        }
      }
    } catch (err) {
      console.log("Could not load portfolio data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const parseGithubUsername = (url) => {
    if (!url) return null;
    const cleanUrl = url.trim().replace(/\/$/, ""); // Remove trailing slash
    const parts = cleanUrl.split("/");
    const userIndex = parts.indexOf("github.com") + 1;
    if (userIndex > 0 && userIndex < parts.length) {
      return parts[userIndex];
    }
    return null;
  };

  const fetchGithubStats = async (url) => {
    const username = parseGithubUsername(url);
    if (!username) {
      setGitStats(null);
      return;
    }

    setFetchingGit(true);
    try {
      const res = await fetch(`https://api.github.com/users/${username}`);
      if (res.ok) {
        const data = await res.json();
        setGitStats({
          avatar: data.avatar_url,
          username: data.login,
          name: data.name,
          repos: data.public_repos,
          followers: data.followers,
          bio: data.bio,
        });
      } else {
        setGitStats(null);
      }
    } catch (err) {
      console.log(err);
      setGitStats(null);
    } finally {
      setFetchingGit(false);
    }
  };

  useEffect(() => {
    if (githubUrl) {
      const delayDebounceFn = setTimeout(() => {
        fetchGithubStats(githubUrl);
      }, 1000);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setGitStats(null);
    }
  }, [githubUrl]);

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject.name || !newProject.description) {
      return toast.error("Project Name and Description are required");
    }
    setProjects((prev) => [...prev, newProject]);
    setNewProject({ name: "", techStack: "", description: "", githubUrl: "", liveUrl: "" });
    toast.success("Project added to draft!");
  };

  const handleAddCert = (e) => {
    e.preventDefault();
    if (!newCert.name || !newCert.issuer) {
      return toast.error("Certificate Name and Issuer are required");
    }
    setCertifications((prev) => [...prev, newCert]);
    setNewCert({ name: "", issuer: "", date: "", url: "" });
    toast.success("Certification added to draft!");
  };

  const handleAddAchievement = (e) => {
    e.preventDefault();
    if (!newAchievement.trim()) return;
    setAchievements((prev) => [...prev, newAchievement.trim()]);
    setNewAchievement("");
    toast.success("Achievement added to draft!");
  };

  const handleSavePortfolio = async () => {
    setLoading(true);
    try {
      const res = await API.post("/candidate/portfolio", {
        githubUrl,
        linkedinUrl,
        portfolioUrl,
        projects,
        certifications,
        achievements,
      });

      if (res.data.success) {
        toast.success("Portfolio saved successfully!");
        fetchPortfolio();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save portfolio");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!degreeFile && certificatesFiles.length === 0) {
      return toast.error("Please select a degree or certificate file to upload");
    }

    setUploadingCreds(true);
    const formData = new FormData();
    if (degreeFile) {
      formData.append("degree", degreeFile);
    }
    if (certificatesFiles.length > 0) {
      for (const file of certificatesFiles) {
        formData.append("certificates", file);
      }
    }

    try {
      const res = await API.post("/candidate/upload-credentials", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        toast.success("Verification documents uploaded successfully!");
        setDegreeFile(null);
        setCertificatesFiles([]);
        fetchPortfolio();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to upload verification documents");
    } finally {
      setUploadingCreds(false);
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto text-white">
      <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
        My Portfolio Space
      </h1>
      <p className="text-slate-400 mb-10">
        Setup your credentials, showcase projects, and sync your GitHub stats to build a public resume page.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Inputs panel */}
        <div className="lg:col-span-2 space-y-8">
          {/* Base URLs */}
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
            <h2 className="text-lg font-bold text-slate-200">Social Connections</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">GitHub Profile URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">LinkedIn Profile URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Personal Portfolio URL</label>
                <input
                  type="url"
                  placeholder="https://mywebsite.com"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Credentials Verification Uploads */}
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-6">
            <h2 className="text-lg font-bold text-slate-200">Degree & Certificates Verification Hub</h2>
            <p className="text-xs text-slate-400">
              Upload your degree certificates and course certificates in PDF or Text format to make them verified and visible to recruiters.
            </p>

            <form onSubmit={handleUploadCredentialsSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Degree upload */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-750">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 text-blue-400">
                    Upload Degree PDF
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={(e) => setDegreeFile(e.target.files[0])}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 cursor-pointer"
                  />
                  {degreeUrl && (
                    <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-800/80 pt-2">
                      <span className="text-emerald-400 font-bold">✓ Verified Degree Uploaded</span>
                      <a href={`http://localhost:5000/api/candidate/document?url=${encodeURIComponent(degreeUrl)}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                        View Degree PDF ↗
                      </a>
                    </div>
                  )}
                </div>

                {/* Certificates Upload */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-750">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 text-blue-400">
                    Upload Course Certificates
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.txt"
                    onChange={(e) => setCertificatesFiles(Array.from(e.target.files))}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 cursor-pointer"
                  />
                  {certUrls && certUrls.length > 0 && (
                    <div className="mt-3 space-y-1 border-t border-slate-800/80 pt-2">
                      <span className="text-emerald-400 font-bold text-xs block">✓ Uploaded Certificates ({certUrls.length}):</span>
                      <ul className="list-disc ml-4 text-[11px] text-slate-400 space-y-1 max-h-24 overflow-y-auto">
                        {certUrls.map((cert, idx) => (
                          <li key={idx}>
                            <a href={`http://localhost:5000/api/candidate/document?url=${encodeURIComponent(cert.url)}`} target="_blank" rel="noreferrer" className="hover:underline text-blue-400">
                              {cert.name || `Cert ${idx + 1}`}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={uploadingCreds || (!degreeFile && certificatesFiles.length === 0)}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all active:scale-95 flex items-center gap-1.5"
              >
                {uploadingCreds ? "Uploading to Cloudinary..." : "🚀 Upload Selected Documents"}
              </button>
            </form>
          </div>

          {/* Projects builder */}
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-6">
            <h2 className="text-lg font-bold text-slate-200">Manage Projects ({projects.length})</h2>
            
            {/* Added project list */}
            {projects.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-700/60">
                {projects.map((proj, idx) => (
                  <div key={idx} className="bg-slate-900/65 p-4 rounded-xl border border-slate-850 relative">
                    <button
                      onClick={() => setProjects(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-400 font-bold text-xs"
                    >
                      ✕ Remove
                    </button>
                    <h4 className="font-bold text-slate-200 text-sm">{proj.name}</h4>
                    <span className="text-[10px] text-blue-400 font-bold block mt-0.5">{proj.techStack}</span>
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-3">{proj.description}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddProject} className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Add Project</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Tech Stack (e.g. React, Redux, Node)"
                  value={newProject.techStack}
                  onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <textarea
                placeholder="Brief project details, accomplishments, or problems solved..."
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                rows="2"
              ></textarea>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="url"
                  placeholder="GitHub Link (optional)"
                  value={newProject.githubUrl}
                  onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type="url"
                  placeholder="Live URL (optional)"
                  value={newProject.liveUrl}
                  onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="bg-slate-700 hover:bg-slate-600 font-bold px-4 py-2 rounded-lg text-xs transition-all"
              >
                + Add Project to Draft
              </button>
            </form>
          </div>

          {/* Certifications builder */}
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-6">
            <h2 className="text-lg font-bold text-slate-200">Manage Certifications ({certifications.length})</h2>

            {certifications.length > 0 && (
              <div className="divide-y divide-slate-700/50 pb-6 border-b border-slate-700/60">
                {certifications.map((c, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 text-xs">
                    <div>
                      <p className="font-bold text-slate-200">{c.name}</p>
                      <span className="text-slate-500">{c.issuer} | {c.date}</span>
                    </div>
                    <button
                      onClick={() => setCertifications(prev => prev.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-400 font-bold text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddCert} className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Add Certification</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Cert Name (e.g. AWS practitioner)"
                  value={newCert.name}
                  onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Issuer (e.g. Amazon Web Services)"
                  value={newCert.issuer}
                  onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Date Earned (e.g. Dec 2025)"
                  value={newCert.date}
                  onChange={(e) => setNewCert({ ...newCert, date: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <input
                type="url"
                placeholder="Verification link (optional)"
                value={newCert.url}
                onChange={(e) => setNewCert({ ...newCert, url: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-slate-700 hover:bg-slate-600 font-bold px-4 py-2 rounded-lg text-xs transition-all"
              >
                + Add Cert to Draft
              </button>
            </form>
          </div>

          {/* Achievements builder */}
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-6">
            <h2 className="text-lg font-bold text-slate-200">Achievements ({achievements.length})</h2>

            {achievements.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-6 border-b border-slate-700/60">
                {achievements.map((a, idx) => (
                  <div key={idx} className="bg-slate-900/80 border border-slate-850 px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs text-slate-300">
                    <span>🏆 {a}</span>
                    <button
                      onClick={() => setAchievements(prev => prev.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-400 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddAchievement} className="flex gap-4">
              <input
                type="text"
                placeholder="e.g. Winner at Hackindia Hackathon 2025, First Class in MCA..."
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-slate-700 hover:bg-slate-600 font-bold px-5 py-2.5 rounded-lg text-xs transition-all"
              >
                Add Achievement
              </button>
            </form>
          </div>
        </div>

        {/* Right Preview & Controls */}
        <div className="lg:col-span-1 space-y-8">
          {/* Main Action buttons */}
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl text-center space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-700 pb-2">Actions</span>
            <button
              onClick={handleSavePortfolio}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow text-sm"
            >
              {loading ? "Saving space..." : "💾 Save Portfolio to DB"}
            </button>
            <a
              href={`/portfolio/${API.defaults.headers.common?.Authorization ? "my-portfolio" : ""}`}
              onClick={(e) => {
                const token = localStorage.getItem("token");
                if (token) {
                  try {
                    const parsed = JSON.parse(atob(token.split(".")[1]));
                    window.open(`/portfolio/${parsed.id}`, "_blank");
                  } catch (err) {
                    console.log(err);
                  }
                }
                e.preventDefault();
              }}
              className="block w-full bg-slate-750 hover:bg-slate-700 font-bold py-2.5 rounded-xl border border-slate-700 text-xs transition-all"
            >
              🌐 Open Public Webpage
            </a>
          </div>

          {/* GitHub Stats Card */}
          <div className="bg-slate-850 p-6 rounded-3xl border border-slate-750 shadow-xl flex flex-col justify-center items-center text-center">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-4 border-b border-slate-700 pb-2 w-full">
              Live GitHub API Stats Card
            </span>

            {fetchingGit && (
              <div className="py-6 animate-pulse text-slate-400 text-xs">Querying GitHub API...</div>
            )}

            {!fetchingGit && gitStats && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <img src={gitStats.avatar} alt="Avatar" className="w-16 h-16 rounded-full border border-purple-500/30 mx-auto" />
                <div>
                  <h4 className="font-extrabold text-slate-100 text-sm">{gitStats.name || gitStats.username}</h4>
                  <span className="text-xs text-blue-400">@{gitStats.username}</span>
                </div>
                {gitStats.bio && <p className="text-[10px] text-slate-400 leading-relaxed">{gitStats.bio}</p>}
                
                <div className="grid grid-cols-2 gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-850 text-xs">
                  <div>
                    <span className="text-slate-500 font-bold block mb-0.5">Repos</span>
                    <strong className="text-slate-200 text-base">{gitStats.repos}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block mb-0.5">Followers</span>
                    <strong className="text-slate-200 text-base">{gitStats.followers}</strong>
                  </div>
                </div>
              </div>
            )}

            {!fetchingGit && !gitStats && (
              <div className="py-8 text-slate-500 text-xs font-medium space-y-2">
                <span className="block text-2xl">🐙</span>
                <p>Provide a valid GitHub profile URL on the left to sync live statistics cards.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidatePortfolioManager;

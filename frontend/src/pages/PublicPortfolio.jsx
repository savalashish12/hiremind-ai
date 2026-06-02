import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

const PublicPortfolio = () => {
  const { candidateId } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gitStats, setGitStats] = useState(null);
  const [fetchingGit, setFetchingGit] = useState(false);

  const fetchPublicPortfolio = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`/candidate/portfolio/${candidateId}`);
      if (res.data.success && res.data.data) {
        setPortfolio(res.data.data);
        if (res.data.data.githubUrl) {
          fetchGithubStats(res.data.data.githubUrl);
        }
      } else {
        setError("Portfolio not published yet by this candidate.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch candidate portfolio.");
    } finally {
      setLoading(false);
    }
  };

  const parseGithubUsername = (url) => {
    if (!url) return null;
    const cleanUrl = url.trim().replace(/\/$/, "");
    const parts = cleanUrl.split("/");
    const userIndex = parts.indexOf("github.com") + 1;
    if (userIndex > 0 && userIndex < parts.length) {
      return parts[userIndex];
    }
    return null;
  };

  const fetchGithubStats = async (url) => {
    const username = parseGithubUsername(url);
    if (!username) return;
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
      }
    } catch (err) {
      console.log(err);
    } finally {
      setFetchingGit(false);
    }
  };

  useEffect(() => {
    fetchPublicPortfolio();
  }, [candidateId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-white">
        <p className="text-red-400 font-bold">⚠️ {error || "Portfolio Not Found"}</p>
        <a href="/" className="mt-4 bg-slate-800 text-xs px-4 py-2 rounded-lg inline-block font-semibold">
          Return Home
        </a>
      </div>
    );
  }

  const candidateProfile = portfolio.candidate?.candidateProfile || {};
  const user = portfolio.candidate || {};

  return (
    <div className="p-10 max-w-5xl mx-auto text-white space-y-10">
      {/* Header Profile card */}
      <div className="bg-slate-850 p-8 rounded-3xl border border-slate-700/80 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {candidateProfile.profileImage ? (
            <img
              src={candidateProfile.profileImage}
              alt="Candidate Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-xl"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold shadow-xl">
              {user.fullName ? user.fullName.charAt(0) : "C"}
            </div>
          )}
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-extrabold">{user.fullName}</h1>
            <p className="text-slate-400 text-sm mt-1">{user.email}</p>
            {candidateProfile.education && <p className="text-xs text-blue-400 mt-2 font-semibold">🎓 {candidateProfile.education}</p>}
          </div>
        </div>

        {/* Links Column */}
        <div className="flex flex-col gap-2.5 text-xs bg-slate-900/60 p-4 rounded-2xl border border-slate-850 w-full md:w-fit">
          <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Links</span>
          {portfolio.linkedinUrl && (
            <a href={portfolio.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
              🔗 LinkedIn Profile ↗
            </a>
          )}
          {portfolio.githubUrl && (
            <a href={portfolio.githubUrl} target="_blank" rel="noreferrer" className="text-slate-300 hover:underline">
              🐙 GitHub Profile ↗
            </a>
          )}
          {portfolio.portfolioUrl && (
            <a href={portfolio.portfolioUrl} target="_blank" rel="noreferrer" className="text-green-400 hover:underline">
              💼 Personal Website ↗
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Summary, Skills, Git Stats */}
        <div className="lg:col-span-1 space-y-8">
          {/* Summary / Education */}
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700/80 shadow-md space-y-4">
            <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wide">Resume Summary</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {candidateProfile.professionalSummary || "No summary provided."}
            </p>
            {candidateProfile.experience && (
              <div className="border-t border-slate-700/60 pt-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Experience Info</span>
                <p className="text-xs text-slate-300">{candidateProfile.experience}</p>
              </div>
            )}
          </div>

          {/* GitHub widget */}
          {portfolio.githubUrl && gitStats && (
            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700/80 shadow-md flex flex-col items-center text-center space-y-4">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wide block border-b border-slate-750 pb-1.5 w-full">
                GitHub API Statistics
              </span>
              <img src={gitStats.avatar} alt="Avatar" className="w-14 h-14 rounded-full border border-purple-500/20" />
              <div>
                <h4 className="font-extrabold text-slate-100 text-xs">{gitStats.name || gitStats.username}</h4>
                <span className="text-[10px] text-blue-400">@{gitStats.username}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 bg-slate-900 p-3 rounded-xl border border-slate-850 w-full text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">Repos</span>
                  <strong className="text-slate-200 text-sm">{gitStats.repos}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">Followers</span>
                  <strong className="text-slate-200 text-sm">{gitStats.followers}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Skills badge chips */}
          {candidateProfile.skills?.length > 0 && (
            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700/80 shadow-md space-y-4">
              <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wide">Key Skillset</h3>
              <div className="flex flex-wrap gap-1.5">
                {candidateProfile.skills.map((skill, index) => (
                  <span key={index} className="bg-blue-900/30 text-blue-300 border border-blue-800/20 px-2.5 py-1 rounded text-[10px] font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Projects, Certifications, Achievements */}
        <div className="lg:col-span-2 space-y-8">
          {/* Projects */}
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700/80 shadow-md space-y-6">
            <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wide">Projects Showcase</h3>
            {!portfolio.projects || portfolio.projects.length === 0 ? (
              <p className="text-slate-500 text-xs italic">No projects showcased yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolio.projects.map((proj, idx) => (
                  <div key={idx} className="bg-slate-900/50 p-5 rounded-2xl border border-slate-850 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">{proj.name}</h4>
                      <span className="text-[10px] text-blue-400 font-bold block mt-0.5 mb-2">{proj.techStack}</span>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">{proj.description}</p>
                    </div>
                    <div className="flex gap-4 text-[10px] border-t border-slate-800/80 pt-3">
                      {proj.githubUrl && (
                        <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-slate-300 hover:underline font-semibold">
                          🐙 GitHub Repo
                        </a>
                      )}
                      {proj.liveUrl && (
                        <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-green-400 hover:underline font-semibold">
                          🌐 Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certifications */}
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700/80 shadow-md space-y-4">
            <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wide">Certifications</h3>
            {!portfolio.certifications || portfolio.certifications.length === 0 ? (
              <p className="text-slate-500 text-xs italic">No certifications published yet.</p>
            ) : (
              <div className="overflow-x-auto bg-slate-900/40 rounded-xl border border-slate-850">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/40 text-slate-400 font-semibold border-b border-slate-800">
                      <th className="p-3">Certification</th>
                      <th className="p-3">Issuer</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {portfolio.certifications.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-700/10">
                        <td className="p-3 font-bold text-slate-200">{c.name}</td>
                        <td className="p-3 text-slate-400">{c.issuer}</td>
                        <td className="p-3 text-slate-500">{c.date}</td>
                        <td className="p-3 text-right">
                          {c.url ? (
                            <a href={c.url} target="_blank" rel="noreferrer" className="text-blue-450 hover:underline">
                              Verify Link ↗
                            </a>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Achievements */}
          {portfolio.achievements?.length > 0 && (
            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700/80 shadow-md space-y-4">
              <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wide">Achievements & Honors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {portfolio.achievements.map((ach, idx) => (
                  <div key={idx} className="bg-slate-900/45 p-4 rounded-xl border border-slate-850 flex items-center gap-3 text-xs">
                    <span className="text-base">🏆</span>
                    <p className="text-slate-300 font-medium leading-relaxed">{ach}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicPortfolio;

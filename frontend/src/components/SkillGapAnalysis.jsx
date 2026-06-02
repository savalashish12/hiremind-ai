import { useState, useEffect } from "react";
import API from "../services/api";

const SkillGapAnalysis = ({ jobId }) => {
  const [loading, setLoading] = useState(false);
  const [gapData, setGapData] = useState(null);
  const [error, setError] = useState("");
  const [activeAccordion, setActiveAccordion] = useState(null);

  const fetchGapAnalysis = async () => {
    if (!jobId) return;
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/skills/gap-analysis", { jobId });
      if (res.data.success) {
        setGapData(res.data.data);
      } else {
        setError(res.data.message || "Failed to generate gap analysis");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Please upload a resume first to run skill gap analysis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGapAnalysis();
  }, [jobId]);

  if (loading) {
    return (
      <div className="py-10 text-center animate-pulse">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400 text-sm">AI is checking your skills against job posting requirements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <p className="text-red-400 text-sm font-medium">⚠️ {error}</p>
        <button
          onClick={fetchGapAnalysis}
          className="mt-4 bg-slate-700 hover:bg-slate-600 text-xs text-white px-4 py-2 rounded-lg font-bold transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!gapData) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Match gauge */}
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Match Strength</h4>
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#1e293b"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#8b5cf6"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * gapData.matchPercentage) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-extrabold text-violet-400">{gapData.matchPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Skill breakdown chips */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Matched Skills ({gapData.matchedSkills?.length || 0})</h5>
            <div className="flex flex-wrap gap-2">
              {gapData.matchedSkills?.length > 0 ? (
                gapData.matchedSkills.map((s, i) => (
                  <span key={i} className="bg-green-950/40 text-green-400 border border-green-900/40 px-3 py-1 rounded-full text-xs font-semibold">
                    ✓ {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">None identified yet.</span>
              )}
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Missing Skills ({gapData.missingSkills?.length || 0})</h5>
            <div className="flex flex-wrap gap-2">
              {gapData.missingSkills?.length > 0 ? (
                gapData.missingSkills.map((s, i) => (
                  <span key={i} className="bg-red-950/40 text-red-400 border border-red-900/40 px-3 py-1 rounded-full text-xs font-semibold">
                    ✗ {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-green-400">✨ Standard requirements matched!</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Learning Recommendations */}
      {gapData.learningRecommendations?.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-slate-200">Recommended Learning Pathways</h4>
          <div className="space-y-2">
            {gapData.learningRecommendations.map((rec, idx) => {
              const isOpen = activeAccordion === idx;
              return (
                <div key={idx} className="bg-slate-800 rounded-xl border border-slate-700/80 overflow-hidden">
                  <button
                    onClick={() => setActiveAccordion(isOpen ? null : idx)}
                    className="w-full text-left px-5 py-4 font-semibold text-sm flex justify-between items-center transition-colors hover:bg-slate-700/30"
                  >
                    <span>🎯 Master {rec.skill}</span>
                    <span>{isOpen ? "▲" : "▼"}</span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 text-xs text-slate-300 border-t border-slate-700/50 space-y-3">
                      <p><strong>Why it matters:</strong> {rec.reason}</p>
                      {rec.resources?.length > 0 && (
                        <div>
                          <strong className="block mb-1.5 text-slate-400">Free Resources:</strong>
                          <ul className="list-disc ml-5 space-y-1">
                            {rec.resources.map((res, i) => (
                              <li key={i}>
                                {res.startsWith("http") ? (
                                  <a href={res} target="_blank" rel="noreferrer" className="text-violet-400 hover:underline">
                                    {res}
                                  </a>
                                ) : (
                                  <span>{res}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggested Certifications */}
      {gapData.suggestedCertifications?.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-slate-200">Recommended Industry Certifications</h4>
          <div className="overflow-x-auto bg-slate-800 rounded-xl border border-slate-700">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-700">
                  <th className="p-4">Certification Name</th>
                  <th className="p-4">Platform</th>
                  <th className="p-4 text-right">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {gapData.suggestedCertifications.map((cert, idx) => (
                  <tr key={idx} className="hover:bg-slate-700/20 transition-colors">
                    <td className="p-4 font-bold text-slate-200">{cert.name}</td>
                    <td className="p-4 text-slate-400">{cert.platform}</td>
                    <td className="p-4 text-right">
                      {cert.url ? (
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-violet-400 hover:underline font-bold"
                        >
                          View Program ↗
                        </a>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGapAnalysis;

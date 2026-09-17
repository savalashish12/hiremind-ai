import { useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

const AtsScoreDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [atsData, setAtsData] = useState(null);
  const [isCached, setIsCached] = useState(false);

  const fetchAtsAnalysis = async (force = false) => {
    const cacheKey = 'hiremind_ats_cache';
    if (!force) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            setAtsData(data);
            setIsCached(true);
            return;
          }
        } catch (e) {
          console.error("Failed to parse cached ATS data", e);
        }
      }
    }
    setLoading(true);
    try {
      const res = await API.post("/ats/analyze");
      if (res.data.success) {
        setAtsData(res.data.data);
        setIsCached(false);
        localStorage.setItem(cacheKey, JSON.stringify({ data: res.data.data, timestamp: Date.now() }));
        toast.success("Resume ATS Score calculated!");
      } else {
        toast.error(res.data.message || "Failed to analyze resume");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Ensure your resume is uploaded in the Candidate Dashboard first.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAtsAnalysis(false);
  }, []);

  const getBreakdownColor = (score) => {
    if (score > 15) return "bg-green-500";
    if (score >= 10) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getBreakdownTextColor = (score) => {
    if (score > 15) return "text-green-400";
    if (score >= 10) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="p-10 max-w-7xl mx-auto text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Resume ATS Optimizer
          </h1>
          <p className="text-slate-400 mt-2">
            AI-powered scanning to align your resume with modern applicant tracking systems.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isCached && (
            <span className="text-xs text-slate-500 italic">Showing cached result</span>
          )}
          <button
            onClick={() => fetchAtsAnalysis(true)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            {loading ? "Analyzing..." : "🔄 Re-Analyze Resume"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-800/40 rounded-3xl border border-slate-700/80 animate-pulse">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-medium">Gemini AI is parsing and scoring your resume layout...</p>
        </div>
      )}

      {!loading && !atsData && (
        <div className="text-center py-20 bg-slate-800/40 rounded-3xl border border-slate-700/80">
          <p className="text-slate-400 mb-4">Please upload your resume in the Candidate Dashboard before running ATS analysis.</p>
          <a
            href="/candidate-dashboard"
            className="bg-blue-600 hover:bg-blue-700 font-bold px-6 py-2.5 rounded-xl transition-all block w-fit mx-auto"
          >
            Go to Dashboard
          </a>
        </div>
      )}

      {!loading && atsData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Overall score chart & Breakdown */}
          <div className="lg:col-span-1 bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl flex flex-col items-center">
            <h2 className="text-xl font-bold text-slate-200 mb-6 self-start">Overall ATS Score</h2>
            
            {/* Circular Gauge */}
            <div className="relative w-44 h-44 mb-8">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#334155"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * atsData.totalScore) / 100}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold tracking-tight">{atsData.totalScore}</span>
                <span className="text-xs text-slate-400 font-medium">out of 100</span>
              </div>
            </div>

            <div className="w-full space-y-5">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Category Breakdown</h3>
              
              {Object.keys(atsData.breakdown || {}).map((key) => {
                const item = atsData.breakdown[key];
                return (
                  <div key={key}>
                    <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                      <span className="capitalize text-slate-300">{key}</span>
                      <span className={getBreakdownTextColor(item.score)}>
                        {item.score}/{item.max}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getBreakdownColor(item.score)}`}
                        style={{ width: `${(item.score / item.max) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">{item.feedback}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Sections & Keywords */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl">
              <h2 className="text-xl font-bold text-slate-200 mb-6">Keywords & Structure</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Missing Keywords</h3>
                  {atsData.missingKeywords?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {atsData.missingKeywords.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-red-950/40 text-red-400 border border-red-900/40 px-3 py-1 rounded-full text-xs font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-green-400">✨ Great! No critical keywords missing.</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Missing Sections</h3>
                  {atsData.missingSections?.length > 0 ? (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {atsData.missingSections.map((sec, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                          <span className="text-red-500">❌</span> {sec}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-green-400">✨ All primary resume sections are present.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl">
              <h2 className="text-xl font-bold text-slate-200 mb-6">AI Optimization Recommendations</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(atsData.topRecommendations || []).slice(0, 3).map((rec, idx) => (
                  <div key={idx} className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/60 flex flex-col gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-900/50 text-blue-400 flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AtsScoreDashboard;

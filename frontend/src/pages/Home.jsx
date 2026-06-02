import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Home = () => {
  const [counts, setCounts] = useState({
    scanned: 1250,
    placed: 412,
    interviews: 938,
  });

  const [activeFaq, setActiveFaq] = useState(null);
  const [activeTab, setActiveTab] = useState("candidate");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  useEffect(() => {
    // Simulated increments for real-time vibe
    const interval = setInterval(() => {
      setCounts((prev) => ({
        scanned: prev.scanned + Math.floor(Math.random() * 2) + 1,
        placed: prev.placed + (Math.random() > 0.85 ? 1 : 0),
        interviews: prev.interviews + Math.floor(Math.random() * 2),
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSuccess(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSuccess(false), 5000);
    }
  };

  const faqs = [
    {
      q: "How does the AI Resume ATS Scanner evaluate my CV?",
      a: "The scanner uses Google Gemini AI to analyze your resume text against standard industry keyword indexes, formatting rules, and semantic relevance. It provides a visual percentage score, lists matching strengths, and identifies critical skill gaps for target job profiles.",
    },
    {
      q: "What is the Mock Interview (MCQ) assessment system?",
      a: "Candidates can trigger role-specific tests tailored to over 50 top MNCs (like TCS, Infosys, Google, Accenture). The system generates MCQ questions with a 30-minute timer. Upon completion, it evaluates your answers and estimates your performance percentile.",
    },
    {
      q: "How does the Recruiter Sourcing and Applicant Ranking work?",
      a: "Recruiters post job specifications. When candidates apply, their match score is dynamically calculated. Recruiters can view a side-by-side comparison of applicants ranked by AI suitability index to streamline candidate shortlisting.",
    },
    {
      q: "What are the automated Document Generators and Verification systems?",
      a: "Recruiters can generate official Offer Letters in PDF format directly from the dashboard using customizable parameters (salary, role, joining date). Candidates can upload Certificates and Degrees, which are stored securely and flagged for Recruiter review.",
    },
    {
      q: "How is data persistence handled across navigation dashboards?",
      a: "Our system implements route-based dependency listening and react context syncing. When navigating between views (like Recruiter profiles, Candidate applications, and Admin logs), components fetch fresh records, ensuring zero screen-blanking and complete state consistency.",
    },
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. HERO & INTERACTIVE WIDGET SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-28 md:pb-32 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        {/* Decorative background glow fields */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }}></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Info */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                ✨ Next-Gen AI Recruitment & Career Intelligence Platform
              </span>

              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
                Empower Sourcing. <br />
                Accelerate Hiring. <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Supercharged by Gemini AI
                </span>
              </h1>

              <p className="text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed">
                HireMind AI bridges the gap between talent and recruitment. Empowering candidates with automated ATS resume scans, custom MCQ assessments, and roadmap planners, while giving recruiters dynamic pipelines, AI candidate ranking, and automatic PDF offer generation.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 active:scale-95 text-sm md:text-base"
                >
                  Create Account Free 🚀
                </Link>
                <Link
                  to="/jobs"
                  className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold px-7 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 text-sm md:text-base"
                >
                  Browse Job Openings
                </Link>
              </div>

              {/* Counts metrics list */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-900 mt-8">
                <div>
                  <p className="text-2xl md:text-3xl font-extrabold text-blue-400">{counts.scanned}+</p>
                  <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider font-bold mt-0.5">Scans Performed</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-extrabold text-indigo-400">{counts.placed}+</p>
                  <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider font-bold mt-0.5">Matched Profiles</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-extrabold text-purple-400">{counts.interviews}+</p>
                  <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider font-bold mt-0.5">Mock assessments</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Dashboard Simulation widget */}
            <div className="lg:col-span-5 relative w-full flex justify-center">
              <div className="relative w-full max-w-md bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-full blur-xl"></div>
                
                {/* Header of widget */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-xs text-slate-400 font-mono ml-2">system_eval_workspace</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 text-[10px] font-semibold border border-blue-500/20">
                    Live Demo Workspace
                  </span>
                </div>

                {/* Simulated Candidate Profile card */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
                      AS
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Ashish Saval</h4>
                      <p className="text-xs text-slate-400">MCA Finalist • Candidate Workspace</p>
                    </div>
                  </div>

                  {/* Simulated ATS circular score */}
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Resume ATS Index</span>
                      <span className="text-lg font-extrabold text-blue-400">92% Match Score</span>
                      <span className="text-[10px] text-green-400 block mt-0.5">✓ Ready for Corporate Review</span>
                    </div>
                    <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-blue-500/10 border-2 border-blue-500">
                      <span className="text-xs font-bold text-blue-400">92%</span>
                    </div>
                  </div>

                  {/* Simulated Recruiter Decision Box */}
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Recruiter Panel Stage</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-[10px] border border-indigo-500/25">
                        Selected for Interview
                      </span>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Company:</span>
                        <span className="text-slate-200 font-medium">Accenture Corporate</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Date/Time:</span>
                        <span className="text-slate-200 font-medium">June 5, 2:00 PM (IST)</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action mockup buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="bg-slate-800 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-center text-xs font-semibold cursor-pointer border border-slate-700 transition-all select-none">
                      📂 View Resume Details
                    </div>
                    <div className="bg-blue-600 text-white hover:bg-blue-500 px-3 py-2 rounded-lg text-center text-xs font-bold cursor-pointer transition-all select-none">
                      🎓 Start Skill MCQ
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CORPORATE SYNC LOGOS */}
      <section className="py-8 bg-slate-950 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-6">
            Aligned with placements & industry hiring patterns
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6 items-center opacity-40 justify-center">
            <span className="text-lg font-extrabold tracking-tight text-white hover:opacity-100 transition-opacity">GOOGLE</span>
            <span className="text-lg font-extrabold tracking-tight text-white hover:opacity-100 transition-opacity">ACCENTURE</span>
            <span className="text-lg font-extrabold tracking-tight text-white hover:opacity-100 transition-opacity">MICROSOFT</span>
            <span className="text-lg font-extrabold tracking-tight text-white hover:opacity-100 transition-opacity">TCS</span>
            <span className="text-lg font-extrabold tracking-tight text-white hover:opacity-100 transition-opacity">INFOSYS</span>
            <span className="text-lg font-extrabold tracking-tight text-white hover:opacity-100 transition-opacity">WIPRO</span>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE FEATURE TAB SELECTOR */}
      <section className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="space-y-4 max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
              Two Roles, One Unified Hub
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              Switch below to explore how HireMind AI caters specifically to Candidate preparation or Recruiter streamlining.
            </p>
            
            {/* Tab Buttons */}
            <div className="inline-flex p-1.5 bg-slate-900 rounded-2xl border border-slate-800 mt-6">
              <button
                onClick={() => setActiveTab("candidate")}
                className={`px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  activeTab === "candidate"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                For Candidates (Job Seekers)
              </button>
              <button
                onClick={() => setActiveTab("recruiter")}
                className={`px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  activeTab === "recruiter"
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                For Recruiters (HR Panels)
              </button>
            </div>
          </div>

          {/* Interactive Tab Content Display */}
          <div className="bg-slate-900/40 rounded-3xl border border-slate-850 p-6 md:p-10 max-w-5xl mx-auto text-left">
            {activeTab === "candidate" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Accelerate Candidate Sourcing
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    Optimize Your Profile & Clear MNC Assessments
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Access premium AI tools to analyze your current professional resume. Identify exact skills missing from job listings, download dynamic career learning paths, practice real assessment tests, and track your interviews.
                  </p>
                  
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-500 text-base font-bold">✓</span>
                      <div>
                        <h4 className="text-xs md:text-sm font-bold text-white">ATS Optimizer</h4>
                        <p className="text-xs text-slate-400">Circular score index, formatting analysis, and keyword density checker.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-blue-500 text-base font-bold">✓</span>
                      <div>
                        <h4 className="text-xs md:text-sm font-bold text-white">Skill MCQ Mock Engine</h4>
                        <p className="text-xs text-slate-400">Generate tests customized to companies like TCS, Infosys, and Google with percentile estimations.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-blue-500 text-base font-bold">✓</span>
                      <div>
                        <h4 className="text-xs md:text-sm font-bold text-white">Verified Credentials Upload</h4>
                        <p className="text-xs text-slate-400">Upload your academic degree and verification certifications directly to your candidate portfolio.</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link to="/register" className="text-blue-400 text-sm font-bold hover:underline flex items-center gap-1">
                      Register Candidate Profile & Upload Resume →
                    </Link>
                  </div>
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white">My Academic Certificates</span>
                    <span className="text-[10px] text-green-400">Verified Badge Active</span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-slate-200">MCA Degree Certificate.pdf</p>
                        <p className="text-[10px] text-slate-500">Uploaded to secure storage</p>
                      </div>
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-[10px] font-bold">Verified</span>
                    </div>
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-slate-200">Google Cloud Architect.pdf</p>
                        <p className="text-[10px] text-slate-500">Uploaded to secure storage</p>
                      </div>
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-[10px] font-bold">Verified</span>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 text-xs text-slate-400 leading-relaxed">
                    💡 <strong>Pro Tip:</strong> Verified profiles with synchronized certificates experience a 4.5x higher callback rate during final examiner and corporate screenings.
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Automate HR Pipelines
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    Scan Applicants, Schedule Meetings & PDF Offers
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Provide your recruitment panel with a professional toolkit. Review candidates ranked semantically by AI match scores, schedule calendar interviews with external links, manage pipelines via Kanban boards, and issue official offer documents in clicks.
                  </p>
                  
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3">
                      <span className="text-purple-500 text-base font-bold">✓</span>
                      <div>
                        <h4 className="text-xs md:text-sm font-bold text-white">AI Candidate Ranking</h4>
                        <p className="text-xs text-slate-400">Automated ranking index based on resume parsed tags and skills compliance checks.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-purple-500 text-base font-bold">✓</span>
                      <div>
                        <h4 className="text-xs md:text-sm font-bold text-white">PDF Offer Compiler</h4>
                        <p className="text-xs text-slate-400">Custom terms template generates signed official offer documents on the fly.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-purple-500 text-base font-bold">✓</span>
                      <div>
                        <h4 className="text-xs md:text-sm font-bold text-white">Drag & Drop Kanban Board</h4>
                        <p className="text-xs text-slate-400">Progress applicants from application through interviewing, rating, and offer generation stages.</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link to="/register" className="text-purple-400 text-sm font-bold hover:underline flex items-center gap-1">
                      Register Recruiter Profile & Create Job Posts →
                    </Link>
                  </div>
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white">Offer Letter Compiler</span>
                    <span className="text-[10px] text-purple-400">PDF Generator Engine</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-400 block text-[10px] uppercase font-bold">Joining Salary (INR / Annum)</label>
                      <input type="text" value="₹ 12,00,000" disabled className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 block text-[10px] uppercase font-bold">Reporting Manager / Role</label>
                      <input type="text" value="Senior Java Developer" disabled className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200" />
                    </div>
                    <button className="w-full bg-purple-600 text-white font-bold p-2.5 rounded-lg text-xs mt-2 select-none">
                      Generate Sealed PDF Offer Letter 📄
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. SAAS MODULES FEATURE GRID */}
      <section className="py-20 bg-slate-950/60 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-500">Robust Enterprise Toolbelt</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
              SaaS Engine Core Modules
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              A comprehensive system architecture verified for final year evaluation metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-slate-900/40 border border-slate-850 p-8 rounded-3xl hover:border-slate-700 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center text-2xl font-bold mb-5 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-md">
                📊
              </div>
              <h3 className="text-xl font-bold text-white mb-2">ATS Scoring Dashboard</h3>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                Scan layouts, compliance ratings, keyword densities, missing credentials, and structural formats against top corporate filters.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/40 border border-slate-850 p-8 rounded-3xl hover:border-slate-700 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center text-2xl font-bold mb-5 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-md">
                🧠
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI MCQ Assessment</h3>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                Trigger practice MCQ exams based on target company formats. Includes active timers, sidebar navigators, and estimated percentile rankings.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/40 border border-slate-850 p-8 rounded-3xl hover:border-slate-700 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center text-2xl font-bold mb-5 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-md">
                🔗
              </div>
              <h3 className="text-xl font-bold text-white mb-2">External Job Aggregation</h3>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                Automated background scraper pulling remote jobs from RemoteOK, Internshala, and Telegram, parsed with Gemini AI metadata.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/40 border border-slate-850 p-8 rounded-3xl hover:border-slate-700 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 bg-pink-500/10 text-pink-400 rounded-2xl flex items-center justify-center text-2xl font-bold mb-5 group-hover:bg-pink-500 group-hover:text-white transition-all shadow-md">
                🤖
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Recruiter AI Ranker</h3>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                Evaluates applicant lists semantically. Highlights candidate key matches, strengths, and weaknesses for quick screening.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-900/40 border border-slate-850 p-8 rounded-3xl hover:border-slate-700 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 bg-yellow-500/10 text-yellow-400 rounded-2xl flex items-center justify-center text-2xl font-bold mb-5 group-hover:bg-yellow-500 group-hover:text-white transition-all shadow-md">
                📄
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sealed PDF Offer Letter</h3>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                Recruiters compile and sign official PDF agreements. Candidates download offer documents directly in their dashboard timelines.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-900/40 border border-slate-850 p-8 rounded-3xl hover:border-slate-700 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 bg-teal-500/10 text-teal-400 rounded-2xl flex items-center justify-center text-2xl font-bold mb-5 group-hover:bg-teal-500 group-hover:text-white transition-all shadow-md">
                💬
              </div>
              <h3 className="text-xl font-bold text-white mb-2">RAG Documents Assistant</h3>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                Upload internal company HR guidelines. Ask natural language context queries about hiring protocols, fully parsed on the fly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. COMPARISON TABLE */}
      <section className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white animate-fade-in">
              Why HireMind AI?
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              A brief feature comparison showing the efficacy of AI-driven career and recruitment systems.
            </p>
          </div>

          <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-slate-850 bg-slate-900/20 backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-xs md:text-sm font-bold text-slate-300">
                    <th className="p-4 md:p-6">Feature / Capability</th>
                    <th className="p-4 md:p-6 text-slate-400">Traditional Methods</th>
                    <th className="p-4 md:p-6 text-blue-400">HireMind AI Platform</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs md:text-sm text-slate-300">
                  <tr>
                    <td className="p-4 md:p-6 font-bold text-white">Resume Evaluation</td>
                    <td className="p-4 md:p-6 text-slate-500">Manual review, biased scanning</td>
                    <td className="p-4 md:p-6 text-blue-300 font-semibold">Gemini AI ATS scoring & skill gaps</td>
                  </tr>
                  <tr>
                    <td className="p-4 md:p-6 font-bold text-white">Skill Verification</td>
                    <td className="p-4 md:p-6 text-slate-500">Self-reported claims only</td>
                    <td className="p-4 md:p-6 text-blue-300 font-semibold">Custom MCQ Assessments & percentile checks</td>
                  </tr>
                  <tr>
                    <td className="p-4 md:p-6 font-bold text-white">Application Pipeline</td>
                    <td className="p-4 md:p-6 text-slate-500">Spreadsheets, emails, lost status</td>
                    <td className="p-4 md:p-6 text-blue-300 font-semibold">Drag & Drop Kanban board with sync triggers</td>
                  </tr>
                  <tr>
                    <td className="p-4 md:p-6 font-bold text-white">Offer Letter Issuing</td>
                    <td className="p-4 md:p-6 text-slate-500">Slow MS Word templates, manual mail</td>
                    <td className="p-4 md:p-6 text-blue-300 font-semibold">PDF Generation from recruiter data card</td>
                  </tr>
                  <tr>
                    <td className="p-4 md:p-6 font-bold text-white">Credentials Review</td>
                    <td className="p-4 md:p-6 text-slate-500">Physical paper checking at interview</td>
                    <td className="p-4 md:p-6 text-blue-300 font-semibold">Candidate digital uploads audited on cards</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION SECTION */}
      <section className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Evaluation Support</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              Got questions about platform architecture or evaluations? Check the details below.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-slate-900/30 rounded-2xl border border-slate-850 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-5 text-left font-bold text-white flex justify-between items-center gap-4 hover:bg-slate-900/50 transition-colors text-sm md:text-base"
                >
                  <span>{faq.q}</span>
                  <span className="text-blue-500 text-lg md:text-xl leading-none">
                    {activeFaq === i ? "−" : "+"}
                  </span>
                </button>
                {activeFaq === i && (
                  <div className="p-5 pt-0 border-t border-slate-800 text-xs md:text-sm text-slate-400 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE NEWSLETTER FORM */}
      <section className="py-20 bg-gradient-to-r from-blue-950/20 via-indigo-950/15 to-purple-950/20 border-t border-slate-900 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 space-y-6 relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Stay Updated on Placement Openings
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Subscribe to our weekly aggregated digest. Get remote opportunities, Internshala job postings, and technical preparation guides sent directly to your inbox.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 pt-4">
            <input
              type="email"
              required
              placeholder="Enter your academic or work email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-4.5 py-3 text-sm focus:outline-none focus:border-blue-500 w-full sm:flex-1"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md text-sm select-none"
            >
              Subscribe Digest
            </button>
          </form>

          {newsletterSuccess && (
            <p className="text-green-400 text-xs font-semibold animate-pulse">
              🎉 Subscription successful! You will receive our next aggregated placement report.
            </p>
          )}
        </div>
      </section>

      {/* 8. COMPLETE DETAILED ACADEMIC FOOTER */}
      <footer className="bg-slate-950 pt-16 pb-12 mt-auto border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-slate-900">
          
          <div className="space-y-4">
            <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              HireMind AI
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
              AI-driven career and recruitment intelligence platform designed and optimized for final-year Master of Computer Applications (MCA) evaluations. Supports AI resume scanning, custom timers mock tests, and verified portfolios.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Workspace Navigation</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/jobs" className="hover:text-blue-400 transition-colors">Browse Job Listings</Link></li>
              <li><Link to="/pricing" className="hover:text-blue-400 transition-colors">Subscription Packages</Link></li>
              <li><Link to="/login" className="hover:text-blue-400 transition-colors">Login Workspace</Link></li>
              <li><Link to="/register" className="hover:text-blue-400 transition-colors">Register Account</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-4">AI Service Engine</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><span className="text-slate-400">Google Gemini ATS Scan</span></li>
              <li><span className="text-slate-400">Automated MCQ Test Generators</span></li>
              <li><span className="text-slate-400">PDF Offer Letter compiler</span></li>
              <li><span className="text-slate-400">Degree Verification Audits</span></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Evaluation Metadata</h5>
            <div className="text-slate-400 text-xs space-y-1.5 leading-relaxed">
              <p><strong>Candidate:</strong> Ashish Saval</p>
              <p><strong>Course:</strong> MCA (Final Year Project)</p>
              <p><strong>Database:</strong> PostgreSQL & Prisma ORM</p>
              <p><strong>State Sync:</strong> Route-based Refetching</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} HireMind AI Platform. Project for Viva-Voce Examination.</p>
          <div className="flex gap-4">
            <span className="text-slate-500">Prepared for HOD, supervisor & External Examiners Panel</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
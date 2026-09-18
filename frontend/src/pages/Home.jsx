import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  TrendingUp,
  Map,
  Smile,
  Briefcase,
  BarChart2,
  Calendar,
  Bell,
  CloudLightning,
  ChevronDown,
  ArrowRight,
  User,
  Sparkles,
  Laptop
} from "lucide-react";

// Stat counter hook for dashboard presentation
const AnimatedCounter = ({ value, duration = 1.5 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value.toString().replace(/[^0-9]/g, ""), 10);
    if (start === end) return;

    let totalMiliseconds = duration * 1000;
    let incrementTime = Math.abs(Math.floor(totalMiliseconds / end));
    if (incrementTime < 10) incrementTime = 10; // Capped to prevent browser lags

    const timer = setInterval(() => {
      start += Math.ceil(end / (totalMiliseconds / incrementTime));
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  const suffix = value.toString().replace(/[0-9]/g, "");
  return <span>{count}{suffix}</span>;
};

const Home = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeTab, setActiveTab] = useState("candidate");

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const stats = [
    { label: "Candidates Registered", value: "1000+" },
    { label: "Open Vacancies", value: "100+" },
    { label: "Corporate Partners", value: "50+" },
    { label: "Scoring Accuracy", value: "95%" }
  ];

  const features = [
    {
      icon: <FileText className="text-blue-400" size={24} />,
      title: "AI Resume Analysis",
      description: "Gemini-powered contextual analysis parses skills, identifies experience tags, and formats listings automatically."
    },
    {
      icon: <TrendingUp className="text-cyan-400" size={24} />,
      title: "ATS Optimization",
      description: "Scores resumes against corporate guidelines, highlighting formatting fixes and keyword density parameters."
    },
    {
      icon: <Map className="text-purple-400" size={24} />,
      title: "Career Roadmap",
      description: "Generates step-by-step career tracks and target technologies mappings based on your current resume profile."
    },
    {
      icon: <Smile className="text-pink-400" size={24} />,
      title: "AI Mock Interview",
      description: "Take timers mock tests matching formats of over 50 top MNCs with detailed percentile estimation reports."
    },
    {
      icon: <Briefcase className="text-indigo-400" size={24} />,
      title: "Job Matching",
      description: "Calculates match index scores automatically. Suggests positions matching your verified candidate profile."
    },
    {
      icon: <BarChart2 className="text-teal-400" size={24} />,
      title: "Recruiter Analytics",
      description: "Complete recruiter dashboard pipelines tracking applications trends, hires volume, and pipelines ratios."
    },
    {
      icon: <Calendar className="text-yellow-400" size={24} />,
      title: "Interview Scheduling",
      description: "Schedule dates, times, and meeting links in one panel, instantly synchronizing with candidate portals."
    },
    {
      icon: <Bell className="text-red-400" size={24} />,
      title: "Notifications",
      description: "Dynamic route-based notifications tracking dashboard applications status, new postings, and letter ready alerts."
    },
    {
      icon: <CloudLightning className="text-emerald-400" size={24} />,
      title: "Cloud Resume Storage",
      description: "Save, archive, and retrieve old versions of resumes securely in PostgreSQL, preventing data loss bugs."
    }
  ];

  const timelineSteps = [
    { step: "01", title: "Upload Resume", desc: "Upload your PDF resume to initialize profiles and parse background credentials." },
    { step: "02", title: "Get ATS Analysis", desc: "Receive immediate optimization tips, circular compliance ratings, and gap advice." },
    { step: "03", title: "Match Jobs", desc: "Our semantic search indexes internal postings and aggregated remote listings for you." },
    { step: "04", title: "Apply", desc: "Apply in clicks. Transmits parsed resume details directly to the recruiter's application column." },
    { step: "05", title: "Schedule Interview", desc: "Get notified when recruiters schedule interviews, offering video links directly." },
    { step: "06", title: "Get Hired", desc: "Succeed in exams, receive PDF offer letters, and lock in your new corporate role." }
  ];

  const platformModules = [
    {
      id: "candidate",
      label: "Candidate Dashboard",
      icon: <User size={16} />,
      title: "Manage Applications & Practice Skills",
      desc: "An all-in-one portal for candidate growth. Tracks applications status, displays scheduled interviews, manages portfolios, indexes resume uploads history, and triggers MCQ mock assessments.",
      preview: (
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 font-sans text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-900">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <span className="font-bold text-white">Candidate Portfolio Manager</span>
            </div>
            <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold text-[9px]">Active</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-850">
              <span className="text-[10px] text-slate-500 block font-bold uppercase">ATS Index</span>
              <span className="text-sm font-extrabold text-blue-400 mt-1 block">94% Score</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-850">
              <span className="text-[10px] text-slate-500 block font-bold uppercase">Applications</span>
              <span className="text-sm font-extrabold text-indigo-400 mt-1 block">12 Active</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-850">
              <span className="text-[10px] text-slate-500 block font-bold uppercase">Interviews</span>
              <span className="text-sm font-extrabold text-purple-400 mt-1 block">2 Upcoming</span>
            </div>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850 flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-200">Accenture - Junior React Engineer</p>
              <p className="text-[9px] text-slate-500">Interview Scheduled: June 15, 2:00 PM</p>
            </div>
            <span className="bg-green-500/15 text-green-400 font-bold px-2 py-0.5 rounded text-[9px] border border-green-500/20">Join Meet</span>
          </div>
        </div>
      )
    },
    {
      id: "recruiter",
      label: "Recruiter Dashboard",
      icon: <Briefcase size={16} />,
      title: "Evaluate Talent & Schedule Pipelines",
      desc: "Equips corporate HR panels to manage job postings, semantic search/rank candidate applications, index RAG documentation guidelines, track pipeline ratios, and generate official offer letter PDFs.",
      preview: (
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 font-sans text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-900">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
              <span className="font-bold text-white">HR Pipeline Ranker</span>
            </div>
            <span className="text-slate-500">Accenture Corporate</span>
          </div>
          <div className="space-y-2">
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-850 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-200">Aarav Sharma (94% Fit)</p>
                <p className="text-[9px] text-slate-500">Skills: Java, React, SQL, Node.js</p>
              </div>
              <span className="bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded text-[9px]">Rank #1</span>
            </div>
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-850 flex justify-between items-center opacity-70">
              <div>
                <p className="font-bold text-slate-200">Rahul Kumar (78% Fit)</p>
                <p className="text-[9px] text-slate-500">Skills: React, HTML, CSS</p>
              </div>
              <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[9px]">Rank #2</span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="bg-slate-900 text-slate-300 font-bold p-2.5 rounded-lg flex-1 text-center cursor-pointer border border-slate-850">📄 Audit CV</div>
            <div className="bg-purple-600 text-white font-bold p-2.5 rounded-lg flex-1 text-center cursor-pointer">✉️ Issue Offer PDF</div>
          </div>
        </div>
      )
    },
    {
      id: "admin",
      label: "Admin Dashboard",
      icon: <Laptop size={16} />,
      title: "System Moderation & Audit Trails",
      desc: "Visual dashboard statistics tracking total active users, registered recruiters, and posted vacancies. Enables admin moderation (account suspension/deletion) and scrollable activity audit trails.",
      preview: (
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 font-sans text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-900">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
              <span className="font-bold text-white">System Admin Console</span>
            </div>
            <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold text-[9px] border border-red-500/20">Operational</span>
          </div>
          <div className="space-y-2 max-h-36 overflow-y-auto divide-y divide-slate-900 pr-1 text-[10px]">
            <div className="py-2 flex justify-between">
              <span className="text-green-400 font-bold">[JOB_CREATED]</span>
              <span className="text-slate-400">Software Engineer at Google</span>
              <span className="text-slate-550">2 mins ago</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-blue-400 font-bold">[RESUME_UPLOADED]</span>
              <span className="text-slate-400">Candidate Aarav Sharma uploaded CV</span>
              <span className="text-slate-550">10 mins ago</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-purple-400 font-bold">[OFFER_GENERATED]</span>
              <span className="text-slate-400">Recruiter issued Accenture Offer PDF</span>
              <span className="text-slate-550">20 mins ago</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const testimonials = [
    {
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
      name: "Aarav Sharma",
      company: "MCA Candidate",
      feedback: "The mock MCQ system matched the Accenture test format exactly. I practiced online, exported my percentile report, and secured a campus placement!"
    },
    {
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
      name: "Priyanka Sharma",
      company: "HR Director, TalentScribe",
      feedback: "We uploaded our recruitment policy manuals. HireMind's AI Assistant answered candidate inquiries accurately, cutting our HR support queries by 75%."
    },
    {
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
      name: "Rohan Verma",
      company: "Lead Recruiter, TechWave",
      feedback: "The automated PDF offer compiler and candidate certifications audit tabs simplify evaluation. Setting status triggers instant notifications to student dashboards."
    }
  ];

  const faqs = [
    {
      q: "How ATS works?",
      a: "Applicant Tracking Systems evaluate resume structures, scan for match tags/keywords relevant to the job, verify certifications, and analyze layout readability. Our Gemini system simulates these rules to rate your compliance index score."
    },
    {
      q: "How resumes are analyzed?",
      a: "Our system parses PDF text, matching your skills, work experience, and educational credentials against target job postings. Gemini AI extracts missing keywords and provides circular rating recommendations."
    },
    {
      q: "How AI interview works?",
      a: "Select from top MNC profiles. Our AI MCQ assessment generates technical and logic questions with a 30-minute countdown. It tracks answers and provides a percentile estimation report upon completion."
    },
    {
      q: "Can recruiters shortlist candidates?",
      a: "Yes. Recruiters view candidates ranked by AI fit score side-by-side. Dragging applicants across columns in the Kanban pipeline updates status triggers instantly."
    },
    {
      q: "How job matching works?",
      a: "When a recruiter creates a job description, our system automatically compares its criteria with candidate profiles and logs matching percentages on application pipelines."
    }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* Background Animated Gradient Glows */}
      <div className="absolute top-[-100px] left-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="absolute top-[800px] right-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
      <div className="absolute bottom-[400px] left-10 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-3xl pointer-events-none animate-pulse-slow" style={{ animationDelay: "4s" }}></div>

      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-28 md:pb-32 flex items-center border-b border-slate-900/40">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Info Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles size={12} className="animate-pulse" /> Next-Gen AI Recruitment Hub
            </span>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
              AI Recruitment & <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Career Intelligence
              </span> Platform
            </h1>

            <p className="text-base md:text-lg text-slate-400 max-w-xl leading-relaxed">
              Upload your resume, improve ATS score, discover jobs, prepare for interviews, and accelerate your career with AI. Built to streamline applicant matching for recruiters and candidates.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 active:scale-95 text-sm md:text-base flex items-center gap-2"
              >
                Get Started <ArrowRight size={16} />
              </Link>
              <Link
                to="/jobs"
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold px-7 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 text-sm md:text-base"
              >
                Explore Jobs
              </Link>
            </div>
          </motion.div>

          {/* Right Simulated Dashboard Mockup Graphic Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative w-full max-w-md mx-auto bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-5 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-xl"></div>
              
              {/* Card Title Header */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  <span className="text-[10px] text-slate-500 font-mono ml-1">recruiter_panel_audit</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[9px] font-bold border border-blue-500/20">
                  Live Sync Model
                </span>
              </div>

              {/* simulated resume analysis details card */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                      AS
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs">Aarav Sharma</p>
                      <p className="text-[9px] text-slate-500">MCA Project Candidate</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/15">94% ATS</span>
                </div>

                <div className="space-y-1 text-[10px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Target Role:</span>
                    <span className="text-slate-200">Software Developer</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Credentials:</span>
                    <span className="text-green-400">✓ Verified MCA Degree</span>
                  </div>
                </div>
              </div>

              {/* Simulated analytics graph and scheduler details card */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Interview Pipeline</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[9px] font-bold border border-indigo-500/20">Scheduled</span>
                </div>
                <div className="space-y-1.5 text-[10px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Company Host:</span>
                    <span className="text-slate-200">Accenture Corporate</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date / Time:</span>
                    <span className="text-slate-200">June 15, 2:00 PM (IST)</span>
                  </div>
                </div>
              </div>

              {/* Recruiter illustrative checklist links */}
              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-center text-slate-400 hover:text-white transition-all cursor-pointer font-semibold select-none">
                  📊 Analytics Hub
                </div>
                <div className="bg-blue-600 text-white rounded-xl p-2.5 text-center hover:bg-blue-500 transition-all font-bold cursor-pointer select-none">
                  🧠 AI MCQ Test
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* 2. TRUST & STATS SECTION */}
      <section className="py-16 bg-slate-950/60 border-b border-slate-900/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-slate-900/35 border border-slate-850 p-6 rounded-2xl text-center shadow-md relative overflow-hidden group hover:border-slate-800 transition-all"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <p className="text-4xl md:text-5xl font-black text-white bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="py-20 md:py-24 border-b border-slate-900/40 scroll-mt-18">
        <div className="max-w-7xl mx-auto px-6 text-center">
          
          <div className="max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-500">Robust SaaS Core</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              SaaS Engine Core Modules
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Explore our unified technical modules constructed for advanced career evaluation metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-slate-900/40 backdrop-blur-md border border-slate-850 p-8 rounded-3xl hover:border-slate-750 hover:shadow-xl hover:shadow-blue-500/[0.02] transition-all duration-300 text-left group"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center mb-6 border border-slate-850 shadow-inner group-hover:scale-105 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-blue-400 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                  {feat.description}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 md:py-24 border-b border-slate-900/40 scroll-mt-18">
        <div className="max-w-7xl mx-auto px-6 text-center">
          
          <div className="max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-500">Hiring Workflow</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              Simplified Hiring Timeline
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              From uploading resumes to printing sealed offer letters, track the recruitment workflow.
            </p>
          </div>

          {/* Timeline UI */}
          <div className="max-w-5xl mx-auto relative mt-12 pl-6 md:pl-0">
            {/* Center Line for desktop */}
            <div className="absolute top-0 bottom-0 left-[21px] md:left-1/2 w-0.5 bg-slate-900 z-0"></div>

            <div className="space-y-12 relative">
              {timelineSteps.map((step, i) => {
                const isEven = i % 2 === 0;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className={`flex flex-col md:flex-row items-start md:items-center relative z-10 ${
                      isEven ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    
                    {/* Left/Right Text Content Card */}
                    <div className="w-full md:w-1/2 md:px-12 flex justify-start md:justify-end">
                      <div className={`bg-slate-900/45 p-6 rounded-2xl border border-slate-850 hover:border-slate-800 transition-colors shadow-md text-left w-full max-w-md ${
                        isEven ? "md:text-left" : "md:text-left"
                      }`}>
                        <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wide mb-1">Step {step.step}</h4>
                        <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                        <p className="text-slate-400 text-xs md:text-sm leading-relaxed">{step.desc}</p>
                      </div>
                    </div>

                    {/* Timeline circle badge */}
                    <div className="absolute left-[-21px] md:left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-slate-950 border-4 border-slate-900 flex items-center justify-center font-bold text-white text-xs z-20 shadow-lg">
                      {step.step}
                    </div>

                    {/* Empty Space for desktop balance */}
                    <div className="hidden md:block w-1/2"></div>

                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* 5. PLATFORM MODULES SECTION */}
      <section className="py-20 md:py-24 border-b border-slate-900/40">
        <div className="max-w-7xl mx-auto px-6 text-center">
          
          <div className="max-w-3xl mx-auto space-y-4 mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-500">Visual Modules</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              Module Showcase Views
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Toggle dashboard layouts to preview actual panel widgets configured in HireMind AI.
            </p>

            {/* Tab Switches */}
            <div className="inline-flex p-1.5 bg-slate-900 border border-slate-850 rounded-2xl mt-6">
              {platformModules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => setActiveTab(mod.id)}
                  className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === mod.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {mod.icon}
                  <span className="hidden sm:inline">{mod.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Module Content Preview */}
          <div className="max-w-4xl mx-auto mt-12 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-850 p-6 md:p-10 text-left">
            <AnimatePresence mode="wait">
              {platformModules.map(
                (mod) =>
                  activeTab === mod.id && (
                    <motion.div
                      key={mod.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                    >
                      <div className="lg:col-span-7 space-y-4">
                        <h3 className="text-2xl font-bold text-white">{mod.title}</h3>
                        <p className="text-slate-400 text-xs md:text-sm leading-relaxed">{mod.desc}</p>
                        <div className="pt-2">
                          <Link
                            to="/register"
                            className="text-blue-400 font-bold text-xs md:text-sm hover:underline flex items-center gap-1"
                          >
                            Explore Workspace Panels Now <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                      <div className="lg:col-span-5 w-full">
                        {mod.preview}
                      </div>
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* 6. TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-20 md:py-24 border-b border-slate-900/40 scroll-mt-18">
        <div className="max-w-7xl mx-auto px-6 text-center">
          
          <div className="max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-pink-500">Global Reviews</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              SaaS Feedback Reviews
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Read recommendations and reviews logged by students, placement leads, and hiring recruiters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-slate-900/35 border border-slate-850 p-6 rounded-2xl shadow-md text-left flex flex-col justify-between hover:border-slate-800 transition-colors"
              >
                <p className="text-slate-350 text-xs md:text-sm italic leading-relaxed mb-6">
                  "{test.feedback}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={test.avatar}
                    alt={test.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-800"
                  />
                  <div>
                    <h4 className="font-bold text-white text-xs md:text-sm">{test.name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">{test.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="py-20 md:py-24 border-b border-slate-900/40">
        <div className="max-w-4xl mx-auto px-6">
          
          <div className="text-center space-y-4 mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Technical Help</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Got questions about evaluation layouts or scoring setups? View answers below.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-slate-900/30 rounded-2xl border border-slate-850 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full p-5 text-left font-bold text-white flex justify-between items-center gap-4 hover:bg-slate-900/50 transition-colors text-sm md:text-base focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-blue-500 transition-transform duration-200 ${
                      activeFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-850 bg-slate-950/20"
                    >
                      <p className="p-5 text-slate-400 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. CALL TO ACTION BANNER */}
      <section className="py-20 relative bg-gradient-to-br from-indigo-950/20 via-slate-950 to-purple-950/20 border-b border-slate-900/40 text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-6 relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-none">
            Ready to accelerate your career?
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Register your profile in 30 seconds. Leverage Gemini-powered matching algorithms, custom timers mock tests, and verified credentials today.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 active:scale-95 text-xs md:text-sm"
            >
              Create Account Free
            </Link>
            <Link
              to="/jobs"
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold px-8 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 text-xs md:text-sm"
            >
              Browse Open Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* 9. PROFESSIONAL FOOTER */}
      <footer className="bg-slate-950 pt-16 pb-12 mt-auto border-t border-slate-900/60 w-full text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
          
          <div className="space-y-4 md:col-span-2 text-left">
            <h4 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              HireMind AI
            </h4>
            <p className="text-slate-400 leading-relaxed max-w-xs">
              AI-driven career development and recruitment platform built and optimized for Master of Computer Applications (MCA) final evaluation metrics.
            </p>
            <div className="text-slate-500 space-y-1">
              <p><strong>Candidate:</strong> Aarav Sharma</p>
              <p><strong>Subject:</strong> MCA Final Semester Project</p>
            </div>
          </div>

          <div className="text-left">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Platform</h5>
            <ul className="space-y-2 text-slate-400">
              <li><button onClick={() => scrollToSection("how-it-works")} className="hover:text-blue-400 transition-colors">About Us</button></li>
              <li><span className="text-slate-600 select-none cursor-not-allowed">Careers (Soon)</span></li>
              <li><button onClick={() => scrollToSection("features")} className="hover:text-blue-400 transition-colors">Features</button></li>
              <li><Link to="/pricing" className="hover:text-blue-400 transition-colors">Pricing Hub</Link></li>
            </ul>
          </div>

          <div className="text-left">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Resources</h5>
            <ul className="space-y-2 text-slate-400">
              <li><span className="text-slate-400">Documentation</span></li>
              <li><span className="text-slate-400">Support Desk</span></li>
              <li><span className="text-slate-400">Career Blog</span></li>
            </ul>
          </div>

          <div className="text-left">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Legal</h5>
            <ul className="space-y-2 text-slate-400">
              <li><span className="text-slate-400">Privacy Policy</span></li>
              <li><span className="text-slate-400">Terms of Service</span></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} HireMind AI Platform. All rights reserved.</p>
          <div className="flex gap-4 items-center">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <span className="text-slate-700">•</span>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
            <span className="text-slate-700">•</span>
            <span className="text-slate-500">External Examiner Review Panel</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
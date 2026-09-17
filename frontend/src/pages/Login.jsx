import { useState, useContext, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sparkles, Brain, FileText, Target, ChevronRight, Users } from 'lucide-react';
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const handleThemeChange = () => {
      setIsLight(document.body.classList.contains("light"));
    };
    handleThemeChange();
    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await API.post("/auth/login", formData);
      login(res.data.user, res.data.token);
      if (res.data.user.role === "RECRUITER") {
        navigate("/recruiter-dashboard");
      } else {
        navigate("/candidate-dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to login"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex ${isLight ? 'bg-[#F8FAFC]' : 'bg-[#0B1120]'}`}>

      {/* ── LEFT PANEL (desktop only) ── */}
      <div className={`hidden lg:flex lg:w-[52%] xl:w-[55%] relative overflow-hidden flex-col justify-between p-12 ${isLight ? 'border-r border-[#CBD5E1]' : ''}`}
        style={{
          background: isLight 
            ? 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #E2E8F0 100%)' 
            : 'linear-gradient(135deg, #0B1120 0%, #071638 50%, #0B1120 100%)'
        }}>

        {/* Decorative blobs */}
        <div className={`absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full ${isLight ? 'opacity-10' : 'opacity-20'}`}
          style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }} />
        <div className={`absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full ${isLight ? 'opacity-10' : 'opacity-15'}`}
          style={{ background: 'radial-gradient(circle, #4F46E5 0%, transparent 70%)' }} />
        <div className={`absolute top-1/2 right-[10%] w-[200px] h-[200px] rounded-full ${isLight ? 'opacity-5' : 'opacity-10'}`}
          style={{ background: 'radial-gradient(circle, #06B6D4 0%, transparent 70%)' }} />

        {/* Grid dots background */}
        <div className={`absolute inset-0 ${isLight ? 'opacity-[0.015]' : 'opacity-[0.03]'}`}
          style={{
            backgroundImage: `radial-gradient(circle, ${isLight ? '#0F172A' : '#ffffff'} 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }} />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className={`w-10 h-10 bg-[#2563EB] rounded-2xl flex items-center justify-center shadow-lg ${isLight ? 'shadow-blue-600/20' : 'shadow-blue-900/50'}`}>
              <Brain size={22} className="text-white" />
            </div>
            <span className={`text-2xl font-bold ${isLight ? 'text-[#0F172A]' : 'text-[#F9FAFB]'} tracking-tight`}>
              HireMind <span className="text-[#2563EB]">AI</span>
            </span>
          </div>

          {/* Headline */}
          <h1 className={`text-5xl font-bold ${isLight ? 'text-[#0F172A]' : 'text-[#F9FAFB]'} leading-[1.15] mb-4`}>
            Your AI-Powered<br />
            <span className="text-transparent bg-clip-text"
              style={{
                backgroundImage: isLight 
                  ? 'linear-gradient(90deg, #2563EB, #4F46E5)' 
                  : 'linear-gradient(90deg, #2563EB, #06B6D4)'
              }}>
              Career Partner
            </span>
          </h1>
          <p className={`${isLight ? 'text-[#334155]' : 'text-[#D1D5DB]'} text-lg mb-12 leading-relaxed`}>
            Land your dream job with AI that scores resumes,<br />
            coaches interviews, and tracks every application.
          </p>

          {/* Feature list */}
          <div className="space-y-5">
            {[
              { icon: <Target size={18} />, color: isLight ? 'text-[#2563EB] bg-[#EFF6FF]' : 'text-[#06B6D4] bg-[#06B6D4]/10', title: 'AI Resume ATS Scoring', sub: 'Match your resume to any job in seconds' },
              { icon: <Brain size={18} />, color: isLight ? 'text-[#7C3AED] bg-[#F5F3FF]' : 'text-[#7C3AED] bg-[#7C3AED]/10', title: 'Mock Interview Engine', sub: '50-question tests tailored to TCS, Infosys, Google' },
              { icon: <FileText size={18} />, color: isLight ? 'text-[#0D9488] bg-[#F0FDFA]' : 'text-[#0D9488] bg-[#0D9488]/10', title: 'One-Click Offer Letters', sub: 'AI-generated, Cloudinary-hosted, instant download' },
              { icon: <Users size={18} />, color: isLight ? 'text-[#D97706] bg-[#FFFBEB]' : 'text-[#F59E0B] bg-[#F59E0B]/10', title: 'Recruiter Kanban Pipeline', sub: 'Drag-drop hiring workflow from apply to hired' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${f.color}`}>
                  {f.icon}
                </div>
                <div>
                  <p className={`font-semibold text-sm ${isLight ? 'text-[#0F172A]' : 'text-[#F9FAFB]'}`}>{f.title}</p>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-[#64748B]' : 'text-[#9CA3AF]'}`}>{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust badge */}
        <div className="relative z-10 flex items-center gap-3 mt-12">
          <div className="flex -space-x-2">
            {['bg-[#2563EB]','bg-[#7C3AED]','bg-[#06B6D4]','bg-[#EC4899]'].map((c, i) => (
              <div key={i} className={`w-8 h-8 ${c} rounded-full border-2 ${isLight ? 'border-white' : 'border-[#0B1120]'} flex items-center justify-center text-white text-[10px] font-bold`}>
                {['A','R','S','P'][i]}
              </div>
            ))}
          </div>
          <p className={`${isLight ? 'text-[#334155]' : 'text-[#D1D5DB]'} text-xs`}>
            Join <span className={`font-bold ${isLight ? 'text-[#0F172A]' : 'text-[#F9FAFB]'}`}>1,000+</span> candidates already using HireMind AI
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className={`w-full lg:w-[48%] xl:w-[45%] flex flex-col justify-center items-center p-8 sm:p-12 ${isLight ? 'bg-[#FFFFFF]' : 'bg-[#0B1120]'}`}>
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-[#2563EB] rounded-xl flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <span className={`text-xl font-bold ${isLight ? 'text-[#0F172A]' : 'text-[#F9FAFB]'}`}>
              HireMind <span className="text-[#2563EB]">AI</span>
            </span>
          </div>

          <h2 className={`text-3xl font-bold ${isLight ? 'text-[#0F172A]' : 'text-[#F9FAFB]'} mb-1`}>Welcome back</h2>
          <p className={`${isLight ? 'text-[#64748B]' : 'text-[#9CA3AF]'} text-sm mb-8`}>Sign in to continue your journey</p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className={`block text-xs font-semibold ${isLight ? 'text-[#64748B]' : 'text-[#9CA3AF]'} uppercase tracking-wider mb-2`}>Email address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className={`w-full px-4 py-3.5 rounded-xl text-sm focus:outline-none transition-all ${
                  isLight 
                    ? 'bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A] placeholder-[#64748B]/50 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/30' 
                    : 'bg-[#1F2937] border border-[#334155] text-[#F9FAFB] placeholder-[#9CA3AF]/40 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/50'
                }`}
              />
            </div>

            {/* Password */}
            <div>
              <label className={`block text-xs font-semibold ${isLight ? 'text-[#64748B]' : 'text-[#9CA3AF]'} uppercase tracking-wider mb-2`}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className={`w-full px-4 py-3.5 pr-12 rounded-xl text-sm focus:outline-none transition-all ${
                    isLight 
                      ? 'bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A] placeholder-[#64748B]/50 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/30' 
                      : 'bg-[#1F2937] border border-[#334155] text-[#F9FAFB] placeholder-[#9CA3AF]/40 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/50'
                  }`}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                    isLight ? 'text-[#64748B] hover:text-[#0F172A]' : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
                  }`}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className={`w-4 h-4 rounded cursor-pointer ${
                  isLight 
                    ? 'border-[#CBD5E1] bg-white text-[#2563EB] focus:ring-[#2563EB]/30' 
                    : 'border-[#334155] bg-[#111827] text-[#2563EB] focus:ring-[#2563EB]/30'
                }`} />
                <span className={`text-sm ${
                  isLight ? 'text-[#64748B] group-hover:text-[#334155]' : 'text-[#9CA3AF] group-hover:text-[#D1D5DB]'
                } transition-colors`}>Remember me</span>
              </label>
              <button type="button" className={`text-sm font-medium transition-colors ${
                isLight ? 'text-[#2563EB] hover:text-blue-800' : 'text-[#06B6D4] hover:text-[#60a5fa]'
              }`}>
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 mt-2 font-semibold rounded-xl text-sm transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg ${
                isLight 
                  ? 'bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-blue-600/10' 
                  : 'bg-[#2563EB] hover:bg-[#3b82f6] active:bg-[#1d4ed8] text-white shadow-blue-900/30'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
              ) : (
                <>Sign in <ChevronRight size={16} /></>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center gap-3 py-1">
              <div className={`flex-1 h-px ${isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]'}`} />
              <span className={`text-xs ${isLight ? 'text-[#64748B]' : 'text-[#9CA3AF]'}`}>or</span>
              <div className={`flex-1 h-px ${isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]'}`} />
            </div>

            {/* Register link */}
            <p className={`text-center text-sm ${isLight ? 'text-[#334155]' : 'text-[#D1D5DB]'}`}>
              Don't have an account?{' '}
              <a href="/register" className={`font-semibold transition-colors ${
                isLight ? 'text-[#2563EB] hover:text-blue-800' : 'text-[#2563EB] hover:text-[#3b82f6]'
              }`}>
                Create one free
              </a>
            </p>

            <p className={`text-center ${isLight ? 'text-[#64748B]' : 'text-[#9CA3AF]'} text-xs pt-1`}>
              Admin? Use your admin email below — same login form.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
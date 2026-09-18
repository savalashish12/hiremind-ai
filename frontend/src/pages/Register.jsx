import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Briefcase, GraduationCap, ChevronRight, Check } from 'lucide-react';
import API from "../services/api";

const strengthConfig = [
  { label: '', color: '' },
  { label: 'Weak', color: 'bg-[#EF4444]' },
  { label: 'Fair', color: 'bg-[#F59E0B]' },
  { label: 'Good', color: 'bg-[#3B82F6]' },
  { label: 'Strong', color: 'bg-[#10B981]' },
];

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "CANDIDATE",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'password') {
      const pwd = e.target.value;
      let score = 0;
      if (pwd.length >= 8) score++;
      if (/[A-Z]/.test(pwd)) score++;
      if (/[0-9]/.test(pwd)) score++;
      if (/[^A-Za-z0-9]/.test(pwd)) score++;
      setPasswordStrength(score);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await API.post("/auth/register", formData);
      toast.success(res.data.message || "Registered! Please verify your email.");
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to register"
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
            ? 'linear-gradient(135deg, #F8FAFC 0%, #FAF5FF 50%, #E2E8F0 100%)' 
            : 'linear-gradient(135deg, #0B1120 0%, #1c0e35 50%, #0B1120 100%)'
        }}>

        {/* Decorative blobs */}
        <div className={`absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full ${isLight ? 'opacity-10' : 'opacity-20'}`}
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }} />
        <div className={`absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full ${isLight ? 'opacity-10' : 'opacity-15'}`}
          style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }} />

        {/* Grid dots background */}
        <div className={`absolute inset-0 ${isLight ? 'opacity-[0.015]' : 'opacity-[0.03]'}`}
          style={{
            backgroundImage: `radial-gradient(circle, ${isLight ? '#0F172A' : '#ffffff'} 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }} />

        <div className="relative z-10">
          {/* Headline */}
          <h1 className={`text-5xl font-bold ${isLight ? 'text-[#0F172A]' : 'text-[#F9FAFB]'} leading-[1.15] mb-4`}>
            Start your journey<br />
            <span className="text-transparent bg-clip-text"
              style={{
                backgroundImage: isLight 
                  ? 'linear-gradient(90deg, #7C3AED, #8B5CF6)' 
                  : 'linear-gradient(90deg, #7C3AED, #EC4899)'
              }}>
              with AI on your side
            </span>
          </h1>
          <p className={`${isLight ? 'text-[#334155]' : 'text-[#D1D5DB]'} text-lg mb-12 leading-relaxed`}>
            Free forever. No credit card needed.<br />
            Get hired faster with AI that works 24/7.
          </p>

          {/* What you get list */}
          <div className="space-y-4">
            {[
              'AI-scored resume against any job description',
              'Mock interviews for 50+ companies',
              'Live application tracker with stage stepper',
              'AI cover letter generator in one click',
              'Free in-browser resume builder with PDF export',
              'External jobs from RemoteOK & Internshala aggregated automatically',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isLight ? 'bg-[#F5F3FF] border border-[#E9E3FF]' : 'bg-[#7C3AED]/10 border border-[#7C3AED]/30'
                }`}>
                  <Check size={11} className="text-[#7C3AED]" />
                </div>
                <p className={`text-sm ${isLight ? 'text-[#334155]' : 'text-[#D1D5DB]'}`}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-12">
          <p className={`${isLight ? 'text-[#334155]' : 'text-[#D1D5DB]'} text-xs`}>"Best AI recruitment tool I've used for campus hiring."</p>
          <p className={`${isLight ? 'text-[#64748B] font-medium' : 'text-[#9CA3AF]'} text-xs mt-1`}>— Recruiter, TCS Digital</p>
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className={`w-full lg:w-[48%] xl:w-[45%] flex flex-col justify-center items-center p-8 sm:p-12 ${isLight ? 'bg-[#FFFFFF]' : 'bg-[#0B1120]'} overflow-y-auto`}>
        <div className="w-full max-w-[400px]">

          <h2 className={`text-3xl font-bold ${isLight ? 'text-[#0F172A]' : 'text-[#F9FAFB]'} mb-1`}>Create your account</h2>
          <p className={`${isLight ? 'text-[#64748B]' : 'text-[#9CA3AF]'} text-sm mb-8`}>Free forever · No credit card needed</p>

          {/* Role selector cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'CANDIDATE', icon: <GraduationCap size={22} />, title: "I'm a Candidate", sub: 'Find my dream job', accent: 'blue' },
              { value: 'RECRUITER', icon: <Briefcase size={22} />, title: "I'm a Recruiter", sub: 'Hire top talent', accent: 'purple' },
            ].map(r => {
              const selected = formData.role === r.value;
              let borderCls = '';
              let iconCls = '';
              if (isLight) {
                if (r.accent === 'blue') {
                  borderCls = selected ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]' : 'border-[#CBD5E1] bg-white text-[#334155]';
                  iconCls = selected ? 'text-[#2563EB]' : 'text-[#64748B]';
                } else {
                  borderCls = selected ? 'border-[#7C3AED] bg-[#F5F3FF] text-[#7C3AED]' : 'border-[#CBD5E1] bg-white text-[#334155]';
                  iconCls = selected ? 'text-[#7C3AED]' : 'text-[#64748B]';
                }
              } else {
                if (r.accent === 'blue') {
                  borderCls = selected ? 'border-[#2563EB] bg-[#2563EB]/10 text-white' : 'border-[#334155] hover:border-[#475569]';
                  iconCls = selected ? 'text-[#2563EB]' : 'text-[#9CA3AF]';
                } else {
                  borderCls = selected ? 'border-[#7C3AED] bg-[#7C3AED]/10 text-white' : 'border-[#334155] hover:border-[#475569]';
                  iconCls = selected ? 'text-[#7C3AED]' : 'text-[#9CA3AF]';
                }
              }
              return (
                <button key={r.value} type="button"
                  onClick={() => setFormData(f => ({ ...f, role: r.value }))}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 group ${borderCls}`}>
                  <div className={`mb-2 transition-colors ${iconCls}`}>{r.icon}</div>
                  <p className={`text-sm font-semibold leading-tight ${isLight ? 'text-[#0F172A]' : 'text-[#F9FAFB]'}`}>{r.title}</p>
                  <p className={`text-[11px] mt-0.5 ${isLight ? 'text-[#64748B]' : 'text-[#9CA3AF]'}`}>{r.sub}</p>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className={`block text-xs font-semibold ${isLight ? 'text-[#64748B]' : 'text-[#9CA3AF]'} uppercase tracking-wider mb-2`}>Full name</label>
              <input
                type="text"
                name="fullName"
                placeholder="Ashish Kumar"
                value={formData.fullName}
                onChange={handleChange}
                required
                autoComplete="name"
                className={`w-full px-4 py-3.5 rounded-xl text-sm focus:outline-none transition-all ${
                  isLight 
                    ? 'bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A] placeholder-[#64748B]/50 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30' 
                    : 'bg-[#1F2937] border border-[#334155] text-[#F9FAFB] placeholder-[#9CA3AF]/40 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/50'
                }`}
              />
            </div>

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
                    ? 'bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A] placeholder-[#64748B]/50 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30' 
                    : 'bg-[#1F2937] border border-[#334155] text-[#F9FAFB] placeholder-[#9CA3AF]/40 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/50'
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
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className={`w-full px-4 py-3.5 pr-12 rounded-xl text-sm focus:outline-none transition-all ${
                    isLight 
                      ? 'bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A] placeholder-[#64748B]/50 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30' 
                      : 'bg-[#1F2937] border border-[#334155] text-[#F9FAFB] placeholder-[#9CA3AF]/40 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/50'
                  }`}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                    isLight ? 'text-[#64748B] hover:text-[#0F172A]' : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
                  }`}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {/* Password strength bar */}
              {formData.password?.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                        i <= passwordStrength 
                          ? strengthConfig[passwordStrength].color 
                          : (isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]')
                      }`} />
                    ))}
                  </div>
                  <p className={`text-[11px] font-semibold ${
                    isLight ? (
                      passwordStrength <= 1 ? 'text-[#DC2626]' :
                      passwordStrength === 2 ? 'text-[#D97706]' :
                      passwordStrength === 3 ? 'text-[#2563EB]' : 'text-[#059669]'
                    ) : (
                      passwordStrength <= 1 ? 'text-[#EF4444]' :
                      passwordStrength === 2 ? 'text-[#F59E0B]' :
                      passwordStrength === 3 ? 'text-[#3B82F6]' : 'text-[#10B981]'
                    )
                  }`}>{strengthConfig[passwordStrength].label} password</p>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 mt-2 font-semibold rounded-xl text-sm transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg ${
                isLight 
                  ? 'bg-[#7C3AED] hover:bg-[#6d28d9] text-white shadow-indigo-600/10' 
                  : 'bg-[#7C3AED] hover:bg-[#8b5cf6] active:bg-[#6d28d9] text-white shadow-indigo-900/30'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</>
              ) : (
                <>Create free account <ChevronRight size={16} /></>
              )}
            </button>

            <p className="text-center text-[#9CA3AF] text-xs pt-1 leading-relaxed">
              By registering, you agree to our Terms of Service and Privacy Policy.
            </p>

            <div className="relative flex items-center gap-3 py-1">
              <div className={`flex-1 h-px ${isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]'}`} />
              <span className={`text-xs ${isLight ? 'text-[#64748B]' : 'text-[#9CA3AF]'}`}>or</span>
              <div className={`flex-1 h-px ${isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]'}`} />
            </div>

            {/* Sign up with Google (OAuth redirect flow — uses selected role above) */}
            <button
              type="button"
              disabled={isLoading || googleLoading}
              onClick={async () => {
                setGoogleLoading(true);
                try {
                  const res = await API.get(`/auth/google/url?role=${formData.role}`);
                  window.location.href = res.data.url;
                } catch (err) {
                  toast.error(err.response?.data?.message || "Google sign-in is not configured yet");
                  setGoogleLoading(false);
                }
              }}
              className={`w-full py-3.5 font-semibold rounded-xl text-sm transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2.5 border ${
                isLight
                  ? 'bg-white border-[#CBD5E1] text-[#0F172A] hover:bg-[#F8FAFC]'
                  : 'bg-white/[0.03] border-[#334155] text-[#F9FAFB] hover:bg-white/[0.07]'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.8-5 3.8-8.9z" />
                <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.2 0-5.9-2.1-6.8-5l-.1.1-3.6 2.8v.1C3.5 21.3 7.4 24 12 24z" />
                <path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.1-3.5-2.7-.1.1C.5 8.7 0 10.3 0 12s.5 3.3 1.5 4.7l3.7-2.3z" />
                <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.4 0 3.5 2.7 1.5 6.9l3.7 2.8c1-2.9 3.6-5 6.8-5z" />
              </svg>
              {googleLoading ? "Redirecting to Google..." : `Continue with Google as ${formData.role === 'RECRUITER' ? 'Recruiter' : 'Candidate'}`}
            </button>

            <div className="relative flex items-center gap-3 py-1">
              <div className={`flex-1 h-px ${isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]'}`} />
              <span className={`text-xs ${isLight ? 'text-[#64748B]' : 'text-[#9CA3AF]'}`}>already have an account?</span>
              <div className={`flex-1 h-px ${isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]'}`} />
            </div>

            <a href="/login"
              className={`block w-full py-3.5 border font-medium rounded-xl text-sm text-center transition-all ${
                isLight 
                  ? 'border-[#CBD5E1] hover:border-[#CBD5E1]/80 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155]' 
                  : 'border-[#334155] hover:border-[#475569] bg-[#1F2937] hover:bg-[#111827] text-white'
              }`}>
              Sign in instead
            </a>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
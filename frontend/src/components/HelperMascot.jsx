import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, LayoutDashboard, FileText, Bookmark, Brain, CreditCard } from "lucide-react";
import maleChar from "../assets/male_character.png";
import femaleChar from "../assets/female_character.png";

const TIPS = [
  "Upload your latest resume to boost your ATS score before applying.",
  "Run the AI ATS Scanner — aim for 75%+ before hitting Apply.",
  "Take a company-specific mock interview to practice under time pressure.",
  "Fill skill gaps shown on job cards with the suggested courses.",
  "Save interesting jobs first, then apply in one focused session.",
  "Keep your portfolio and GitHub links updated — recruiters check them.",
  "Generate a tailored cover letter for each application.",
];

const QUICK_LINKS = [
  { to: "/candidate-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/candidate/ats", label: "ATS Scanner", icon: Sparkles },
  { to: "/candidate/resume-builder", label: "Resume Builder", icon: FileText },
  { to: "/candidate/saved-jobs", label: "Saved Jobs", icon: Bookmark },
  { to: "/candidate/mock-interview", label: "Mock Interview", icon: Brain },
  { to: "/payment/history", label: "Billing", icon: CreditCard },
];

const HelperMascot = ({ gender = "boy" }) => {
  const [open, setOpen] = useState(false);
  const [tipIndex, setTipIndex] = useState(() => new Date().getDate() % TIPS.length);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950/60">
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles size={13} className="text-cyan-400" /> Tip of the day
              </p>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white transition-colors" aria-label="Close helper">
                <X size={14} />
              </button>
            </div>
            <div className="p-3 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">💡 {TIPS[tipIndex]}</p>
              <button
                onClick={() => setTipIndex((i) => (i + 1) % TIPS.length)}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300"
              >
                Show another tip →
              </button>
              <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800">
                {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl px-2.5 py-2 transition-all"
                  >
                    <Icon size={12} className="text-blue-400" /> {label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Open career helper"
        className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-500/60 shadow-[0_0_25px_rgba(6,182,212,0.35)] bg-slate-950"
      >
        <img src={gender === "boy" ? maleChar : femaleChar} alt="Career helper" className="w-full h-full object-cover" />
      </motion.button>
    </div>
  );
};

export default HelperMascot;

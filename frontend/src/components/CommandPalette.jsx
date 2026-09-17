import { Command } from 'cmdk';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Search, LayoutDashboard, Briefcase, FileText, Target, BookmarkCheck, User, Brain, BarChart2, Users } from 'lucide-react';

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const go = (path) => {
    navigate(path);
    setOpen(false);
  };

  const candidateItems = [
    { icon: <LayoutDashboard size={14}/>, label: 'My Dashboard', action: () => go('/candidate-dashboard') },
    { icon: <Briefcase size={14}/>, label: 'Browse Jobs', action: () => go('/jobs') },
    { icon: <Target size={14}/>, label: 'ATS Score', action: () => go('/candidate/ats') },
    { icon: <Brain size={14}/>, label: 'Mock Interview', action: () => go('/candidate/mock-interview') },
    { icon: <BookmarkCheck size={14}/>, label: 'Saved Jobs', action: () => go('/candidate/saved-jobs') },
    { icon: <User size={14}/>, label: 'My Portfolio', action: () => go('/candidate/portfolio') },
    { icon: <FileText size={14}/>, label: 'Resume Builder', action: () => go('/candidate/resume-builder') },
  ];

  const recruiterItems = [
    { icon: <LayoutDashboard size={14}/>, label: 'Recruiter Dashboard', action: () => go('/recruiter-dashboard') },
    { icon: <Briefcase size={14}/>, label: 'Browse All Jobs', action: () => go('/jobs') },
    { icon: <BarChart2 size={14}/>, label: 'Company Profile', action: () => go('/recruiter/company-profile') },
  ];

  const adminItems = [
    { icon: <Users size={14}/>, label: 'Manage Users', action: () => go('/admin-dashboard') },
  ];

  const publicItems = [
    { icon: <Briefcase size={14}/>, label: 'Browse Jobs', action: () => go('/jobs') },
    { icon: <FileText size={14}/>, label: 'View Pricing', action: () => go('/pricing') },
  ];

  const getItems = () => {
    if (!user) return publicItems;
    if (user.role === 'ADMIN') return [...adminItems, ...publicItems];
    if (user.role === 'RECRUITER') return [...recruiterItems, ...publicItems];
    return [...candidateItems, ...publicItems];
  };

  const items = getItems();

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <Command label="Command Palette">
          <div className="flex items-center gap-3 px-4 border-b border-slate-800">
            <Search className="text-slate-500 shrink-0" size={18} />
            <Command.Input
              placeholder="Type a command or search..."
              className="w-full py-4 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
              autoFocus
            />
            <kbd className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 shrink-0">ESC</kbd>
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-xs text-slate-500">No results found.</Command.Empty>
            <Command.Group heading="Navigation" className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-3 py-2">
              {items.map((item, idx) => (
                <Command.Item
                  key={idx}
                  onSelect={item.action}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer select-none outline-none data-[selected=true]:bg-slate-800 data-[selected=true]:text-white"
                >
                  <span className="text-slate-500 shrink-0">{item.icon}</span>
                  <span className="flex-1 font-medium">{item.label}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};

export default CommandPalette;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FileText, Plus, Trash2, ArrowLeft, ArrowRight, Save, Sparkles, Download, Eye } from 'lucide-react';
import { jsPDF } from 'jspdf';
import API from '../services/api';

// Build plain-text lines for preview + client-side PDF (ATS-friendly, single column)
const buildResumeLines = (formData) => {
  const skillArr = Array.isArray(formData.skills)
    ? formData.skills
    : String(formData.skills || '').split(',').map((s) => s.trim()).filter(Boolean);
  const lines = [];
  lines.push({ text: formData.fullName || 'Your Name', style: 'name' });
  lines.push({
    text: [formData.email, formData.phone, formData.location, formData.linkedinUrl, formData.githubUrl]
      .filter(Boolean).join('  |  '),
    style: 'contact',
  });
  if (formData.summary) {
    lines.push({ text: 'PROFESSIONAL SUMMARY', style: 'heading' });
    lines.push({ text: formData.summary, style: 'body' });
  }
  if (formData.experience?.some((e) => e.role || e.company)) {
    lines.push({ text: 'WORK EXPERIENCE', style: 'heading' });
    formData.experience.forEach((exp) => {
      if (!exp.role && !exp.company) return;
      lines.push({ text: `${exp.role || ''}${exp.role && exp.company ? ' at ' : ''}${exp.company || ''}${exp.duration ? `  (${exp.duration})` : ''}`, style: 'subhead' });
      String(exp.description || '').split('\n').map((l) => l.trim()).filter(Boolean)
        .forEach((l) => lines.push({ text: `• ${l}`, style: 'body' }));
    });
  }
  if (formData.education?.some((e) => e.degree || e.institution)) {
    lines.push({ text: 'EDUCATION', style: 'heading' });
    formData.education.forEach((edu) => {
      if (!edu.degree && !edu.institution) return;
      lines.push({ text: `${edu.degree || ''}${edu.degree && edu.institution ? ', ' : ''}${edu.institution || ''}${edu.year ? ` (${edu.year})` : ''}`, style: 'body' });
    });
  }
  if (skillArr.length > 0) {
    lines.push({ text: 'SKILLS', style: 'heading' });
    lines.push({ text: skillArr.join(', '), style: 'body' });
  }
  if (formData.projects?.some((p) => p.name)) {
    lines.push({ text: 'PROJECTS', style: 'heading' });
    formData.projects.forEach((p) => {
      if (!p.name) return;
      lines.push({ text: `${p.name}${p.techStack ? ` — ${p.techStack}` : ''}`, style: 'subhead' });
      if (p.description) lines.push({ text: p.description, style: 'body' });
      if (p.githubUrl || p.liveUrl) lines.push({ text: [p.githubUrl, p.liveUrl].filter(Boolean).join('  |  '), style: 'contact' });
    });
  }
  const certArr = Array.isArray(formData.certifications)
    ? formData.certifications
    : String(formData.certifications || '').split(',').map((c) => c.trim()).filter(Boolean);
  if (certArr.length > 0) {
    lines.push({ text: 'CERTIFICATIONS', style: 'heading' });
    certArr.forEach((c) => lines.push({ text: `• ${c}`, style: 'body' }));
  }
  return lines;
};

const ResumePreview = ({ formData }) => {
  const lines = buildResumeLines(formData);
  return (
    <div className="bg-white text-slate-900 rounded-2xl p-8 shadow-xl font-serif text-sm leading-relaxed min-h-[600px]">
      {lines.map((l, i) => {
        if (l.style === 'name') return <h2 key={i} className="text-2xl font-bold text-center text-slate-900">{l.text}</h2>;
        if (l.style === 'contact') return <p key={i} className="text-center text-[11px] text-slate-500 mt-1 break-words">{l.text}</p>;
        if (l.style === 'heading') return <h3 key={i} className="text-xs font-bold tracking-widest text-blue-700 border-b border-slate-300 mt-5 mb-2 pb-1">{l.text}</h3>;
        if (l.style === 'subhead') return <p key={i} className="font-bold text-[13px] mt-2">{l.text}</p>;
        return <p key={i} className="text-[13px] text-slate-700 whitespace-pre-wrap">{l.text}</p>;
      })}
    </div>
  );
};

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    summary: '',
    experience: [{ company: '', role: '', duration: '', description: '' }],
    education: [{ institution: '', degree: '', year: '' }],
    projects: [{ name: '', techStack: '', description: '', githubUrl: '', liveUrl: '' }],
    skills: '',
    certifications: '',
  });

  const handleTextChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleArrayChange = (index, field, value, type) => {
    const list = [...formData[type]];
    list[index][field] = value;
    setFormData({
      ...formData,
      [type]: list,
    });
  };

  const addArrayEntry = (type, defaultValue) => {
    setFormData({
      ...formData,
      [type]: [...formData[type], defaultValue],
    });
  };

  const removeArrayEntry = (index, type) => {
    const list = [...formData[type]];
    if (list.length > 1) {
      list.splice(index, 1);
      setFormData({
        ...formData,
        [type]: list,
      });
    } else {
      toast.error('Must have at least one entry');
    }
  };

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const res = await API.post('/ai/generate-summary', {
        skills: formData.skills,
        experience: formData.experience,
        education: formData.education,
      });
      setFormData({ ...formData, summary: res.data.summary });
      toast.success('AI summary generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate summary');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleDownloadPdf = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const margin = 50;
      const maxWidth = 595 - margin * 2;
      let y = 60;
      const lines = buildResumeLines(formData);
      lines.forEach((l) => {
        if (y > 780) { doc.addPage(); y = 60; }
        if (l.style === 'name') {
          doc.setFont('times', 'bold').setFontSize(20).setTextColor(20, 30, 50);
          doc.text(l.text, 297, y, { align: 'center', maxWidth });
          y += 26;
        } else if (l.style === 'contact') {
          doc.setFont('times', 'normal').setFontSize(9).setTextColor(100, 116, 139);
          const split = doc.splitTextToSize(l.text, maxWidth);
          doc.text(split, 297, y, { align: 'center' });
          y += split.length * 12 + 8;
        } else if (l.style === 'heading') {
          y += 8;
          doc.setFont('times', 'bold').setFontSize(11).setTextColor(30, 100, 200);
          doc.text(l.text, margin, y, { maxWidth });
          y += 16;
        } else if (l.style === 'subhead') {
          doc.setFont('times', 'bold').setFontSize(10).setTextColor(20, 30, 50);
          const split = doc.splitTextToSize(l.text, maxWidth);
          doc.text(split, margin, y, { maxWidth });
          y += split.length * 13 + 2;
        } else {
          doc.setFont('times', 'normal').setFontSize(10).setTextColor(50, 50, 50);
          const split = doc.splitTextToSize(l.text, maxWidth);
          doc.text(split, margin, y, { maxWidth });
          y += split.length * 13 + 2;
        }
      });
      doc.save(`${(formData.fullName || 'resume').replace(/\s+/g, '_')}_Resume.pdf`);
      toast.success('Resume PDF downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Format skills and certs as arrays
    const formattedData = {
      ...formData,
      skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      certifications: formData.certifications.split(',').map((c) => c.trim()).filter(Boolean),
    };

    try {
      const res = await API.post('/candidate/build-resume', formattedData);
      if (res.data.resumeUrl) {
        toast.success('Resume compiled and saved successfully!');
        navigate('/candidate/dashboard');
      } else {
        toast.error('Failed to compile resume');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error compiling PDF resume');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm";
  const smallInputCls = "w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-xs";

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/candidate/dashboard')}
              className="p-2 bg-slate-905 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="text-blue-500" size={20} />
                AI Resume Builder
              </h1>
              <p className="text-xs text-slate-400 mt-1">Compile an ATS-optimized, single-page professional PDF</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-blue-500/10 text-blue-400 font-bold px-3 py-1 rounded-full border border-blue-500/20">
              Step {step} of 6
            </span>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl transition-all font-bold disabled:opacity-50"
            >
              <Download size={14} /> {downloading ? 'Building PDF...' : 'Download PDF'}
            </button>
          </div>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-1.5 mb-8 max-w-3xl">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          {/* Form Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-200">1. Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleTextChange} placeholder="John Doe" required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleTextChange} placeholder="john.doe@example.com" required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleTextChange} placeholder="+91 9876543210" required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleTextChange} placeholder="Mumbai, India" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">LinkedIn URL</label>
                  <input type="text" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleTextChange} placeholder="linkedin.com/in/johndoe" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">GitHub URL</label>
                  <input type="text" name="githubUrl" value={formData.githubUrl} onChange={handleTextChange} placeholder="github.com/johndoe" className={inputCls} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-200">2. Professional Summary</h2>
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary}
                  className="flex items-center gap-1.5 text-xs bg-purple-600/10 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-xl hover:bg-purple-600 hover:text-white transition-all font-semibold disabled:opacity-50"
                >
                  <Sparkles size={14} /> {generatingSummary ? 'Writing...' : 'AI Generate Summary'}
                </button>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Executive Summary</label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleTextChange}
                  rows={6}
                  placeholder="Experienced Software Engineer with a passion for building scalable web applications and AI integrations..."
                  required
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm leading-relaxed"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-200">3. Work Experience</h2>
                <button
                  type="button"
                  onClick={() => addArrayEntry('experience', { company: '', role: '', duration: '', description: '' })}
                  className="flex items-center gap-1.5 text-xs bg-blue-600/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all font-semibold cursor-pointer"
                >
                  <Plus size={14} /> Add Job
                </button>
              </div>

              {formData.experience.map((exp, idx) => (
                <div key={idx} className="p-5 bg-slate-950 border border-slate-850 rounded-2xl relative space-y-4">
                  <button type="button" onClick={() => removeArrayEntry(idx, 'experience')} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 transition-colors cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-450 mb-1.5 font-bold">Company</label>
                      <input type="text" value={exp.company} onChange={(e) => handleArrayChange(idx, 'company', e.target.value, 'experience')} placeholder="Google" required className={smallInputCls} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-455 mb-1.5 font-bold">Role / Title</label>
                      <input type="text" value={exp.role} onChange={(e) => handleArrayChange(idx, 'role', e.target.value, 'experience')} placeholder="Senior Software Engineer" required className={smallInputCls} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-455 mb-1.5 font-bold">Duration (e.g. 2022 - Present)</label>
                      <input type="text" value={exp.duration} onChange={(e) => handleArrayChange(idx, 'duration', e.target.value, 'experience')} placeholder="Jan 2022 - Present" required className={smallInputCls} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-455 mb-1.5 font-bold">Key Responsibilities / Achievements (one per line)</label>
                      <textarea value={exp.description} onChange={(e) => handleArrayChange(idx, 'description', e.target.value, 'experience')} rows={4} placeholder="Designed microservices handling 10k requests/sec.&#10;Mentored 5 junior engineers." required className={`${smallInputCls} leading-relaxed`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-200">4. Education History</h2>
                <button
                  type="button"
                  onClick={() => addArrayEntry('education', { institution: '', degree: '', year: '' })}
                  className="flex items-center gap-1.5 text-xs bg-blue-600/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all font-semibold cursor-pointer"
                >
                  <Plus size={14} /> Add Education
                </button>
              </div>

              {formData.education.map((edu, idx) => (
                <div key={idx} className="p-5 bg-slate-950 border border-slate-850 rounded-2xl relative space-y-4">
                  <button type="button" onClick={() => removeArrayEntry(idx, 'education')} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 transition-colors cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-455 mb-1.5 font-bold">Institution / University</label>
                      <input type="text" value={edu.institution} onChange={(e) => handleArrayChange(idx, 'institution', e.target.value, 'education')} placeholder="IIT Bombay" required className={smallInputCls} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-455 mb-1.5 font-bold">Degree / Program</label>
                      <input type="text" value={edu.degree} onChange={(e) => handleArrayChange(idx, 'degree', e.target.value, 'education')} placeholder="B.Tech Computer Science" required className={smallInputCls} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-455 mb-1.5 font-bold">Year of Graduation (e.g. 2021)</label>
                      <input type="text" value={edu.year} onChange={(e) => handleArrayChange(idx, 'year', e.target.value, 'education')} placeholder="2021" required className={smallInputCls} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-200">5. Projects</h2>
                <button
                  type="button"
                  onClick={() => addArrayEntry('projects', { name: '', techStack: '', description: '', githubUrl: '', liveUrl: '' })}
                  className="flex items-center gap-1.5 text-xs bg-blue-600/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all font-semibold cursor-pointer"
                >
                  <Plus size={14} /> Add Project
                </button>
              </div>

              {formData.projects.map((proj, idx) => (
                <div key={idx} className="p-5 bg-slate-950 border border-slate-850 rounded-2xl relative space-y-4">
                  <button type="button" onClick={() => removeArrayEntry(idx, 'projects')} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 transition-colors cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-455 mb-1.5 font-bold">Project Name</label>
                      <input type="text" value={proj.name} onChange={(e) => handleArrayChange(idx, 'name', e.target.value, 'projects')} placeholder="HireMind AI" className={smallInputCls} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-455 mb-1.5 font-bold">Tech Stack</label>
                      <input type="text" value={proj.techStack} onChange={(e) => handleArrayChange(idx, 'techStack', e.target.value, 'projects')} placeholder="React, Node.js, PostgreSQL" className={smallInputCls} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-455 mb-1.5 font-bold">Description</label>
                      <textarea value={proj.description} onChange={(e) => handleArrayChange(idx, 'description', e.target.value, 'projects')} rows={3} placeholder="What it does and your impact..." className={`${smallInputCls} leading-relaxed`} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-455 mb-1.5 font-bold">GitHub URL</label>
                      <input type="text" value={proj.githubUrl} onChange={(e) => handleArrayChange(idx, 'githubUrl', e.target.value, 'projects')} placeholder="github.com/you/project" className={smallInputCls} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-455 mb-1.5 font-bold">Live URL</label>
                      <input type="text" value={proj.liveUrl} onChange={(e) => handleArrayChange(idx, 'liveUrl', e.target.value, 'projects')} placeholder="project.vercel.app" className={smallInputCls} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-200">6. Skills & Certifications</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Technical Skills (comma-separated)</label>
                  <input type="text" name="skills" value={formData.skills} onChange={handleTextChange} placeholder="React, Node.js, Python, PostgreSQL, AWS, Docker" required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Certifications (comma-separated)</label>
                  <input type="text" name="certifications" value={formData.certifications} onChange={handleTextChange} placeholder="AWS Solutions Architect, Kubernetes CKA" className={inputCls} />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-800">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 px-4 py-2.5 rounded-xl transition-all cursor-pointer font-bold">
                <ArrowLeft size={14} /> Previous
              </button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && (!formData.fullName || !formData.email || !formData.phone)) {
                    toast.error('Please fill in contact fields');
                    return;
                  }
                  if (step === 2 && !formData.summary) {
                    toast.error('Please write a summary (or use AI Generate)');
                    return;
                  }
                  setStep(step + 1);
                }}
                className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl transition-all cursor-pointer font-bold ml-auto"
              >
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl transition-all cursor-pointer font-bold shadow-md shadow-green-950/20"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Compiling ATS PDF...
                  </>
                ) : (
                  <>
                    <Save size={14} /> Compile & Save Resume
                  </>
                )}
              </button>
            )}
          </div>
          </div>

          {/* Live Preview Pane */}
          <div className="xl:sticky xl:top-6">
            <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-1.5">
              <Eye size={14} className="text-blue-400" /> Live Preview (ATS-friendly)
            </h2>
            <ResumePreview formData={formData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;

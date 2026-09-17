import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FileText, Plus, Trash2, ArrowLeft, ArrowRight, Save, Sparkles } from 'lucide-react';
import API from '../services/api';

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    summary: '',
    experience: [{ company: '', role: '', duration: '', description: '' }],
    education: [{ institution: '', degree: '', year: '' }],
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
        navigate('/candidate-dashboard');
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

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/candidate-dashboard')}
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
          <span className="text-xs bg-blue-500/10 text-blue-400 font-bold px-3 py-1 rounded-full border border-blue-500/20">
            Step {step} of 5
          </span>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-1.5 mb-8">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Form Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-200">1. Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleTextChange}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleTextChange}
                    placeholder="john.doe@example.com"
                    required
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleTextChange}
                    placeholder="+91 9876543210"
                    required
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-200">2. Professional Summary</h2>
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
                  <button
                    type="button"
                    onClick={() => removeArrayEntry(idx, 'experience')}
                    className="absolute top-4 right-4 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-450 mb-1.5 font-bold">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleArrayChange(idx, 'company', e.target.value, 'experience')}
                        placeholder="Google"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-455 mb-1.5 font-bold">Role / Title</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleArrayChange(idx, 'role', e.target.value, 'experience')}
                        placeholder="Senior Software Engineer"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-xs"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-455 mb-1.5 font-bold">Duration (e.g. 2022 - Present)</label>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => handleArrayChange(idx, 'duration', e.target.value, 'experience')}
                        placeholder="Jan 2022 - Present"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-xs"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-455 mb-1.5 font-bold font-bold">Key Responsibilities / Achievements (one per line)</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => handleArrayChange(idx, 'description', e.target.value, 'experience')}
                        rows={4}
                        placeholder="Designed microservices handling 10k requests/sec.&#10;Mentored 5 junior engineers and hosted standard design workshops."
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-xs leading-relaxed"
                      />
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
                  <button
                    type="button"
                    onClick={() => removeArrayEntry(idx, 'education')}
                    className="absolute top-4 right-4 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-455 mb-1.5 font-bold">Institution / University</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleArrayChange(idx, 'institution', e.target.value, 'education')}
                        placeholder="IIT Bombay"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-455 mb-1.5 font-bold">Degree / Program</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleArrayChange(idx, 'degree', e.target.value, 'education')}
                        placeholder="B.Tech Computer Science"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-xs"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-455 mb-1.5 font-bold">Year of Graduation (e.g. 2021)</label>
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) => handleArrayChange(idx, 'year', e.target.value, 'education')}
                        placeholder="2021"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-200">5. Skills & Certifications</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Technical Skills (comma-separated)</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleTextChange}
                    placeholder="React, Node.js, Python, PostgreSQL, AWS, Docker"
                    required
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-855 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Certifications (comma-separated)</label>
                  <input
                    type="text"
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleTextChange}
                    placeholder="AWS Solutions Architect, GCP Cloud Developer, Kubernetes CKA"
                    className="w-full px-4 py-3 bg-slate-955 border border-slate-855 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 px-4 py-2.5 rounded-xl transition-all cursor-pointer font-bold"
              >
                <ArrowLeft size={14} /> Previous
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => {
                  // Perform simple validation for step
                  if (step === 1 && (!formData.fullName || !formData.email || !formData.phone)) {
                    toast.error('Please fill in contact fields');
                    return;
                  }
                  if (step === 2 && !formData.summary) {
                    toast.error('Please write a summary');
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
      </div>
    </div>
  );
};

export default ResumeBuilder;

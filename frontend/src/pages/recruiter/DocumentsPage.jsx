import { useEffect, useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

const DocumentsPage = () => {
  const [docs, setDocs] = useState([]);
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState({ title: "", category: "POLICY" });
  const [uploading, setUploading] = useState(false);
  const fetchDocs = async () => {
    try { const res = await API.get("/ai/knowledge/documents"); setDocs(Array.isArray(res.data) ? res.data : res.data.documents || []); }
    catch { /* ignore */ }
  };
  useEffect(() => { fetchDocs(); }, []);
  const upload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Select a file");
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file); fd.append("title", meta.title || file.name); fd.append("category", meta.category);
    try { await API.post("/ai/knowledge/upload", fd, { headers: { "Content-Type": "multipart/form-data" } }); toast.success("Uploaded!"); setFile(null); setMeta({ title: "", category: "POLICY" }); fetchDocs(); }
    catch (err) { toast.error(err.response?.data?.message || "Upload failed"); }
    finally { setUploading(false); }
  };
  const del = async (id) => {
    if (!window.confirm("Delete document?")) return;
    try { await API.delete(`/ai/knowledge/documents/${id}`); toast.success("Deleted"); fetchDocs(); }
    catch { toast.error("Delete failed"); }
  };
  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-white">Knowledge Documents (RAG source)</h1>
      <p className="text-xs text-slate-400">Upload handbooks, JDs, guidelines. Ask about them in <a href="/recruiter/chatbot" className="text-blue-400 hover:underline">AI Chatbot →</a></p>
      <form onSubmit={upload} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
        <input value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} placeholder="Document title" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500" />
        <select value={meta.category} onChange={(e) => setMeta({ ...meta, category: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200">
          <option value="POLICY">Company Policy</option><option value="JD">Job Description</option><option value="GUIDELINE">Interview Guideline</option><option value="GENERAL">General</option>
        </select>
        <input type="file" accept=".pdf,.txt" onChange={(e) => setFile(e.target.files[0])} className="w-full text-slate-400 text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600/10 file:text-blue-400 file:font-bold" />
        <button disabled={uploading || !file} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl">{uploading ? "Uploading..." : "Upload Document"}</button>
      </form>
      <div className="space-y-2">{docs.map((d) => <div key={d.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex justify-between gap-3 text-xs"><div className="truncate"><p className="font-bold text-slate-200 truncate">{d.title}</p><p className="text-[10px] text-slate-500">{d.category}</p></div><button onClick={() => del(d.id)} className="text-red-400 hover:text-red-300 font-bold shrink-0">Delete</button></div>)}</div>
    </div>
  );
};

export default DocumentsPage;

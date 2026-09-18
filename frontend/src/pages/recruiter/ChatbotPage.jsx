import { useState } from "react";
import API from "../../services/api";
import { Brain, Send } from "lucide-react";

const ChatbotPage = () => {
  const [q, setQ] = useState("");
  const [history, setHistory] = useState([]);
  const [asking, setAsking] = useState(false);
  const ask = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    const msg = q; setQ("");
    setHistory((h) => [...h, { from: "you", text: msg }]);
    setAsking(true);
    try {
      const res = await API.post("/ai/knowledge/ask", { question: msg });
      const answer = typeof res.data?.answer === "string" ? res.data.answer : res.data?.answer || "No answer.";
      setHistory((h) => [...h, { from: "ai", text: answer, sources: res.data?.sources || [] }]);
    } catch (err) {
      setHistory((h) => [...h, { from: "ai", text: err.response?.data?.message || "Query failed. Upload documents first." }]);
    } finally { setAsking(false); }
  };
  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-white flex items-center gap-2"><Brain size={20} className="text-purple-400" /> RAG Policy Assistant</h1>
      <p className="text-xs text-slate-400">Answers grounded in your uploaded docs — see <a href="/recruiter/documents" className="text-blue-400 hover:underline">Documents →</a></p>
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col h-[520px] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-3 text-xs">
          {history.length === 0 && <p className="text-slate-500 italic text-center py-20">Ask e.g. “What is our leave policy?” or “Summarize the React interview checklist.”</p>}
          {history.map((m, i) => (
            <div key={i} className={`flex ${m.from === "you" ? "justify-end" : "justify-start"}`}>
              <div className={`p-3 rounded-2xl max-w-md whitespace-pre-wrap ${m.from === "you" ? "bg-blue-600 text-white rounded-tr-none" : "bg-slate-950 text-slate-300 border border-slate-800 rounded-tl-none"}`}>
                {m.text}
                {m.sources?.length > 0 && <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-500">Sources: {m.sources.map((s) => s.title).join(", ")}</div>}
              </div>
            </div>
          ))}
          {asking && <p className="text-slate-500 animate-pulse">AI is reading your documents...</p>}
        </div>
        <form onSubmit={ask} className="p-4 border-t border-slate-800 bg-slate-950/60 flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about policies, JDs, guidelines..." className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500" />
          <button disabled={asking || !q.trim()} className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1">Ask <Send size={12} /></button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotPage;

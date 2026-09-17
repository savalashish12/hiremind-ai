import { useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

const ResumeUpload = ({ fetchProfile, currentResumeUrl }) => {
  const [file, setFile] = useState(null);

  const getResumeFileName = (url) => {
    if (!url) return "";
    try {
      const decoded = decodeURIComponent(url);
      const parts = decoded.split("/");
      return parts[parts.length - 1];
    } catch {
      return "Uploaded Resume";
    }
  };

  const handleUpload = async () => {
    if (!file) {
      return toast.error("Please select a PDF file");
    }

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await API.post(
        "/application/upload-resume",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Resume uploaded successfully");
      console.log(res.data);
      
      if (fetchProfile) {
        fetchProfile();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to upload resume");
    }
  };

  return (

    <div
      className="
      bg-slate-800
      p-6
      rounded-xl
      mb-10
      "
    >

      <h2
        className="
        text-3xl
        font-bold
        mb-6
        "
      >
        Upload Resume
      </h2>

      {currentResumeUrl && (
        <div className="mb-4 text-xs md:text-sm text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-slate-750 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="truncate max-w-full">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Currently Uploaded Resume</span>
            <span className="text-slate-200 font-bold block truncate">{getResumeFileName(currentResumeUrl)}</span>
          </div>
          <a
            href={`http://localhost:5000/api/candidate/document?url=${encodeURIComponent(currentResumeUrl)}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-900/20 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer select-none inline-block whitespace-nowrap"
          >
            Download / View ↗
          </a>
        </div>
      )}

      <input
        type="file"
        accept=".pdf"
        onChange={(e) =>
          setFile(
            e.target.files[0]
          )
        }
        className="mb-4 text-xs font-semibold block text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600/10 file:text-blue-400 hover:file:bg-blue-600 hover:file:text-white file:transition-colors file:cursor-pointer"
      />

      <button
        onClick={handleUpload}
        className="
        bg-blue-600
        hover:bg-blue-700
        text-white
        font-bold
        px-6
        py-3
        rounded-xl
        transition-all
        cursor-pointer
        text-xs
        "
      >
        Upload Resume
      </button>

    </div>
  );
};

export default ResumeUpload;
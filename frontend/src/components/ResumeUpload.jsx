import { useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

const ResumeUpload = ({ fetchProfile }) => {
  const [file, setFile] = useState(null);

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

      <input
        type="file"
        accept=".pdf"
        onChange={(e) =>
          setFile(
            e.target.files[0]
          )
        }
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        className="
        bg-blue-600
        px-6
        py-3
        rounded
        "
      >
        Upload Resume
      </button>

    </div>
  );
};

export default ResumeUpload;
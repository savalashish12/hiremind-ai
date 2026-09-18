import { useState } from "react";
import toast from "react-hot-toast";

import API from "../services/api";

const CreateJobForm = ({
  fetchRecruiterJobs,
}) => {

  const [formData, setFormData] =
    useState({
      title: "",
      description: "",
      location: "",
      salary: "",
      jobType: "FULL_TIME",
      skillsRequired: "",
    });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const payload = {
        ...formData,

        skillsRequired:
          formData.skillsRequired
          .split(",")
          .map((skill) =>
            skill.trim()
          ),
      };

      await API.post(
        "/jobs",
        payload
      );

      toast.success(
        "Job created successfully"
      );

      setFormData({
        title: "",
        description: "",
        location: "",
        salary: "",
        jobType: "FULL_TIME",
        skillsRequired: "",
      });

      fetchRecruiterJobs();

    } catch (error) {
      console.error("Create job error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to create job"
      );
    }
  };

  const inputCls =
    "w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors";

  return (

    <form
      onSubmit={handleSubmit}
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
        Create Job
      </h2>

      <div
        className="
        grid
        md:grid-cols-2
        gap-4
        "
      >

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Job Title *</label>
          <input
            type="text"
            name="title"
            placeholder="e.g. Frontend Developer"
            value={formData.title}
            onChange={handleChange}
            required
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location *</label>
          <input
            type="text"
            name="location"
            placeholder="e.g. Bangalore / Remote"
            value={formData.location}
            onChange={handleChange}
            required
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Salary *</label>
          <input
            type="text"
            name="salary"
            placeholder="e.g. ₹8-12 LPA"
            value={formData.salary}
            onChange={handleChange}
            required
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Employment Type *</label>
          <select
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            required
            className={`${inputCls} cursor-pointer`}
          >

            <option value="FULL_TIME">
              Full Time
            </option>

            <option value="PART_TIME">
              Part Time
            </option>

            <option value="INTERNSHIP">
              Internship
            </option>

            <option value="CONTRACT">
              Contract
            </option>

          </select>

        </div>

      </div>

      <div className="mt-4">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Job Description *</label>
        <textarea
          name="description"
          placeholder="Roles, responsibilities, requirements..."
          value={formData.description}
          onChange={handleChange}
          required
          rows="4"
          className={`${inputCls} leading-relaxed resize-y`}
        />
      </div>

      <div className="mt-4">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Skills Required (comma-separated)</label>
        <input
          type="text"
          name="skillsRequired"
          placeholder="React, Node.js, PostgreSQL"
          value={formData.skillsRequired}
          onChange={handleChange}
          className={inputCls}
        />
      </div>

      <button
        className="
        bg-blue-600
        hover:bg-blue-500
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500/40
        text-white
        font-bold
        px-8
        py-3.5
        rounded-xl
        mt-6
        text-sm
        transition-colors
        "
      >
        Create Job
      </button>

    </form>
  );
};

export default CreateJobForm;
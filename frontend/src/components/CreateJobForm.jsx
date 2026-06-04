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

        <input
          type="text"
          name="title"
          placeholder="Job Title"
          value={formData.title}
          onChange={handleChange}
          className="
          p-4
          rounded
          bg-slate-700
          "
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          className="
          p-4
          rounded
          bg-slate-700
          "
        />

        <input
          type="text"
          name="salary"
          placeholder="Salary"
          value={formData.salary}
          onChange={handleChange}
          className="
          p-4
          rounded
          bg-slate-700
          "
        />

        <select
          name="jobType"
          value={formData.jobType}
          onChange={handleChange}
          className="
          p-4
          rounded
          bg-slate-700
          "
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

        </select>

      </div>

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        className="
        w-full
        p-4
        rounded
        bg-slate-700
        mt-4
        "
      />

      <input
        type="text"
        name="skillsRequired"
        placeholder="React, Node.js, PostgreSQL"
        value={formData.skillsRequired}
        onChange={handleChange}
        className="
        w-full
        p-4
        rounded
        bg-slate-700
        mt-4
        "
      />

      <button
        className="
        bg-blue-600
        px-8
        py-4
        rounded
        mt-4
        "
      >
        Create Job
      </button>

    </form>
  );
};

export default CreateJobForm;
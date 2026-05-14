import {
  useEffect,
  useState,
} from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  useNavigate,
} from "react-router-dom";

import API from "../services/api";
import toast from "react-hot-toast";

import CreateJobForm from "../components/CreateJobForm";
import EditJobModal from "../components/EditJobModal";

const RecruiterDashboard = () => {

  const navigate =
    useNavigate();

  const [jobs, setJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null);

  const [analytics,
    setAnalytics] =
    useState({
      totalJobs: 0,
      totalApplications: 0,
      shortlistedCount: 0,
      rejectedCount: 0,
    });

  const fetchRecruiterJobs =
    async () => {

      try {

        const res =
          await API.get(
            "/jobs/my-jobs"
          );

        setJobs(res.data);

      } catch (error) {

        console.log(error);
      }
    };

  const fetchAnalytics =
    async () => {

      try {

        const res =
          await API.get(
            "/jobs/analytics/dashboard"
          );

        setAnalytics(
          res.data
        );

      } catch (error) {

        console.log(error);
      }
    };

  useEffect(() => {
    fetchRecruiterJobs();
    fetchAnalytics();
  }, []);

  const deleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await API.delete(`/jobs/${jobId}`);
      toast.success("Job deleted successfully");
      fetchRecruiterJobs();
      fetchAnalytics();
    } catch (error) {
      toast.error("Failed to delete job");
    }
  };

  const chartData = [

    {
      name: "Shortlisted",
      value:
        analytics.shortlistedCount,
    },

    {
      name: "Rejected",
      value:
        analytics.rejectedCount,
    },

    {
      name: "Pending",
      value:
        analytics.totalApplications -
        analytics.shortlistedCount -
        analytics.rejectedCount,
    },
  ];

  return (

    <div className="p-10">

      <h1
        className="
        text-5xl
        font-bold
        mb-10
        "
      >
        Recruiter Dashboard
      </h1>

      <CreateJobForm
        fetchRecruiterJobs={
          fetchRecruiterJobs
        }
      />

      <div
        className="
        grid
        md:grid-cols-4
        gap-6
        mb-10
        "
      >

        <div
          className="
          bg-slate-800
          p-6
          rounded-xl
          "
        >

          <h2
            className="
            text-2xl
            font-bold
            "
          >
            {analytics.totalJobs}
          </h2>

          <p className="mt-2">
            Total Jobs
          </p>

        </div>

        <div
          className="
          bg-slate-800
          p-6
          rounded-xl
          "
        >

          <h2
            className="
            text-2xl
            font-bold
            "
          >
            {
              analytics
              .totalApplications
            }
          </h2>

          <p className="mt-2">
            Applications
          </p>

        </div>

        <div
          className="
          bg-slate-800
          p-6
          rounded-xl
          "
        >

          <h2
            className="
            text-2xl
            font-bold
            text-green-400
            "
          >
            {
              analytics
              .shortlistedCount
            }
          </h2>

          <p className="mt-2">
            Shortlisted
          </p>

        </div>

        <div
          className="
          bg-slate-800
          p-6
          rounded-xl
          "
        >

          <h2
            className="
            text-2xl
            font-bold
            text-red-400
            "
          >
            {
              analytics
              .rejectedCount
            }
          </h2>

          <p className="mt-2">
            Rejected
          </p>

        </div>

      </div>

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
          Hiring Funnel
        </h2>

        <div
          className="
          h-[400px]
          "
        >

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <PieChart>

              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >

                <Cell fill="#22c55e" />

                <Cell fill="#ef4444" />

                <Cell fill="#3b82f6" />

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

      <div
        className="
        grid
        md:grid-cols-2
        gap-6
        "
      >

        {jobs.map((job) => (

          <div
            key={job.id}
            className="
            bg-slate-800
            p-6
            rounded-xl
            "
          >

            <h2
              className="
              text-2xl
              font-bold
              mb-2
              "
            >
              {job.title}
            </h2>

            <p>
              {job.description}
            </p>

            <p className="mt-2">
              📍 {job.location}
            </p>

            <p>
              💰 {job.salary}
            </p>

            <div
              className="
              flex
              flex-wrap
              gap-2
              mt-4
              "
            >

              {job.skillsRequired.map(
                (skill, index) => (

                  <span
                    key={index}
                    className="
                    bg-green-600
                    px-3
                    py-1
                    rounded-full
                    text-sm
                    "
                  >
                    {skill}
                  </span>
                )
              )}

            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() =>
                  navigate(
                    `/applicants/${job.id}`
                  )
                }
                className="
                flex-1
                bg-blue-600 hover:bg-blue-700 transition-colors
                px-5
                py-2
                rounded
                "
              >
                View Applicants
              </button>

              <button
                onClick={() => setEditingJob(job)}
                className="
                bg-slate-600 hover:bg-slate-700 transition-colors
                px-4
                py-2
                rounded
                "
              >
                Edit
              </button>

              <button
                onClick={() => deleteJob(job.id)}
                className="
                bg-red-600 hover:bg-red-700 transition-colors
                px-4
                py-2
                rounded
                "
              >
                Delete
              </button>
            </div>

          </div>
        ))}

      </div>

      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          fetchRecruiterJobs={fetchRecruiterJobs}
          fetchAnalytics={fetchAnalytics}
        />
      )}
    </div>
  );
};

export default RecruiterDashboard;
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

import CreateJobForm
from "../components/CreateJobForm";

const RecruiterDashboard = () => {

  const navigate =
    useNavigate();

  const [jobs, setJobs] =
    useState([]);

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

            <button
              onClick={() =>
                navigate(
                  `/applicants/${job.id}`
                )
              }
              className="
              bg-blue-600
              px-5
              py-2
              rounded
              mt-5
              "
            >
              View Applicants
            </button>

          </div>
        ))}

      </div>

    </div>
  );
};

export default RecruiterDashboard;
import {
  useEffect,
  useState,
  useContext,
} from "react";

import API from "../services/api";

import {
  AuthContext,
} from "../context/AuthContext";

const Jobs = () => {

  const [jobs, setJobs] =
    useState([]);

  const { user } =
    useContext(AuthContext);

  const fetchJobs = async () => {

    try {

      const res =
        await API.get("/jobs");

      setJobs(res.data);

    } catch (error) {

      console.log(error);
    }
  };

  const applyToJob =
    async (jobId) => {

      try {

        await API.post(
          "/application/apply",
          { jobId }
        );

        alert(
          "Applied successfully"
        );

      } catch (error) {

        console.log(error);

        alert(
          error.response.data.message
        );
      }
    };

  useEffect(() => {

    fetchJobs();

  }, []);

  return (

    <div className="p-10">

      <h1
        className="
        text-4xl
        font-bold
        mb-10
        "
      >
        Available Jobs
      </h1>

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

            <p className="mb-2">
              {job.description}
            </p>

            <p>
              📍 {job.location}
            </p>

            <p>
              💰 {job.salary}
            </p>

            <p>
              🕒 {job.jobType}
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
                    bg-blue-600
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

            {
              user?.role ===
              "CANDIDATE" && (

                <button
                  onClick={() =>
                    applyToJob(job.id)
                  }
                  className="
                  bg-green-600
                  px-6
                  py-3
                  rounded
                  mt-6
                  "
                >
                  Apply Now
                </button>
              )
            }

          </div>
        ))}

      </div>

    </div>
  );
};

export default Jobs;
import {
  useEffect,
  useState,
} from "react";

import API from "../services/api";

import toast from "react-hot-toast";

import ResumeUpload from "../components/ResumeUpload";

const CandidateDashboard =
() => {

  const [applications,
    setApplications] =
    useState([]);

  const fetchApplications =
    async () => {

      try {

        const res =
          await API.get(
            "/application/my-applications"
          );

        setApplications(
          res.data
        );

      } catch (error) {

        toast.error(
          "Failed to fetch applications"
        );
      }
    };

  useEffect(() => {

    applications.forEach(
      (application) => {

        if (
          application.status ===
          "SHORTLISTED" &&

          !sessionStorage.getItem(
            `shortlisted-${application.id}`
          )
        ) {

          toast.success(
            `You were shortlisted for ${application.job.title}`
          );

          sessionStorage.setItem(
            `shortlisted-${application.id}`,
            "shown"
          );
        }

        if (
          application.status ===
          "REJECTED" &&

          !sessionStorage.getItem(
            `rejected-${application.id}`
          )
        ) {

          toast.error(
            `Rejected for ${application.job.title}`
          );

          sessionStorage.setItem(
            `rejected-${application.id}`,
            "shown"
          );
        }
      }
    );

  }, [applications]);

  useEffect(() => {

    fetchApplications();

  }, []);

  return (

    <div className="p-10">

      <h1
        className="
        text-5xl
        font-bold
        mb-10
        "
      >
        Candidate Dashboard
      </h1>

      <ResumeUpload />

      <h2
        className="
        text-3xl
        font-bold
        mb-6
        "
      >
        My Applications
      </h2>

      <div
        className="
        grid
        md:grid-cols-2
        gap-6
        "
      >

        {applications.map(
          (application) => (

            <div
              key={application.id}
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
                  application.job
                  .title
                }
              </h2>

              <p className="mt-2">
                📍 {
                  application.job
                  .location
                }
              </p>

              <p>
                💰 {
                  application.job
                  .salary
                }
              </p>

              <p className="mt-4">

                Match Score:

                <span
                  className="
                  text-green-400
                  font-bold
                  "
                >
                  {" "}

                  {
                    application
                    .matchScore
                  }%

                </span>

              </p>

              <p className="mt-2">

                {
                  application
                  .aiFeedback
                }

              </p>

              <p className="mt-3">

                Status:

                <span
                  className="
                  font-bold
                  text-yellow-400
                  "
                >
                  {" "}

                  {
                    application
                    .status
                  }

                </span>

              </p>

            </div>
          )
        )}

      </div>

    </div>
  );
};

export default CandidateDashboard;
import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";

const Applicants = () => {

  const { jobId } =
    useParams();

  const [applications,
    setApplications] =
    useState([]);

  const fetchApplicants =
    async () => {

      try {

        const res =
          await API.get(
            `/jobs/${jobId}/applicants`
          );

        setApplications(
          res.data
        );

      } catch {

        toast.error(
          "Failed to fetch applicants"
        );
      }
    };

  const updateStatus =
    async (
      applicationId,
      status
    ) => {

      try {

        await API.put(
          `/application/${applicationId}/status`,
          { status }
        );

        toast.success(
          `Application ${status.toLowerCase()}`
        );

        fetchApplicants();

      } catch (error) {

        toast.error(
          error.response?.data?.message ||
          "Something went wrong"
        );
      }
    };

  useEffect(() => {

    fetchApplicants();

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
        Applicants
      </h1>

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
                  application
                  .candidate
                  .fullName
                }
              </h2>

              <p className="mt-2">
                {
                  application
                  .candidate
                  .email
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

              <div
                className="
                bg-slate-900
                p-4
                rounded-xl
                mt-5
                "
              >

                <h3
                  className="
                  text-xl
                  font-bold
                  mb-3
                  text-blue-400
                  "
                >
                  AI Evaluation
                </h3>

                <p className="mb-3">

                  <span
                    className="
                    font-bold
                    "
                  >
                    Summary:
                  </span>

                  {" "}

                  {
                    application
                    .candidate
                    .candidateProfile
                    ?.professionalSummary
                  }

                </p>

                <div className="mb-3">

                  <h4
                    className="
                    font-bold
                    text-green-400
                    mb-2
                    "
                  >
                    Strengths
                  </h4>

                  <ul
                    className="
                    list-disc
                    ml-6
                    "
                  >

                    {
                      application
                      .candidate
                      .candidateProfile
                      ?.strengths
                      ?.map(
                        (
                          strength,
                          index
                        ) => (

                          <li
                            key={index}
                          >
                            {strength}
                          </li>
                        )
                      )
                    }

                  </ul>

                </div>

                <div className="mb-3">

                  <h4
                    className="
                    font-bold
                    text-red-400
                    mb-2
                    "
                  >
                    Weaknesses
                  </h4>

                  <ul
                    className="
                    list-disc
                    ml-6
                    "
                  >

                    {
                      application
                      .candidate
                      .candidateProfile
                      ?.weaknesses
                      ?.map(
                        (
                          weakness,
                          index
                        ) => (

                          <li
                            key={index}
                          >
                            {weakness}
                          </li>
                        )
                      )
                    }

                  </ul>

                </div>

                <p
                  className="
                  mt-4
                  text-yellow-300
                  font-bold
                  "
                >

                  Recommendation:

                  {" "}

                  {
                    application
                    .candidate
                    .candidateProfile
                    ?.hiringRecommendation
                  }

                </p>

              </div>

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

              <div
                className="
                flex
                gap-3
                mt-5
                "
              >

                <button
                  onClick={() =>
                    updateStatus(
                      application.id,
                      "SHORTLISTED"
                    )
                  }
                  className="
                  bg-green-600
                  px-4
                  py-2
                  rounded
                  "
                >
                  Shortlist
                </button>

                <button
                  onClick={() =>
                    updateStatus(
                      application.id,
                      "REJECTED"
                    )
                  }
                  className="
                  bg-red-600
                  px-4
                  py-2
                  rounded
                  "
                >
                  Reject
                </button>

              </div>

              <div
                className="
                flex
                flex-wrap
                gap-2
                mt-4
                "
              >

                {
                  application
                  .candidate
                  .candidateProfile
                  ?.skills
                  ?.length > 0 ? (

                    application
                    .candidate
                    .candidateProfile
                    ?.skills
                    ?.map(
                      (
                        skill,
                        index
                      ) => (

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
                    )

                  ) : (

                    <p>
                      No resume skills found
                    </p>
                  )
                }

              </div>

              {
                application
                .candidate
                .candidateProfile
                ?.resumeUrl && (

                  <a
                    href={`http://localhost:5000/${
                      application
                      .candidate
                      .candidateProfile
                      .resumeUrl
                    }`}
                    target="_blank"
                    rel="noreferrer"
                    className="
                    inline-block
                    bg-green-600
                    px-5
                    py-2
                    rounded
                    mt-5
                    "
                  >
                    View Resume
                  </a>
                )
              }

            </div>
          )
        )}

      </div>

    </div>
  );
};

export default Applicants;
import { useState } from "react";

import { useNavigate }
from "react-router-dom";

import API from "../services/api";

const Register = () => {

  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      fullName: "",
      email: "",
      password: "",
      role: "CANDIDATE",
    });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await API.post(
        "/auth/register",
        formData
      );

      alert(
        "Registration successful"
      );

      navigate("/login");

    } catch (error) {

      alert(
        error.response.data.message
      );
    }
  };

  return (

    <div
      className="
      flex
      justify-center
      items-center
      min-h-screen
      "
    >

      <form
        onSubmit={handleSubmit}
        className="
        bg-slate-800
        p-10
        rounded-xl
        w-[400px]
        "
      >

        <h1
          className="
          text-4xl
          font-bold
          mb-6
          "
        >
          Register
        </h1>

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          onChange={handleChange}
          className="
          w-full
          p-4
          mb-4
          rounded
          bg-slate-700
          "
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="
          w-full
          p-4
          mb-4
          rounded
          bg-slate-700
          "
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="
          w-full
          p-4
          mb-4
          rounded
          bg-slate-700
          "
        />

        <select
          name="role"
          onChange={handleChange}
          className="
          w-full
          p-4
          mb-4
          rounded
          bg-slate-700
          "
        >

          <option value="CANDIDATE">
            Candidate
          </option>

          <option value="RECRUITER">
            Recruiter
          </option>

        </select>

        <button
          className="
          bg-blue-600
          w-full
          p-4
          rounded
          "
        >
          Register
        </button>

      </form>

    </div>
  );
};

export default Register;
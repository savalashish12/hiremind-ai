import { useState, useContext } from "react";

import { useNavigate } from "react-router-dom";

import API from "../services/api";

import { AuthContext }
from "../context/AuthContext";

const Login = () => {

  const navigate = useNavigate();

  const { login } =
    useContext(AuthContext);

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
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

      const res = await API.post(
        "/auth/login",
        formData
      );

      login(
        res.data.user,
        res.data.token
      );

      if (
        res.data.user.role ===
        "RECRUITER"
      ) {

        navigate(
          "/recruiter-dashboard"
        );

      } else {

        navigate(
          "/candidate-dashboard"
        );
      }

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
          Login
        </h1>

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

        <button
          className="
          bg-green-600
          w-full
          p-4
          rounded
          "
        >
          Login
        </button>

      </form>

    </div>
  );
};

export default Login;
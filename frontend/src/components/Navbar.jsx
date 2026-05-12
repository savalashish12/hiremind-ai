import { Link, useNavigate }
from "react-router-dom";

import { useContext }
from "react";

import {
  AuthContext,
} from "../context/AuthContext";

const Navbar = () => {

  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useContext(AuthContext);

  const handleLogout = () => {

    logout();

    navigate("/login");
  };

  return (

    <nav
      className="
      flex
      justify-between
      items-center
      p-6
      bg-slate-950
      "
    >

      <Link
        to="/"
        className="
        text-3xl
        font-bold
        "
      >
        HireMind AI
      </Link>

      <div className="flex gap-6">

        {!user ? (
          <>

            <Link to="/login">
              Login
            </Link>

            <Link to="/register">
              Register
            </Link>

          </>
        ) : (
          <>

            {user.role ===
            "RECRUITER" ? (

              <Link
                to="/recruiter-dashboard"
              >
                Dashboard
              </Link>

            ) : (

              <Link
                to="/candidate-dashboard"
              >
                Dashboard
              </Link>
            )}

            <button
              onClick={handleLogout}
            >
              Logout
            </button>

          </>
        )}

      </div>

    </nav>
  );
};

export default Navbar;
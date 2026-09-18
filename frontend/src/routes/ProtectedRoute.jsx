import { Navigate, useLocation }
from "react-router-dom";

import { useContext }
from "react";

import {
  AuthContext,
} from "../context/AuthContext";

const ProtectedRoute = ({
  children,
  role,
}) => {

  const { user } =
    useContext(AuthContext);
  const location = useLocation();

  if (!user) {

    return (
      <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />
    );
  }

  if (
    role &&
    user.role !== role
  ) {

    return (
      <Navigate to="/" replace />
    );
  }

  return children;
};

export default ProtectedRoute;
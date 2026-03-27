import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../providers/AuthProvider";

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!user) {
    let redirectPath = "/login";

    if (role === "doctor") redirectPath = "/login";
    else if (role === "admin") redirectPath = "/admin";

    return (
      <Navigate
        to={redirectPath}
        state={{ from: location }}
        replace
      />
    );
  }

  // Logged in but wrong role
//   if (role && user.role !== role) {
//     return <Navigate to="/unauthorized" replace />;
//   }

  return children;
};

export default PrivateRoute;

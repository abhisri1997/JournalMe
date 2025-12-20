import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getToken } from "../auth";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactElement;
}) {
  const token = getToken();
  const location = useLocation();
  if (!token) {
    return <Navigate to='/login' replace state={{ from: location }} />;
  }
  return children;
}

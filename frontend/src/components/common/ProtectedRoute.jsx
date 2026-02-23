
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * ProtectedRoute - Protects routes from unauthorized access
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authorized
 * @param {boolean} props.requireAdmin - If true, only admin users can access
 * @param {string} props.redirectTo - Where to redirect if unauthorized
 */
export default function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  redirectTo = "/admin/login" 
}) {
  const { user, isAuthed, isAdmin } = useAuth();
  const location = useLocation();

  // Not logged in at all
  if (!isAuthed) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Logged in but not admin (when admin required)
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

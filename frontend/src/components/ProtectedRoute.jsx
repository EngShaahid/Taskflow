import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // While checking localStorage, render nothing.
  // Skipping this would briefly redirect a logged-in user to /login on refresh.
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  // "replace" swaps the history entry instead of adding one,
  // so the browser back button does not return to the blocked page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
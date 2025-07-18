import { useUser,useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return null; // 로딩 중

  return isSignedIn ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Spin, message } from "antd";

const ProtectedRoute = ({ children, requiredRole = "reader" }) => {
  const { isAuthenticated, token, user, userRole, isInitialized, isLoading } = useSelector(
    (state) => state.auth
  );
  const location = useLocation();

  // Show loading while auth is being initialized
  if (!isInitialized || isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !token || userRole === "invalid") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permissions
  const hasRequiredRole = () => {
    switch (requiredRole) {
      case "admin":
        return userRole === "admin";
      case "author":
        return userRole === "admin" || userRole === "author";
      case "reader":
        return (
          userRole === "admin" || userRole === "author" || userRole === "reader"
        );
      default:
        return true;
    }
  };

  if (!hasRequiredRole()) {
    message.warning(`Access denied. ${requiredRole} role required.`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

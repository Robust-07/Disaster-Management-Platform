import { Navigate } from "react-router-dom";
import CitizenDashboard from "./CitizenDashboard";
import AuthorityDashboard from "./authority/AuthorityDashboard";

function Dashboard() {
  const role = localStorage.getItem("role");

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (role === "authority") {
    return <AuthorityDashboard />;
  }

  return <CitizenDashboard />;
}

export default Dashboard;
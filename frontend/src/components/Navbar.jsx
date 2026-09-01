import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Navbar.css";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
  }, []);

  const role = user?.role || "citizen";
  const displayName = user?.name || "User";
  const initial = displayName.charAt(0).toUpperCase();

  // Human-readable label for the account type shown under the name
  const roleLabel = {
    citizen: "Citizen Account",
    authority: "Authority Account",
    rescuer: "Rescuer Account",
    ngo: "NGO Account",
    volunteer: "Volunteer Account",
  }[role] || "Account";

  return (
    <nav className="dashboard-navbar">

      <div className="navbar-brand">
        <div className="navbar-logo">R</div>

        <div>
          <h2>ResQ</h2>
          <span>Disaster Management Platform</span>
        </div>
      </div>

      <div className="navbar-actions">

        {/* FIX: only authority/rescuer see this link — no more manual URL typing */}
        {(role === "authority" || role === "rescuer") && (
          <Link to="/authority" className="navbar-link">
            Authority Dashboard
          </Link>
        )}

        <button className="navbar-icon-btn">
          🔔
          <span className="notification-dot"></span>
        </button>

        <div className="navbar-profile">
          <div className="profile-avatar">
            {initial}
          </div>

          <div className="profile-text">
            {/* FIX: was hardcoded to "Citizen" for every user */}
            <strong>{displayName}</strong>
            <span>{roleLabel}</span>
          </div>
        </div>

        <button
            className="navbar-logout"
            onClick={() => {
                localStorage.clear();
                toast.success("Logged out successfully");
                navigate("/login");
            }}
        >
            Logout
        </button>

      </div>

    </nav>
  );
};

export default Navbar;
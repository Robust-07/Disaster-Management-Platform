import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();

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

        <button className="navbar-icon-btn">
          🔔
          <span className="notification-dot"></span>
        </button>

        <div className="navbar-profile">
          <div className="profile-avatar">
            C
          </div>

          <div className="profile-text">
            <strong>Citizen</strong>
            <span>Citizen Account</span>
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
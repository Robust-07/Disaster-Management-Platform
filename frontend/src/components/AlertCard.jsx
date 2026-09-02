import React from "react";
import "./AlertCard.css";

const AlertCard = ({
  count = 0,
  title = "Active Alerts",
  subtitle = "Near your location",
}) => {
  return (
    <div className="alert-card warning">

      <div className="alert-card-icon">
        ⚠️
      </div>

      <div className="alert-card-content">

        <div className="alert-card-header">
          <h3>{title}</h3>

          <span>Recently</span>
        </div>

        <p className="alert-count">
          {count}
        </p>

        <p>
          {count === 0
            ? `No ${subtitle.toLowerCase()}`
            : `${count} ${count === 1 ? "alert" : "alerts"} ${subtitle.toLowerCase()}`
          }
        </p>

      </div>

    </div>
  );
};

export default AlertCard;
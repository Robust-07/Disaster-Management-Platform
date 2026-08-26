import React from "react";
import "./QuickActionCard.css";

const QuickActionCard = ({
  icon,
  title,
  description,
  onClick,
}) => {

  return (
    <button
      className="quick-action-card"
      onClick={onClick}
    >

      <div className="quick-action-icon">
        {icon}
      </div>

      <div className="quick-action-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <span className="quick-action-arrow">
        →
      </span>

    </button>
  );
};

export default QuickActionCard;
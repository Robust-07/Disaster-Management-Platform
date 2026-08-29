import React from "react";
import "./RiskCard.css";

const RiskCard = ({
    riskLevel = "Loading...",
    riskScore = 0,
}) => {

    // Normalize value only for CSS comparison
    const normalizedRisk = String(riskLevel).toLowerCase();

    const getRiskClass = () => {

        if (
            normalizedRisk === "high" ||
            normalizedRisk === "critical"
        ) {
            return "high";
        }

        if (
            normalizedRisk === "medium" ||
            normalizedRisk === "moderate" ||
            normalizedRisk === "warning"
        ) {
            return "medium";
        }

        return "low";
    };

    // Make sure score stays between 0 and 100
    const safeRiskScore = Math.min(
        100,
        Math.max(
            0,
            Number(riskScore) || 0
        )
    );

    // Display risk level nicely
    const displayRiskLevel =
        String(riskLevel)
            .toUpperCase();

    return (
        <div
            className={`risk-card ${getRiskClass()}`}
        >

            {/* Header */}
            <div className="risk-header">

                <div>

                    <span className="risk-label">
                        Current Risk Level
                    </span>

                    <h2>
                        {displayRiskLevel}
                    </h2>

                </div>

                <div className="risk-icon">
                    🛡️
                </div>

            </div>


            {/* Risk meter */}
            <div className="risk-meter">

                <div
                    className="risk-meter-fill"
                    style={{
                        width: `${safeRiskScore}%`,
                    }}
                />

            </div>


            {/* Score */}
            <div className="risk-footer">

                <span>
                    Risk Score
                </span>

                <strong>
                    {safeRiskScore}/100
                </strong>

            </div>


            {/* Description */}
            <p>
                Based on current disaster and environmental
                conditions in your area.
            </p>

        </div>
    );
};

export default RiskCard;
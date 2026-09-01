import React from "react";
import "./RiskCard.css";

const RiskCard = ({
    riskLevel = "LOW",
    riskScore = 0
}) => {

    const normalizedRisk =
        String(riskLevel).toUpperCase();

    const getRiskClass = () => {

        if (
            normalizedRisk === "HIGH" ||
            normalizedRisk === "CRITICAL"
        ) {
            return "high";
        }

        if (
            normalizedRisk === "MEDIUM" ||
            normalizedRisk === "MODERATE" ||
            normalizedRisk === "WARNING"
        ) {
            return "medium";
        }

        return "low";
    };

    const score = Math.min(
        100,
        Math.max(
            0,
            Number(riskScore) || 0
        )
    );

    return (
        <div
            className={`risk-card ${getRiskClass()}`}
        >

            <div className="risk-header">

                <div>

                    <span className="risk-label">
                        Current Risk Level
                    </span>

                    <h2>
                        {normalizedRisk}
                    </h2>

                </div>

                <div className="risk-icon">
                    🛡️
                </div>

            </div>

            <div className="risk-meter">

                <div
                    className="risk-meter-fill"
                    style={{
                        width: `${score}%`
                    }}
                />

            </div>

            <div className="risk-footer">

                <span>
                    Risk Score
                </span>

                <strong>
                    {score}/100
                </strong>

            </div>

            <p>
                Based on current disaster and
                environmental conditions in your area.
            </p>

        </div>
    );
};

export default RiskCard;
import React from "react";
import "./DisasterAlert.css";

const DisasterAlert = ({ alert }) => {

    if (!alert) return null;

    const severity = String(
        alert.severity ||
        alert.riskLevel ||
        "low"
    ).toLowerCase();

    const displaySeverity =
        severity.charAt(0).toUpperCase() +
        severity.slice(1);

    const disasterType =
        alert.disasterType ||
        "disaster";

    const disasterName =
        String(disasterType)
            .charAt(0)
            .toUpperCase() +
        String(disasterType).slice(1);

    const areaName =
        alert.areaName ||
        "Your Area";

    const description =
        alert.description ||
        "A disaster risk has been reported near your location.";

    const distance =
        alert.distanceKm ??
        alert.distance ??
        null;

    const getIcon = () => {

        switch (disasterType.toLowerCase()) {

            case "flood":
                return "🌊";

            case "cyclone":
                return "🌀";

            case "earthquake":
                return "🌍";

            case "landslide":
                return "⛰️";

            case "wildfire":
                return "🔥";

            case "storm":
                return "⛈️";

            default:
                return "⚠️";
        }
    };


    return (

        <div className="disaster-alert">

            <div className="disaster-alert-icon">

                {getIcon()}

            </div>


            <div className="disaster-alert-content">

                <div className="disaster-alert-title">

                    <h3>
                        {disasterName} Alert
                    </h3>

                    <span
                        className={`severity ${severity}`}
                    >
                        {displaySeverity}
                    </span>

                </div>


                <div
                    style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        marginTop: "3px",
                        fontWeight: "600"
                    }}
                >
                    {areaName}
                </div>


                <p className="alert-description">

                    {description}

                </p>


                <p>

                    📍

                    {distance !== null
                        ? `${distance} km away`
                        : "Near your location"
                    }

                </p>

            </div>

        </div>

    );

};

export default DisasterAlert;
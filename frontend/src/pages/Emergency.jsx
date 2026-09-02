import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Emergency.css";
import { io as socketIO } from "socket.io-client";

function Emergency() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const sosReport = state?.sosReport;
    const location = state?.location;

    // FIX: track status separately so socket updates can change what's rendered
    const [liveStatus, setLiveStatus] = useState(sosReport?.status);

    useEffect(() => {
        if (!sosReport) {
            navigate("/sos-form", { replace: true });
            return; // FIX: stop here — don't try to open a socket with no report
        }

        const socket = socketIO(import.meta.env.VITE_API_URL || "http://localhost:5000");

        socket.on("connect", () => {
            console.log("Citizen connected to socket:", socket.id);
        });

        socket.on("status-update", (update) => {
            if (update.sosId === sosReport._id) {
                console.log("Status updated:", update.status);
                setLiveStatus(update.status); // FIX: actually update what's shown
            }
        });

        return () => socket.disconnect();
    }, [sosReport, navigate]);

    if (!sosReport) return null;

    const handleCancel = async () => {
        try {
            await api.delete(`/api/sos/${sosReport._id}`);
        } catch (error) {
            console.error("Cancel SOS error:", error.response?.data || error.message);
        }
        navigate("/dashboard", { replace: true });
    };

    const handleCall = () => {
        window.location.href = "tel:112";
    };

    const handleShareLocation = () => {
        if (!location) {
            alert("Location is not available.");
            return;
        }
        const locationText = `My current location:\nLatitude: ${location.latitude}\nLongitude: ${location.longitude}`;
        if (navigator.share) {
            navigator.share({ title: "My Emergency Location", text: locationText });
        } else {
            navigator.clipboard.writeText(locationText);
            alert("Location copied to clipboard.");
        }
    };

    return (
        <div className="emergency-page">
            <header className="emergency-header">
                <div>
                    <h1>ResQ</h1>
                    <p>Emergency Assistance</p>
                </div>
                <button className="back-dashboard-btn" onClick={() => navigate("/dashboard")}>
                    ← Dashboard
                </button>
            </header>

            <main className="emergency-container">
                <section className="emergency-status-card">
                    <div className="status-icon">🚨</div>
                    <h2>Emergency Assistance</h2>
                    <div className="status-badge">
                        <span className="status-dot"></span>
                        {/* FIX: use liveStatus instead of the frozen sosReport.status */}
                        {liveStatus === "pending" ? "Request received" : liveStatus}
                    </div>
                    <p className="emergency-description">
                        <h3>Severity: <strong>{sosReport.severityLabel}</strong></h3> — Rescue assistance
                        will be coordinated using your current location.
                    </p>
                </section>

                <section className="emergency-card">
                    <div className="card-heading">
                        <span>📍</span>
                        <h3>Your Location</h3>
                    </div>

                    {location ? (
                        <div className="location-details">
                            <div className="location-item">
                                <span>Latitude</span>
                                <strong>{location.latitude.toFixed(6)}</strong>
                            </div>
                            <div className="location-item">
                                <span>Longitude</span>
                                <strong>{location.longitude.toFixed(6)}</strong>
                            </div>
                            <div className="location-item">
                                <span>Accuracy</span>
                                <strong>{location.accuracy} m</strong>
                            </div>
                        </div>
                    ) : (
                        <p>Location not available.</p>
                    )}
                </section>

                <section className="emergency-card">
                    <div className="card-heading">
                        <span>🛟</span>
                        <h3>Rescue Status</h3>
                    </div>

                    <div className="rescue-timeline">
                        <div className="timeline-step completed">
                            <div className="timeline-circle">✓</div>
                            <div>
                                <strong>SOS Sent</strong>
                                <p>Your emergency request has been created.</p>
                            </div>
                        </div>
                        <div className="timeline-line"></div>
                        <div className="timeline-step completed">
                            <div className="timeline-circle">✓</div>
                            <div>
                                <strong>Request Received</strong>
                                <p>Emergency services have received your request.</p>
                            </div>
                        </div>
                        <div className="timeline-line"></div>
                        {/* FIX: all status-driven steps now use liveStatus */}
                        <div className={`timeline-step ${liveStatus !== "pending" ? "completed" : "active"}`}>
                            <div className="timeline-circle">3</div>
                            <div>
                                <strong>Rescue Team Assignment</strong>
                                <p>Finding the nearest available rescue team.</p>
                            </div>
                        </div>
                        <div className="timeline-line"></div>
                        <div className={`timeline-step ${liveStatus === "in-progress" || liveStatus === "resolved" ? "completed" : liveStatus === "assigned" ? "active" : ""}`}>
                            <div className="timeline-circle">4</div>
                            <div>
                                <strong>Team On The Way</strong>
                                <p>Rescue team will be dispatched.</p>
                            </div>
                        </div>
                        <div className="timeline-line"></div>
                        <div className={`timeline-step ${liveStatus === "resolved" ? "completed" : liveStatus === "in-progress" ? "active" : ""}`}>
                            <div className="timeline-circle">5</div>
                            <div>
                                <strong>Help Arrived</strong>
                                <p>Emergency assistance has reached you.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="emergency-actions">
                    <button className="call-btn" onClick={handleCall}>
                        📞 Call Emergency Services
                    </button>
                    <button className="share-btn" onClick={handleShareLocation}>
                        📍 Share My Location
                    </button>
                    <button className="cancel-btn" onClick={handleCancel}>
                        Cancel SOS
                    </button>
                </section>
            </main>
        </div>
    );
}

export default Emergency;
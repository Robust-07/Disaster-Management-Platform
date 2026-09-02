import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./AuthorityDashboard.css";
import { io as socketIO } from "socket.io-client";
import Navbar from "../components/Navbar";

function AuthorityDashboard() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [assigningId, setAssigningId] = useState(null);
    const [teamIdInput, setTeamIdInput] = useState("");
    const [actionError, setActionError] = useState("");
    const [availableTeams, setAvailableTeams] = useState([]);

    const navigate = useNavigate();

    // FIX: fetchReports and fetchAvailableTeams are now defined at component scope,
    // not nested inside a useEffect — so they can be called from the refresh button too
    const fetchReports = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await api.get("/api/sos");
            setReports(response.data.reports || []);
        } catch (err) {
            console.error("Fetch SOS reports error:", err.response?.data || err.message);
            setError(
                err.response?.data?.message ||
                "Failed to load SOS reports. Are you logged in as an authority?"
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableTeams = async () => {
        try {
            const response = await api.get("/api/rescue-teams");
            const teams = response.data.teams || [];
            setAvailableTeams(teams.filter(t => t.currentStatus === "AVAILABLE"));
        } catch (err) {
            console.error("Fetch rescue teams error:", err.response?.data || err.message);
        }
    };

    // FIX: role guard is its own separate effect
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user || (user.role !== "authority" && user.role !== "rescuer")) {
            navigate("/dashboard");
        }
    }, [navigate]);

    // FIX: data fetching + socket setup is its own separate effect
    useEffect(() => {
        fetchReports();
        fetchAvailableTeams();

        const socket = socketIO(import.meta.env.VITE_API_URL || "http://localhost:5000");

        socket.on("connect", () => {
            console.log("Authority dashboard connected to socket:", socket.id);
        });

        socket.on("new-sos", (newReport) => {
            setReports((prev) => [newReport, ...prev]);
        });

        socket.on("status-update", ({ sosId, status }) => {
            setReports((prev) =>
                prev.map((r) => (r._id === sosId ? { ...r, status } : r))
            );
            fetchAvailableTeams();
        });

        socket.on("team-assigned", ({ sosId, teamId }) => {
            setReports((prev) =>
                prev.map((r) => (r._id === sosId ? { ...r, assignedTeamId: teamId } : r))
            );
            fetchAvailableTeams();
        });

        return () => socket.disconnect();
    }, []);

    const handleAssign = async (sosId) => {
        if (!teamIdInput.trim()) {
            setActionError("Enter a rescue team ID.");
            return;
        }

        try {
            setActionError("");
            await api.post(`/api/sos/${sosId}/assign`, { teamId: teamIdInput.trim() });
            setAssigningId(null);
            setTeamIdInput("");
            fetchReports();
        } catch (err) {
            console.error("Assign team error:", err.response?.data || err.message);
            setActionError(err.response?.data?.message || "Failed to assign team.");
        }
    };

    const handleStatusChange = async (sosId, status) => {
        try {
            await api.patch(`/api/sos/${sosId}/status`, { status });
            fetchReports();
        } catch (err) {
            console.error("Status update error:", err.response?.data || err.message);
        }
    };

    const severityColor = (label) => {
        switch (label) {
            case "CRITICAL": return "#e63946";
            case "HIGH": return "#f4784b";
            case "MEDIUM": return "#f1b13c";
            default: return "#4caf82";
        }
    };

    if (loading) return <div className="authority-page"><p>Loading SOS reports...</p></div>;

    return (
        <div className="authority-page">
            <Navbar />
            <header className="authority-header">
                <div>
                    <h1>ResQ — Authority Dashboard</h1>
                    <p>Live emergency reports</p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button className="refresh-btn" onClick={() => navigate("/create-rescue-team")}>
                        + New Team
                    </button>
                    <button className="refresh-btn" onClick={() => navigate("/create-resource")}>
                        + List Resource
                    </button>
                    <button className="refresh-btn" onClick={() => navigate("/resource-requests")}>
                        📦      Resource Requests
                    </button>
                    <button
                        className="refresh-btn"
                        onClick={() => navigate("/create-risk-zone")}
                    >
                        🚨 Create Risk Zone
                    </button>
                    <button className="refresh-btn" onClick={fetchReports}>⟳ Refresh</button>
                </div>
            </header>

            {error && <p className="authority-error">⚠️ {error}</p>}

            <main className="authority-list">
                {reports.length === 0 && !error && <p>No SOS reports yet.</p>}

                {reports.map((report) => (
                    <div className="sos-report-card" key={report._id}>
                        <div className="sos-report-top">
                            <span
                                className="severity-badge"
                                style={{ background: severityColor(report.severityLabel) }}
                            >
                                {report.severityLabel} · {report.severityScore}
                            </span>
                            <span className={`status-pill status-${report.status}`}>
                                {report.status}
                            </span>
                        </div>

                        <p className="sos-description">{report.description}</p>

                        <div className="sos-meta-grid">
                            <div><span>People trapped</span><strong>{report.peopleCount}</strong></div>
                            <div><span>Reporter</span><strong>{report.reporterId?.name || "Unknown"}</strong></div>
                            <div><span>Category</span><strong>{report.category}</strong></div>
                            <div>
                                <span>Location</span>
                                <strong>
                                    {report.location?.coordinates?.[1]?.toFixed(4)}, {report.location?.coordinates?.[0]?.toFixed(4)}
                                </strong>
                            </div>
                        </div>

                        {report.photoUrl && (
                            <img src={report.photoUrl} alt="SOS evidence" className="sos-photo" />
                        )}

                        <div className="sos-actions">
                            {report.status === "pending" && assigningId !== report._id && (
                                <button className="assign-btn" onClick={() => setAssigningId(report._id)}>
                                    Assign Rescue Team
                                </button>
                            )}

                            {assigningId === report._id && (
                                <div className="assign-form">
                                    <select
                                        value={teamIdInput}
                                        onChange={(e) => setTeamIdInput(e.target.value)}
                                    >
                                        <option value="">Select a rescue team</option>
                                        {availableTeams.map((team) => (
                                            <option key={team._id} value={team._id}>
                                                {team.name} — {team.teamType} ({team.members} members)
                                            </option>
                                        ))}
                                    </select>
                                    <button onClick={() => handleAssign(report._id)}>Confirm</button>
                                    <button
                                        className="cancel-assign"
                                        onClick={() => { setAssigningId(null); setActionError(""); }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}

                            {report.status === "assigned" && (
                                <button
                                    className="progress-btn"
                                    onClick={() => handleStatusChange(report._id, "in-progress")}
                                >
                                    Mark In Progress
                                </button>
                            )}

                            {report.status === "in-progress" && (
                                <button
                                    className="resolve-btn"
                                    onClick={() => handleStatusChange(report._id, "resolved")}
                                >
                                    Mark Resolved
                                </button>
                            )}
                        </div>

                        {actionError && assigningId === report._id && (
                            <p className="authority-error">{actionError}</p>
                        )}
                    </div>
                ))}
            </main>
        </div>
    );
}

export default AuthorityDashboard;
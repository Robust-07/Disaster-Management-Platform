import { useEffect, useMemo, useState } from "react";
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

    // ======================================================
    // SIH 191 DEMONSTRATION DATA
    // These will later come from your backend / ML service.
    // ======================================================

    const hazardZones = [
        {
            id: "HZ-01",
            name: "Flood-Prone Zone",
            hazard: "Flood",
            riskLevel: "Critical",
            riskScore: 91,
            affectedPopulation: 1840
        },
        {
            id: "HZ-02",
            name: "Landslide Risk Zone",
            hazard: "Landslide",
            riskLevel: "High",
            riskScore: 82,
            affectedPopulation: 920
        },
        {
            id: "HZ-03",
            name: "Multi-Hazard Zone",
            hazard: "Flood + Landslide",
            riskLevel: "High",
            riskScore: 78,
            affectedPopulation: 1360
        }
    ];

    const vulnerableHabitations = [
        {
            id: "VH-01",
            name: "Habitation A",
            population: 860,
            riskScore: 92,
            priority: "Immediate"
        },
        {
            id: "VH-02",
            name: "Habitation B",
            population: 540,
            riskScore: 84,
            priority: "Immediate"
        },
        {
            id: "VH-03",
            name: "Habitation C",
            population: 720,
            riskScore: 73,
            priority: "Short-term"
        },
        {
            id: "VH-04",
            name: "Habitation D",
            population: 430,
            riskScore: 61,
            priority: "Medium-term"
        }
    ];

    const relocationSites = [
        {
            id: "RS-01",
            name: "Safe Site Alpha",
            capacity: 1500,
            occupied: 620,
            safetyScore: 94,
            status: "Available"
        },
        {
            id: "RS-02",
            name: "Safe Site Beta",
            capacity: 1000,
            occupied: 710,
            safetyScore: 88,
            status: "Available"
        },
        {
            id: "RS-03",
            name: "Safe Site Gamma",
            capacity: 800,
            occupied: 780,
            safetyScore: 82,
            status: "Near Capacity"
        }
    ];

    // ======================================================
    // FETCH SOS REPORTS
    // ======================================================

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/api/sos");

            setReports(
                response.data.reports || []
            );
        } catch (err) {
            console.error(
                "Fetch SOS reports error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Failed to load SOS reports. Are you logged in as an authority?"
            );
        } finally {
            setLoading(false);
        }
    };

    // ======================================================
    // FETCH AVAILABLE RESCUE TEAMS
    // ======================================================

    const fetchAvailableTeams = async () => {
        try {
            const response =
                await api.get("/api/rescue-teams");

            const teams =
                response.data.teams || [];

            setAvailableTeams(
                teams.filter(
                    (team) =>
                        team.currentStatus ===
                        "AVAILABLE"
                )
            );
        } catch (err) {
            console.error(
                "Fetch rescue teams error:",
                err.response?.data ||
                err.message
            );
        }
    };

    // ======================================================
    // ROLE GUARD
    // ======================================================

    useEffect(() => {
        const user = JSON.parse(
            localStorage.getItem("user") ||
            "null"
        );

        if (
            !user ||
            (
                user.role !== "authority" &&
                user.role !== "rescuer"
            )
        ) {
            navigate("/dashboard");
        }
    }, [navigate]);

    // ======================================================
    // INITIAL DATA + SOCKET
    // ======================================================

    useEffect(() => {
        fetchReports();
        fetchAvailableTeams();

        const socket = socketIO(
            import.meta.env.VITE_API_URL ||
            "http://localhost:5000"
        );

        socket.on("connect", () => {
            console.log(
                "Authority dashboard connected:",
                socket.id
            );
        });

        socket.on("new-sos", (newReport) => {
            setReports((prev) => [
                newReport,
                ...prev
            ]);
        });

        socket.on(
            "status-update",
            ({ sosId, status }) => {
                setReports((prev) =>
                    prev.map((report) =>
                        report._id === sosId
                            ? {
                                ...report,
                                status
                            }
                            : report
                    )
                );

                fetchAvailableTeams();
            }
        );

        socket.on(
            "team-assigned",
            ({ sosId, teamId }) => {
                setReports((prev) =>
                    prev.map((report) =>
                        report._id === sosId
                            ? {
                                ...report,
                                assignedTeamId:
                                    teamId
                            }
                            : report
                    )
                );

                fetchAvailableTeams();
            }
        );

        return () => {
            socket.disconnect();
        };
    }, []);

    // ======================================================
    // ASSIGN RESCUE TEAM
    // ======================================================

    const handleAssign = async (sosId) => {
        if (!teamIdInput.trim()) {
            setActionError(
                "Select a rescue team."
            );
            return;
        }

        try {
            setActionError("");

            await api.post(
                `/api/sos/${sosId}/assign`,
                {
                    teamId:
                        teamIdInput.trim()
                }
            );

            setAssigningId(null);
            setTeamIdInput("");

            fetchReports();
            fetchAvailableTeams();

        } catch (err) {
            console.error(
                "Assign team error:",
                err.response?.data ||
                err.message
            );

            setActionError(
                err.response?.data?.message ||
                "Failed to assign team."
            );
        }
    };

    // ======================================================
    // STATUS CHANGE
    // ======================================================

    const handleStatusChange = async (
        sosId,
        status
    ) => {
        try {
            await api.patch(
                `/api/sos/${sosId}/status`,
                { status }
            );

            fetchReports();

        } catch (err) {
            console.error(
                "Status update error:",
                err.response?.data ||
                err.message
            );
        }
    };

    // ======================================================
    // SEVERITY COLOR
    // ======================================================

    const severityColor = (label) => {
        switch (label) {
            case "CRITICAL":
                return "#dc2626";

            case "HIGH":
                return "#f97316";

            case "MEDIUM":
                return "#f59e0b";

            default:
                return "#16a34a";
        }
    };

    // ======================================================
    // DASHBOARD STATISTICS
    // ======================================================

    const statistics = useMemo(() => {

        const criticalReports =
            reports.filter(
                (report) =>
                    report.severityLabel ===
                    "CRITICAL"
            ).length;

        const activeReports =
            reports.filter(
                (report) =>
                    report.status !==
                    "resolved"
            ).length;

        const peopleAffected =
            reports.reduce(
                (total, report) =>
                    total +
                    Number(
                        report.peopleCount || 0
                    ),
                0
            );

        const immediateRelocations =
            vulnerableHabitations.filter(
                (item) =>
                    item.priority ===
                    "Immediate"
            ).length;

        const totalCapacity =
            relocationSites.reduce(
                (total, site) =>
                    total +
                    site.capacity,
                0
            );

        const usedCapacity =
            relocationSites.reduce(
                (total, site) =>
                    total +
                    site.occupied,
                0
            );

        return {
            criticalReports,
            activeReports,
            peopleAffected,
            immediateRelocations,
            totalCapacity,
            usedCapacity
        };

    }, [reports]);

    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {
        return (
            <div className="authority-page">
                <Navbar />

                <div className="authority-loading">
                    <div className="loading-spinner"></div>

                    <p>
                        Loading authority
                        dashboard...
                    </p>
                </div>
            </div>
        );
    }

    // ======================================================
    // MAIN DASHBOARD
    // ======================================================

    return (
        <div className="authority-page">

            <Navbar />

            {/* ==================================================
                HEADER
            ================================================== */}

            <header className="authority-header">

                <div>
                    <p className="dashboard-label">
                        RESQ INTELLIGENCE PLATFORM
                    </p>

                    <h1>
                        Authority Decision Dashboard
                    </h1>

                    <p>
                        Monitor hazards, vulnerable
                        habitations and relocation
                        requirements in real time.
                    </p>
                </div>

                <button
                    className="refresh-btn"
                    onClick={() => {
                        fetchReports();
                        fetchAvailableTeams();
                    }}
                >
                    ⟳ Refresh Data
                </button>

            </header>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
                <p className="authority-error">
                    ⚠️ {error}
                </p>
            )}

            <main className="authority-content">

                {/* ==================================================
                    KPI CARDS
                ================================================== */}

                <section className="stats-grid">

                    <div className="stat-card critical-card">

                        <span className="stat-icon">
                            🔴
                        </span>

                        <div>
                            <p>
                                Critical SOS
                            </p>

                            <strong>
                                {
                                    statistics
                                        .criticalReports
                                }
                            </strong>
                        </div>

                    </div>

                    <div className="stat-card">

                        <span className="stat-icon">
                            🚨
                        </span>

                        <div>
                            <p>
                                Active Emergencies
                            </p>

                            <strong>
                                {
                                    statistics
                                        .activeReports
                                }
                            </strong>
                        </div>

                    </div>

                    <div className="stat-card">

                        <span className="stat-icon">
                            🏘️
                        </span>

                        <div>
                            <p>
                                People Affected
                            </p>

                            <strong>
                                {
                                    statistics
                                        .peopleAffected
                                }
                            </strong>
                        </div>

                    </div>

                    <div className="stat-card priority-card">

                        <span className="stat-icon">
                            🚚
                        </span>

                        <div>
                            <p>
                                Immediate Relocation
                            </p>

                            <strong>
                                {
                                    statistics
                                        .immediateRelocations
                                }
                            </strong>
                        </div>

                    </div>

                </section>

                {/* ==================================================
                    RISK INTELLIGENCE
                ================================================== */}

                <section className="dashboard-section">

                    <div className="section-heading-row">

                        <div>
                            <p className="section-label">
                                RISK INTELLIGENCE
                            </p>

                            <h2>
                                Hazard Zone Overview
                            </h2>

                            <p>
                                Identified areas with
                                elevated or critical
                                hazard exposure.
                            </p>
                        </div>

                        <span className="live-badge">
                            ● LIVE MONITORING
                        </span>

                    </div>

                    <div className="hazard-grid">

                        {hazardZones.map(
                            (zone) => (
                                <div
                                    className="hazard-card"
                                    key={zone.id}
                                >

                                    <div className="hazard-card-top">

                                        <span className="hazard-symbol">
                                            🔴
                                        </span>

                                        <span
                                            className={`risk-badge risk-${zone.riskLevel.toLowerCase()}`}
                                        >
                                            {
                                                zone.riskLevel
                                            }
                                        </span>

                                    </div>

                                    <h3>
                                        {zone.name}
                                    </h3>

                                    <p className="hazard-type">
                                        {zone.hazard}
                                    </p>

                                    <div className="risk-score">

                                        <span>
                                            Risk Score
                                        </span>

                                        <strong>
                                            {
                                                zone.riskScore
                                            }
                                            /100
                                        </strong>

                                    </div>

                                    <div className="risk-progress">

                                        <div
                                            style={{
                                                width:
                                                    `${zone.riskScore}%`
                                            }}
                                        ></div>

                                    </div>

                                    <p className="affected-text">
                                        👥{" "}
                                        {
                                            zone.affectedPopulation
                                        }{" "}
                                        people potentially
                                        affected
                                    </p>

                                </div>
                            )
                        )}

                    </div>

                </section>

                {/* ==================================================
                    VULNERABLE HABITATIONS
                ================================================== */}

                <section className="dashboard-section">

                    <div className="section-heading-row">

                        <div>
                            <p className="section-label">
                                VULNERABILITY ASSESSMENT
                            </p>

                            <h2>
                                Priority Habitations
                            </h2>

                            <p>
                                Communities requiring
                                relocation based on
                                current risk levels.
                            </p>
                        </div>

                    </div>

                    <div className="habitation-table">

                        <div className="table-header">
                            <span>Habitation</span>
                            <span>Population</span>
                            <span>Risk Score</span>
                            <span>Priority</span>
                        </div>

                        {vulnerableHabitations.map(
                            (habitation) => (
                                <div
                                    className="table-row"
                                    key={habitation.id}
                                >

                                    <strong>
                                        🏘️{" "}
                                        {
                                            habitation.name
                                        }
                                    </strong>

                                    <span>
                                        {
                                            habitation.population
                                        }
                                    </span>

                                    <span
                                        className={
                                            habitation.riskScore >= 85
                                                ? "score-critical"
                                                : habitation.riskScore >= 70
                                                    ? "score-high"
                                                    : "score-medium"
                                        }
                                    >
                                        {
                                            habitation.riskScore
                                        }/100
                                    </span>

                                    <span
                                        className={`priority-badge ${habitation.priority.toLowerCase().replace("-", "")}`}
                                    >
                                        {
                                            habitation.priority
                                        }
                                    </span>

                                </div>
                            )
                        )}

                    </div>

                </section>

                {/* ==================================================
                    RELOCATION CAPACITY
                ================================================== */}

                <section className="dashboard-section">

                    <div className="section-heading-row">

                        <div>
                            <p className="section-label">
                                RELOCATION PLANNING
                            </p>

                            <h2>
                                Safer Alternative Sites
                            </h2>

                            <p>
                                Current carrying capacity
                                of identified relocation
                                sites.
                            </p>
                        </div>

                    </div>

                    <div className="relocation-grid">

                        {relocationSites.map(
                            (site) => {

                                const available =
                                    site.capacity -
                                    site.occupied;

                                const occupancy =
                                    Math.round(
                                        (
                                            site.occupied /
                                            site.capacity
                                        ) * 100
                                    );

                                return (
                                    <div
                                        className="relocation-card"
                                        key={site.id}
                                    >

                                        <div className="relocation-top">

                                            <div>

                                                <span className="safe-icon">
                                                    🟢
                                                </span>

                                                <h3>
                                                    {site.name}
                                                </h3>

                                            </div>

                                            <span
                                                className={
                                                    site.status ===
                                                    "Available"
                                                        ? "site-status available"
                                                        : "site-status near-capacity"
                                                }
                                            >
                                                {
                                                    site.status
                                                }
                                            </span>

                                        </div>

                                        <div className="capacity-info">

                                            <div>
                                                <span>
                                                    Available
                                                </span>

                                                <strong>
                                                    {
                                                        available
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Total Capacity
                                                </span>

                                                <strong>
                                                    {
                                                        site.capacity
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Safety Score
                                                </span>

                                                <strong>
                                                    {
                                                        site.safetyScore
                                                    }
                                                    /100
                                                </strong>
                                            </div>

                                        </div>

                                        <div className="capacity-bar">

                                            <div
                                                style={{
                                                    width:
                                                        `${occupancy}%`
                                                }}
                                            ></div>

                                        </div>

                                        <p>
                                            {occupancy}% occupied
                                        </p>

                                    </div>
                                );
                            }
                        )}

                    </div>

                </section>

                {/* ==================================================
                    DECISION SUPPORT
                ================================================== */}

                <section className="decision-panel">

                    <div>

                        <p className="section-label">
                            DECISION SUPPORT
                        </p>

                        <h2>
                            Recommended Priority Actions
                        </h2>

                        <p>
                            Use current risk and
                            capacity information to
                            prioritize relocation
                            planning.
                        </p>

                    </div>

                    <div className="action-list">

                        <div className="decision-action immediate">

                            <span>
                                01
                            </span>

                            <div>
                                <strong>
                                    Immediate Relocation
                                </strong>

                                <p>
                                    Prioritize the highest
                                    risk habitations for
                                    immediate relocation.
                                </p>
                            </div>

                        </div>

                        <div className="decision-action short">

                            <span>
                                02
                            </span>

                            <div>
                                <strong>
                                    Short-Term Planning
                                </strong>

                                <p>
                                    Prepare relocation
                                    arrangements for
                                    high-risk communities.
                                </p>
                            </div>

                        </div>

                        <div className="decision-action medium">

                            <span>
                                03
                            </span>

                            <div>
                                <strong>
                                    Medium-Term Planning
                                </strong>

                                <p>
                                    Assess safer sites and
                                    future carrying
                                    capacity requirements.
                                </p>
                            </div>

                        </div>

                    </div>

                </section>

                {/* ==================================================
                    SOS REPORTS
                ================================================== */}

                <section className="dashboard-section">

                    <div className="section-heading-row">

                        <div>
                            <p className="section-label">
                                EMERGENCY RESPONSE
                            </p>

                            <h2>
                                Live SOS Reports
                            </h2>

                            <p>
                                Monitor and coordinate
                                active emergency
                                response requests.
                            </p>
                        </div>

                        <span className="report-count">
                            {reports.length} Reports
                        </span>

                    </div>

                    <div className="authority-list">

                        {reports.length === 0 && !error && (
                            <div className="empty-state">
                                <span>✓</span>
                                <p>
                                    No SOS reports yet.
                                </p>
                            </div>
                        )}

                        {reports.map(
                            (report) => (
                                <div
                                    className="sos-report-card"
                                    key={report._id}
                                >

                                    <div className="sos-report-top">

                                        <span
                                            className="severity-badge"
                                            style={{
                                                background:
                                                    severityColor(
                                                        report.severityLabel
                                                    )
                                            }}
                                        >
                                            {
                                                report.severityLabel
                                            }{" "}
                                            ·{" "}
                                            {
                                                report.severityScore
                                            }
                                        </span>

                                        <span
                                            className={`status-pill status-${report.status}`}
                                        >
                                            {
                                                report.status
                                            }
                                        </span>

                                    </div>

                                    <p className="sos-description">
                                        {
                                            report.description
                                        }
                                    </p>

                                    <div className="sos-meta-grid">

                                        <div>
                                            <span>
                                                People trapped
                                            </span>

                                            <strong>
                                                {
                                                    report.peopleCount
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Reporter
                                            </span>

                                            <strong>
                                                {
                                                    report
                                                        .reporterId
                                                        ?.name ||
                                                    "Unknown"
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Category
                                            </span>

                                            <strong>
                                                {
                                                    report.category
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Location
                                            </span>

                                            <strong>
                                                {report.location
                                                    ?.coordinates?.[1]
                                                    ?.toFixed(4)}
                                                ,{" "}
                                                {report.location
                                                    ?.coordinates?.[0]
                                                    ?.toFixed(4)}
                                            </strong>
                                        </div>

                                    </div>

                                    {report.photoUrl && (
                                        <img
                                            src={
                                                report.photoUrl
                                            }
                                            alt="SOS evidence"
                                            className="sos-photo"
                                        />
                                    )}

                                    <div className="sos-actions">

                                        {report.status ===
                                            "pending" &&
                                            assigningId !==
                                            report._id && (
                                                <button
                                                    className="assign-btn"
                                                    onClick={() =>
                                                        setAssigningId(
                                                            report._id
                                                        )
                                                    }
                                                >
                                                    Assign Rescue
                                                    Team
                                                </button>
                                            )}

                                        {assigningId ===
                                            report._id && (
                                                <div className="assign-form">

                                                    <select
                                                        value={
                                                            teamIdInput
                                                        }
                                                        onChange={(e) =>
                                                            setTeamIdInput(
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    >

                                                        <option value="">
                                                            Select a rescue
                                                            team
                                                        </option>

                                                        {availableTeams.map(
                                                            (team) => (
                                                                <option
                                                                    key={
                                                                        team._id
                                                                    }
                                                                    value={
                                                                        team._id
                                                                    }
                                                                >
                                                                    {
                                                                        team.name
                                                                    }{" "}
                                                                    —{" "}
                                                                    {
                                                                        team.teamType
                                                                    }{" "}
                                                                    (
                                                                    {
                                                                        team.members
                                                                    }{" "}
                                                                    members)
                                                                </option>
                                                            )
                                                        )}

                                                    </select>

                                                    <button
                                                        onClick={() =>
                                                            handleAssign(
                                                                report._id
                                                            )
                                                        }
                                                    >
                                                        Confirm
                                                    </button>

                                                    <button
                                                        className="cancel-assign"
                                                        onClick={() => {
                                                            setAssigningId(
                                                                null
                                                            );

                                                            setTeamIdInput(
                                                                ""
                                                            );

                                                            setActionError(
                                                                ""
                                                            );
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>

                                                </div>
                                            )}

                                        {report.status ===
                                            "assigned" && (
                                                <button
                                                    className="progress-btn"
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            report._id,
                                                            "in-progress"
                                                        )
                                                    }
                                                >
                                                    Mark In Progress
                                                </button>
                                            )}

                                        {report.status ===
                                            "in-progress" && (
                                                <button
                                                    className="resolve-btn"
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            report._id,
                                                            "resolved"
                                                        )
                                                    }
                                                >
                                                    Mark Resolved
                                                </button>
                                            )}

                                    </div>

                                    {actionError &&
                                        assigningId ===
                                        report._id && (
                                            <p className="authority-error">
                                                {
                                                    actionError
                                                }
                                            </p>
                                        )}

                                </div>
                            )
                        )}

                    </div>

                </section>

            </main>

        </div>
    );
}

export default AuthorityDashboard;
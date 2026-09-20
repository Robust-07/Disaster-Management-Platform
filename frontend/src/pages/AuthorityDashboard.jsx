import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    Bell,
    ChevronRight,
    Hospital,
    MapPin,
    Menu,
    Package,
    Radio,
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
    Users,
    XCircle,
} from "lucide-react";

import api from "../api/axios";
import Map from "../components/Map";
import AuthoritySidebar from "../components/AuthoritySidebar";
import AuthorityTopbar from "../components/AuthorityTopbar";

import "./AuthorityDashboard.css";

function AuthorityDashboard() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState("");
    const [locationLoading, setLocationLoading] = useState(true);

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [selectedAlert, setSelectedAlert] = useState(null);
    const [search, setSearch] = useState("");

    const token = localStorage.getItem("token");

    // =========================================================
    // GET CURRENT LOCATION
    // =========================================================

    const getCurrentLocation = () => {
        setLocationLoading(true);
        setLocationError("");

        if (!navigator.geolocation) {
            setLocationError(
                "Geolocation is not supported by this browser."
            );
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });

                setLocationLoading(false);
            },
            (error) => {
                console.error("Location error:", error);

                let message =
                    "Unable to determine your current location.";

                if (error.code === error.PERMISSION_DENIED) {
                    message =
                        "Location permission was denied. Please allow location access.";
                }

                if (error.code === error.POSITION_UNAVAILABLE) {
                    message =
                        "Your current location is unavailable.";
                }

                if (error.code === error.TIMEOUT) {
                    message =
                        "Location request timed out. Please try again.";
                }

                setLocationError(message);
                setLocationLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0,
            }
        );
    };

    // =========================================================
    // FETCH REAL BACKEND DATA
    // =========================================================

    const fetchDashboardData = async (latitude, longitude) => {
        try {
            setError("");

            const response = await api.get(
                `/api/dashboard?lat=${latitude}&lng=${longitude}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.data) {
                throw new Error(
                    "Backend returned an empty dashboard response."
                );
            }

            setDashboardData(response.data);
        } catch (err) {
            console.error(
                "Authority dashboard API error:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                    err.response?.data?.error ||
                    err.message ||
                    "Unable to load dashboard data."
            );
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        getCurrentLocation();
    }, []);

    useEffect(() => {
        if (!location) return;

        const load = async () => {
            setLoading(true);

            await fetchDashboardData(
                location.latitude,
                location.longitude
            );

            setLoading(false);
        };

        load();
    }, [location]);

    // =========================================================
    // REFRESH
    // =========================================================

    const refreshDashboard = async () => {
        if (!location) {
            getCurrentLocation();
            return;
        }

        setRefreshing(true);

        await fetchDashboardData(
            location.latitude,
            location.longitude
        );

        setRefreshing(false);
    };

    // =========================================================
    // NORMALIZE BACKEND ARRAYS
    // =========================================================

    const alerts = useMemo(() => {
        return Array.isArray(dashboardData?.alerts)
            ? dashboardData.alerts
            : [];
    }, [dashboardData]);

    const hospitals = useMemo(() => {
        return Array.isArray(dashboardData?.hospitals)
            ? dashboardData.hospitals
            : [];
    }, [dashboardData]);

    const shelters = useMemo(() => {
        return Array.isArray(dashboardData?.shelters)
            ? dashboardData.shelters
            : [];
    }, [dashboardData]);

    // =========================================================
    // SEARCH
    // =========================================================

    const filteredAlerts = useMemo(() => {
        if (!search.trim()) return alerts;

        const query = search.toLowerCase();

        return alerts.filter((alert) =>
            JSON.stringify(alert)
                .toLowerCase()
                .includes(query)
        );
    }, [alerts, search]);

    // =========================================================
    // ML RISK
    // =========================================================

    const riskObject = dashboardData?.disasterRisk;

    const riskLevel =
        riskObject?.risk ||
        riskObject?.prediction?.risk ||
        dashboardData?.riskLevel ||
        null;

    const probability =
        riskObject?.probability ??
        riskObject?.prediction?.probability ??
        null;

    const riskPercentage =
        probability !== null &&
        probability !== undefined &&
        Number.isFinite(Number(probability))
            ? Math.round(
                  Math.max(
                      0,
                      Math.min(1, Number(probability))
                  ) * 100
              )
            : null;

    // =========================================================
    // COUNTS FROM REAL RESPONSE
    // =========================================================

    const activeAlerts =
        dashboardData?.activeAlerts ??
        alerts.length;

    const nearbyHospitals =
        dashboardData?.nearbyHospitals ??
        hospitals.length;

    const nearbyShelters =
        dashboardData?.nearbyShelters ??
        shelters.length;

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div
            className={`authority-shell ${
                sidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            {/* =====================================================
                SIDEBAR
            ===================================================== */}

            <AuthoritySidebar
                collapsed={sidebarCollapsed}
                onToggle={() =>
                    setSidebarCollapsed((previous) => !previous)
                }
            />

            {/* =====================================================
                MAIN
            ===================================================== */}

            <div className="authority-main">

                {/* =================================================
                    TOPBAR
                ================================================= */}

                <AuthorityTopbar
                    search={search}
                    setSearch={setSearch}
                    onMenuClick={() =>
                        setSidebarCollapsed((previous) => !previous)
                    }
                />

                {/* =================================================
                    PAGE
                ================================================= */}

                <main className="authority-page">

                    {/* =================================================
                        PAGE HEADER
                    ================================================= */}

                    <section className="authority-header">

                        <div className="authority-header-left">

                            <div className="authority-status">
                                <span></span>
                                AUTHORITY COMMAND CENTER
                            </div>

                            <h1>
                                Disaster Response Overview
                            </h1>

                            <p>
                                Monitor incidents, emergency resources,
                                affected areas and ML-powered risk
                                intelligence from one place.
                            </p>

                        </div>

                        <div className="authority-header-actions">

                            <div className="system-status">
                                <ShieldCheck size={17} />

                                <div>
                                    <span>
                                        System status
                                    </span>

                                    <strong>
                                        {error
                                            ? "Attention required"
                                            : "Connected"}
                                    </strong>
                                </div>
                            </div>

                            <button
                                className="refresh-button"
                                onClick={refreshDashboard}
                                disabled={
                                    refreshing ||
                                    locationLoading
                                }
                            >
                                <RefreshCw
                                    size={16}
                                    className={
                                        refreshing
                                            ? "spin"
                                            : ""
                                    }
                                />

                                {refreshing
                                    ? "Refreshing"
                                    : "Refresh"}
                            </button>

                        </div>

                    </section>

                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (
                        <div className="authority-error">
                            <XCircle size={18} />

                            <div>
                                <strong>
                                    Dashboard data unavailable
                                </strong>

                                <span>
                                    {error}
                                </span>
                            </div>

                            <button
                                onClick={refreshDashboard}
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* =================================================
                        LOCATION STATUS
                    ================================================= */}

                    {locationError && (
                        <div className="authority-location-warning">
                            <MapPin size={17} />

                            <span>
                                {locationError}
                            </span>

                            <button
                                onClick={getCurrentLocation}
                            >
                                Retry location
                            </button>
                        </div>
                    )}

                    {/* =================================================
                        STATISTICS
                    ================================================= */}

                    <section className="authority-stat-grid">

                        <article className="authority-stat-card emergency">

                            <div className="stat-card-icon">
                                <ShieldAlert size={21} />
                            </div>

                            <div>
                                <span>
                                    Active Emergencies
                                </span>

                                <strong>
                                    {loading
                                        ? "—"
                                        : activeAlerts}
                                </strong>

                                <small>
                                    Live backend incidents
                                </small>
                            </div>

                        </article>

                        <article className="authority-stat-card">

                            <div className="stat-card-icon">
                                <Hospital size={21} />
                            </div>

                            <div>
                                <span>
                                    Hospitals
                                </span>

                                <strong>
                                    {loading
                                        ? "—"
                                        : nearbyHospitals}
                                </strong>

                                <small>
                                    Returned by backend
                                </small>
                            </div>

                        </article>

                        <article className="authority-stat-card">

                            <div className="stat-card-icon">
                                <Users size={21} />
                            </div>

                            <div>
                                <span>
                                    Shelters
                                </span>

                                <strong>
                                    {loading
                                        ? "—"
                                        : nearbyShelters}
                                </strong>

                                <small>
                                    Returned by backend
                                </small>
                            </div>

                        </article>

                        <article className="authority-stat-card risk-card">

                            <div className="stat-card-icon">
                                <AlertTriangle size={21} />
                            </div>

                            <div>
                                <span>
                                    ML Risk Assessment
                                </span>

                                <strong>
                                    {loading
                                        ? "—"
                                        : riskLevel || "Unavailable"}
                                </strong>

                                <small>
                                    {riskPercentage !== null
                                        ? `${riskPercentage}% predicted probability`
                                        : "Prediction unavailable"}
                                </small>
                            </div>

                        </article>

                    </section>

                    {/* =================================================
                        MAIN COMMAND GRID
                    ================================================= */}

                    <section className="authority-main-grid">

                        {/* =================================================
                            MAP
                        ================================================= */}

                        <section className="authority-panel map-panel">

                            <div className="panel-header">

                                <div>
                                    <div className="panel-title">
                                        <MapPin size={18} />
                                        Live Incident Map
                                    </div>

                                    <p>
                                        Geographic view of incidents and
                                        emergency facilities.
                                    </p>
                                </div>

                                <span className="live-badge">
                                    LIVE
                                </span>

                            </div>

                            <div className="authority-map-container">

                                {locationLoading ? (
                                    <div className="map-loading">
                                        <RefreshCw
                                            size={22}
                                            className="spin"
                                        />

                                        <span>
                                            Detecting authority location...
                                        </span>
                                    </div>
                                ) : (
                                    <Map
                                        location={location}
                                        alerts={alerts}
                                        hospitals={hospitals}
                                        shelters={shelters}
                                    />
                                )}

                            </div>

                        </section>

                        {/* =================================================
                            INCIDENT QUEUE
                        ================================================= */}

                        <section className="authority-panel incident-panel">

                            <div className="panel-header">

                                <div>
                                    <div className="panel-title">
                                        <Radio size={18} />
                                        Emergency Queue
                                    </div>

                                    <p>
                                        Incidents currently received from
                                        the backend.
                                    </p>
                                </div>

                                <span className="queue-count">
                                    {filteredAlerts.length}
                                </span>

                            </div>

                            <div className="incident-list">

                                {loading ? (
                                    <div className="panel-empty">
                                        <RefreshCw
                                            size={20}
                                            className="spin"
                                        />

                                        Loading incidents...
                                    </div>
                                ) : filteredAlerts.length === 0 ? (
                                    <div className="panel-empty">
                                        <ShieldCheck size={25} />

                                        <strong>
                                            No active incidents
                                        </strong>

                                        <span>
                                            The backend has not returned
                                            any current alerts.
                                        </span>
                                    </div>
                                ) : (
                                    filteredAlerts.map(
                                        (alert, index) => (
                                            <button
                                                className="incident-row"
                                                key={
                                                    alert._id ||
                                                    alert.id ||
                                                    index
                                                }
                                                onClick={() =>
                                                    setSelectedAlert(
                                                        alert
                                                    )
                                                }
                                            >

                                                <div className="incident-icon">
                                                    <AlertTriangle
                                                        size={17}
                                                    />
                                                </div>

                                                <div className="incident-content">

                                                    <strong>
                                                        {alert.type ||
                                                            alert.title ||
                                                            alert.disasterType ||
                                                            "Emergency incident"}
                                                    </strong>

                                                    <span>
                                                        <MapPin
                                                            size={12}
                                                        />

                                                        {alert.location?.address ||
                                                            alert.address ||
                                                            alert.location?.name ||
                                                            "Location supplied by backend"}
                                                    </span>

                                                    <small>
                                                        {alert.status ||
                                                            alert.severity ||
                                                            "Active"}
                                                    </small>

                                                </div>

                                                <ChevronRight
                                                    size={17}
                                                />

                                            </button>
                                        )
                                    )
                                )}

                            </div>

                        </section>

                    </section>

                    {/* =================================================
                        INTELLIGENCE + FACILITIES
                    ================================================= */}

                    <section className="authority-secondary-grid">

                        {/* =================================================
                            ML INTELLIGENCE
                        ================================================= */}

                        <section className="authority-panel">

                            <div className="panel-header">

                                <div>
                                    <div className="panel-title">
                                        <AlertTriangle size={18} />
                                        ML Risk Intelligence
                                    </div>

                                    <p>
                                        Prediction returned by the disaster
                                        intelligence pipeline.
                                    </p>
                                </div>

                            </div>

                            <div className="risk-intelligence">

                                <div className="risk-main">

                                    <span>
                                        Current predicted risk
                                    </span>

                                    <strong>
                                        {loading
                                            ? "Loading..."
                                            : riskLevel ||
                                              "Unavailable"}
                                    </strong>

                                    {riskPercentage !== null && (
                                        <div className="risk-meter">

                                            <div
                                                style={{
                                                    width: `${riskPercentage}%`,
                                                }}
                                            ></div>

                                        </div>
                                    )}

                                    {riskPercentage !== null && (
                                        <small>
                                            Model probability:{" "}
                                            {riskPercentage}%
                                        </small>
                                    )}

                                </div>

                                <div className="risk-source">

                                    <ShieldCheck size={19} />

                                    <div>
                                        <strong>
                                            Backend connected
                                        </strong>

                                        <span>
                                            Risk information is read
                                            directly from the dashboard
                                            API response.
                                        </span>
                                    </div>

                                </div>

                            </div>

                            {dashboardData?.weather && (
                                <div className="environment-grid">

                                    <div>
                                        <span>
                                            Temperature
                                        </span>

                                        <strong>
                                            {dashboardData.weather.temperature ??
                                                "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Humidity
                                        </span>

                                        <strong>
                                            {dashboardData.weather.humidity ??
                                                "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Rainfall
                                        </span>

                                        <strong>
                                            {dashboardData.weather.rainfall ??
                                                "—"}
                                        </strong>
                                    </div>

                                </div>
                            )}

                        </section>

                        {/* =================================================
                            FACILITIES
                        ================================================= */}

                        <section className="authority-panel">

                            <div className="panel-header">

                                <div>
                                    <div className="panel-title">
                                        <Hospital size={18} />
                                        Emergency Facilities
                                    </div>

                                    <p>
                                        Facilities returned by the live
                                        dashboard data.
                                    </p>
                                </div>

                            </div>

                            <div className="facility-summary">

                                <div className="facility-summary-item">

                                    <Hospital size={20} />

                                    <div>
                                        <span>
                                            Hospitals
                                        </span>

                                        <strong>
                                            {loading
                                                ? "—"
                                                : hospitals.length}
                                        </strong>
                                    </div>

                                </div>

                                <div className="facility-summary-item">

                                    <Users size={20} />

                                    <div>
                                        <span>
                                            Shelters
                                        </span>

                                        <strong>
                                            {loading
                                                ? "—"
                                                : shelters.length}
                                        </strong>
                                    </div>

                                </div>

                                <div className="facility-summary-item">

                                    <Package size={20} />

                                    <div>
                                        <span>
                                            Resource data
                                        </span>

                                        <strong>
                                            Backend
                                        </strong>
                                    </div>

                                </div>

                            </div>

                        </section>

                    </section>

                    {/* =================================================
                        RESPONSE OPERATIONS
                    ================================================= */}

                    <section className="authority-panel operations-panel">

                        <div className="panel-header">

                            <div>
                                <div className="panel-title">
                                    <Users size={18} />
                                    Response Operations
                                </div>

                                <p>
                                    Team deployment and resource allocation
                                    should be connected to the authority
                                    backend here.
                                </p>
                            </div>

                        </div>

                        <div className="operations-placeholder">

                            <div>
                                <Users size={21} />
                                <strong>
                                    Response teams
                                </strong>
                                <span>
                                    Waiting for the authority team API.
                                </span>
                            </div>

                            <div>
                                <Package size={21} />
                                <strong>
                                    Resource allocation
                                </strong>
                                <span>
                                    Waiting for live inventory data.
                                </span>
                            </div>

                            <div>
                                <Radio size={21} />
                                <strong>
                                    Dispatch control
                                </strong>
                                <span>
                                    Ready to connect to dispatch APIs.
                                </span>
                            </div>

                        </div>

                    </section>

                </main>
            </div>

            {/* =========================================================
                INCIDENT DETAIL
            ========================================================= */}

            {selectedAlert && (
                <div
                    className="authority-modal-backdrop"
                    onClick={() =>
                        setSelectedAlert(null)
                    }
                >

                    <div
                        className="authority-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <button
                            className="modal-close"
                            onClick={() =>
                                setSelectedAlert(null)
                            }
                        >
                            <XCircle size={20} />
                        </button>

                        <div className="modal-icon">
                            <AlertTriangle size={23} />
                        </div>

                        <span className="modal-kicker">
                            INCIDENT DETAILS
                        </span>

                        <h2>
                            {selectedAlert.type ||
                                selectedAlert.title ||
                                selectedAlert.disasterType ||
                                "Emergency incident"}
                        </h2>

                        <div className="modal-location">
                            <MapPin size={15} />

                            {selectedAlert.location?.address ||
                                selectedAlert.address ||
                                selectedAlert.location?.name ||
                                "Location supplied by backend"}
                        </div>

                        <div className="modal-data">

                            <div>
                                <span>
                                    Severity
                                </span>

                                <strong>
                                    {selectedAlert.severity ||
                                        "Not supplied"}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Status
                                </span>

                                <strong>
                                    {selectedAlert.status ||
                                        "Not supplied"}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    ID
                                </span>

                                <strong>
                                    {selectedAlert._id ||
                                        selectedAlert.id ||
                                        "Not supplied"}
                                </strong>
                            </div>

                        </div>

                        <p className="modal-description">
                            {selectedAlert.description ||
                                selectedAlert.message ||
                                "No additional incident description was returned by the backend."}
                        </p>

                        <div className="modal-note">
                            <ShieldCheck size={17} />

                            <span>
                                This dashboard displays backend data only.
                                Dispatch and incident-state changes should
                                be performed through the authority API.
                            </span>
                        </div>

                    </div>

                </div>
            )}
        </div>
    );
}

export default AuthorityDashboard;

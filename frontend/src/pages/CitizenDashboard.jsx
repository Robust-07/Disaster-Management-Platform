import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import AlertCard from "../components/AlertCard";
import SOSCard from "../components/SOSCard";
import RiskCard from "../components/RiskCard";
import QuickActionCard from "../components/QuickActionCard";
import DisasterAlert from "../components/DisasterAlert";
import Map from "../components/Map";

import "./CitizenDashboard.css";


function CitizenDashboard() {

    const navigate = useNavigate();


    // =====================================================
    // USER
    // =====================================================

    const userName =
        localStorage.getItem("userName") || "Citizen";


    // =====================================================
    // LOCATION
    // =====================================================

    const [location, setLocation] = useState(null);

    const [locationLoading, setLocationLoading] =
        useState(true);

    const [locationError, setLocationError] =
        useState("");

    const [locationAccuracy, setLocationAccuracy] =
        useState(null);


    // =====================================================
    // DASHBOARD DATA
    // =====================================================

<<<<<<< Updated upstream
    const [dashboardData, setDashboardData] = useState({

        activeAlerts: 0,

        nearbyHospitals: 0,

        nearbyShelters: 0,

        riskLevel: "Unknown",

        alerts: [],

        hospitals: [],

        shelters: []

    });

=======
    const [dashboardData, setDashboardData] =
        useState({
            activeAlerts: 0,

            nearbyHospitals: 0,

            nearbyShelters: 0,

            riskLevel: "Unknown",

            riskScore: 0,

            alerts: [],

            hospitals: [],

            shelters: [],

            // SIH 191 DATA
            hazardZones: [],

            vulnerableHabitations: [],

            relocationSites: [],

            relocationRecommendation: null,

            disasterRisk: null,

            weather: null,

            features: null
        });
>>>>>>> Stashed changes


    const [dataLoading, setDataLoading] =
        useState(false);


    // =====================================================
<<<<<<< Updated upstream
    // CALL BACKEND
=======
    // EXTRACT ML RISK
    // =====================================================

    const extractRiskData = (disasterRisk) => {

        if (!disasterRisk) {
            return {
                risk: null,
                probability: null
            };
        }

        const risk =
            disasterRisk.risk ??
            disasterRisk.prediction?.risk ??
            null;

        const probability =
            disasterRisk.probability ??
            disasterRisk.prediction?.probability ??
            null;

        return {
            risk,
            probability
        };
    };


    // =====================================================
    // NORMALIZE SIH DATA
    // =====================================================

    const normalizeArray = (value) => {
        return Array.isArray(value) ? value : [];
    };


    // =====================================================
    // FETCH DASHBOARD DATA
>>>>>>> Stashed changes
    // =====================================================

    const fetchDashboardData = async (
        latitude,
        longitude
    ) => {

        try {

            setDataLoading(true);
<<<<<<< Updated upstream
=======

            setDisasterError("");
>>>>>>> Stashed changes

            const response = await fetch(

                `http://localhost:5000/api/dashboard?lat=${latitude}&lng=${longitude}`

            );


            if (!response.ok) {

                throw new Error(
                    "Failed to fetch dashboard data"
                );

            }


<<<<<<< Updated upstream
            const data =
                await response.json();
=======
            console.log(
                "Fetching dashboard for:",
                latitude,
                longitude
            );


            // =================================================
            // BACKEND CALL
            // =================================================

            const response = await api.get(
                `/api/dashboard?lat=${latitude}&lng=${longitude}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            const data = response.data;
>>>>>>> Stashed changes


            console.log(
                "Backend dashboard data:",
                data
            );

<<<<<<< Updated upstream
=======
            console.log(
                "DISASTER ML FROM DASHBOARD:",
                data.disasterRisk
            );

            console.log(
                "HAZARD ZONES:",
                data.hazardZones
            );

            console.log(
                "VULNERABLE HABITATIONS:",
                data.vulnerableHabitations
            );

            console.log(
                "RELOCATION SITES:",
                data.relocationSites
            );

            console.log(
                "RELOCATION RECOMMENDATION:",
                data.relocationRecommendation
            );

            console.log(
                "WEATHER FROM BACKEND:",
                data.weather
            );

            console.log(
                "================================"
            );


            // =================================================
            // CHECK RESPONSE
            // =================================================

            if (!data) {
                throw new Error(
                    "Empty response received from backend"
                );
            }


            // =================================================
            // EXTRACT ML DATA
            // =================================================

            const disasterRisk =
                data.disasterRisk || null;

            const {
                risk,
                probability
            } =
                extractRiskData(disasterRisk);


            // =================================================
            // CONVERT PROBABILITY TO SCORE
            // =================================================

            let riskScore = 0;

            if (
                probability !== null &&
                probability !== undefined
            ) {

                const numericProbability =
                    Number(probability);


                if (
                    Number.isFinite(
                        numericProbability
                    )
                ) {

                    riskScore =
                        Math.round(
                            Math.max(
                                0,
                                Math.min(
                                    1,
                                    numericProbability
                                )
                            ) * 100
                        );
                }
            }


            // =================================================
            // NORMALIZE RISK LEVEL
            // =================================================

            const finalRisk =
                risk ||
                data.riskLevel ||
                "Unknown";


            // =================================================
            // SAVE ALL DATA
            // =================================================
>>>>>>> Stashed changes

            setDashboardData({

                activeAlerts:
                    data.activeAlerts ?? 0,

                nearbyHospitals:
                    data.nearbyHospitals ?? 0,

                nearbyShelters:
                    data.nearbyShelters ?? 0,

                riskLevel:
                    data.riskLevel ?? "Unknown",

                alerts:
<<<<<<< Updated upstream
                    data.alerts ?? [],

                hospitals:
                    data.hospitals ?? [],

                shelters:
                    data.shelters ?? []

            });

=======
                    normalizeArray(
                        data.alerts
                    ),

                hospitals:
                    normalizeArray(
                        data.hospitals
                    ),

                shelters:
                    normalizeArray(
                        data.shelters
                    ),


                // =============================================
                // SIH 191
                // =============================================

                hazardZones:
                    normalizeArray(
                        data.hazardZones
                    ),

                vulnerableHabitations:
                    normalizeArray(
                        data.vulnerableHabitations
                    ),

                relocationSites:
                    normalizeArray(
                        data.relocationSites
                    ),

                relocationRecommendation:
                    data.relocationRecommendation ||
                    data.recommendedRelocationSite ||
                    null,


                disasterRisk:
                    disasterRisk,

                weather:
                    data.weather || null,

                features:
                    data.features || null

            });


            // =================================================
            // ML ERROR CHECK
            // =================================================

            if (
                disasterRisk &&
                disasterRisk.success === false
            ) {

                setDisasterError(
                    disasterRisk.message ||
                    disasterRisk.error ||
                    "Disaster prediction failed"
                );

            } else {

                setDisasterError("");

            }


            console.log(
                "FINAL RISK:",
                finalRisk
            );

            console.log(
                "FINAL PROBABILITY:",
                probability
            );

            console.log(
                "FINAL RISK SCORE:",
                riskScore
            );

>>>>>>> Stashed changes
        }


        catch (error) {

            console.error(
                "Dashboard API error:",
                error
            );


<<<<<<< Updated upstream
=======
            const backendError =
                error.response?.data;


            setDisasterError(
                backendError?.message ||
                backendError?.error ||
                error.message ||
                "Unable to load dashboard data"
            );


            // Do not destroy UI structure

>>>>>>> Stashed changes
            setDashboardData({

                activeAlerts: 0,

                nearbyHospitals: 0,

                nearbyShelters: 0,

                riskLevel: "Unavailable",
<<<<<<< Updated upstream

                alerts: [],

                hospitals: [],

                shelters: []
=======

                riskScore: 0,

                alerts: [],

                hospitals: [],

                shelters: [],

                hazardZones: [],

                vulnerableHabitations: [],

                relocationSites: [],

                relocationRecommendation: null,

                disasterRisk: null,

                weather: null,

                features: null
>>>>>>> Stashed changes

            });

        }


        finally {

            setDataLoading(false);

        }

    };


    // =====================================================
    // GET CURRENT LOCATION
    // =====================================================

    const getCurrentLocation = () => {

        console.log(
            "Requesting current location..."
        );


        setLocationLoading(true);

        setLocationError("");

        setLocationAccuracy(null);
<<<<<<< Updated upstream
=======

        setDisasterError("");
>>>>>>> Stashed changes


        // -------------------------------------------------
        // CHECK BROWSER SUPPORT
        // -------------------------------------------------

        if (!navigator.geolocation) {

            setLocationError(
                "Geolocation is not supported by your browser."
            );

            setLocationLoading(false);

            return;

        }


        // -------------------------------------------------
        // GET LOCATION
        // -------------------------------------------------

        navigator.geolocation.getCurrentPosition(

            (position) => {

                console.log(
                    "Location received:",
                    position
                );


                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                const accuracy =
                    position.coords.accuracy;


                console.log(
                    "Latitude:",
                    latitude
                );

<<<<<<< Updated upstream
                console.log(
                    "Longitude:",
                    longitude
                );

                console.log(
                    "Accuracy:",
                    accuracy,
                    "meters"
                );
=======
                    setLocation({

                        latitude,

                        longitude

                    });
>>>>>>> Stashed changes


                // -------------------------------------------------
                // SAVE LOCATION
                // -------------------------------------------------

                setLocation({

                    latitude: latitude,

                    longitude: longitude

                });


                setLocationAccuracy(
                    accuracy
                );


<<<<<<< Updated upstream
                setLocationLoading(false);
=======
                    // =================================================
                    // FETCH EVERYTHING
                    // =================================================
>>>>>>> Stashed changes


                // -------------------------------------------------
                // FETCH LOCATION-BASED DATA
                // -------------------------------------------------

<<<<<<< Updated upstream
                fetchDashboardData(
                    latitude,
                    longitude
                );
=======

                catch (error) {

                    console.error(
                        "Location processing error:",
                        error
                    );

                    setLocationLoading(false);

                }
>>>>>>> Stashed changes

            },


            (error) => {

                console.error(
                    "Geolocation error:",
                    error
                );


                setLocationLoading(false);


                switch (error.code) {

                    case error.PERMISSION_DENIED:

                        setLocationError(
                            "Location permission denied. Please allow location access in your browser."
                        );

                        break;


                    case error.POSITION_UNAVAILABLE:

                        setLocationError(
                            "Your location is currently unavailable. Please check your device's location settings."
                        );

                        break;


                    case error.TIMEOUT:

                        setLocationError(
                            "Location request timed out. Please try again."
                        );

                        break;


                    default:

                        setLocationError(
                            "Unable to determine your current location."
                        );

                }

            },


            {

                enableHighAccuracy: true,

                timeout: 30000,

                maximumAge: 0

            }

        );

    };


    // =====================================================
    // GET LOCATION WHEN DASHBOARD OPENS
    // =====================================================

    useEffect(() => {

        getCurrentLocation();

    }, []);


    // =====================================================
    // QUICK ACTION NAVIGATION
    // =====================================================

    const handleQuickAction = (path) => {

        navigate(path);

    };


    // =====================================================
<<<<<<< Updated upstream
=======
    // RISK SCORE
    // =====================================================

    const getRiskScore = () => {

        if (dataLoading) {
            return 0;
        }


        const disasterRisk =
            dashboardData.disasterRisk;


        const {
            probability
        } =
            extractRiskData(
                disasterRisk
            );


        if (
            probability !== null &&
            probability !== undefined
        ) {

            const numericProbability =
                Number(probability);


            if (
                Number.isFinite(
                    numericProbability
                )
            ) {

                return Math.round(

                    Math.max(
                        0,
                        Math.min(
                            1,
                            numericProbability
                        )
                    ) * 100

                );

            }

        }


        return Number(
            dashboardData.riskScore
        ) || 0;

    };


    // =====================================================
    // RISK LEVEL
    // =====================================================

    const getRiskLevel = () => {

        if (dataLoading) {
            return "Loading...";
        }


        const disasterRisk =
            dashboardData.disasterRisk;


        const {
            risk
        } =
            extractRiskData(
                disasterRisk
            );


        if (risk) {

            return String(
                risk
            ).toUpperCase();

        }


        if (
            dashboardData.riskLevel &&
            dashboardData.riskLevel !== "Unknown"
        ) {

            return String(
                dashboardData.riskLevel
            ).toUpperCase();

        }


        return "UNKNOWN";

    };


    // =====================================================
    // CURRENT SAFETY STATUS
    // =====================================================

    const getSafetyStatus = () => {

        const risk =
            getRiskLevel();


        if (
            risk === "CRITICAL" ||
            risk === "VERY HIGH"
        ) {

            return {

                title:
                    "Immediate Relocation Recommended",

                description:
                    "Your current location has been identified as a critical-risk area. Move toward a safer designated site if instructed by authorities.",

                className:
                    "critical"

            };

        }


        if (
            risk === "HIGH"
        ) {

            return {

                title:
                    "High Risk Area",

                description:
                    "Your current location is exposed to significant disaster risk. Stay alert and be prepared to relocate.",

                className:
                    "high"

            };

        }


        if (
            risk === "MEDIUM" ||
            risk === "MODERATE"
        ) {

            return {

                title:
                    "Moderate Risk Area",

                description:
                    "Monitor disaster alerts and remain prepared to move if conditions worsen.",

                className:
                    "moderate"

            };

        }


        if (
            risk === "LOW"
        ) {

            return {

                title:
                    "Relatively Safer Area",

                description:
                    "Your current location currently shows comparatively lower predicted disaster risk.",

                className:
                    "low"

            };

        }


        return {

            title:
                "Safety Status Unavailable",

            description:
                "Risk information is currently unavailable. Continue monitoring official disaster alerts.",

            className:
                "unknown"

        };

    };


    const safetyStatus =
        getSafetyStatus();


    // =====================================================
    // VULNERABLE HABITATION
    // =====================================================

    const getCurrentVulnerableHabitation = () => {

        if (
            dashboardData.vulnerableHabitations.length === 0
        ) {

            return null;

        }


        return (
            dashboardData.vulnerableHabitations[0]
        );

    };


    const currentHabitation =
        getCurrentVulnerableHabitation();


    // =====================================================
    // RELOCATION SITE
    // =====================================================

    const getRecommendedSite = () => {

        if (
            dashboardData.relocationRecommendation
        ) {

            return dashboardData.relocationRecommendation;

        }


        if (
            dashboardData.relocationSites.length > 0
        ) {

            return dashboardData.relocationSites[0];

        }


        return null;

    };


    const recommendedSite =
        getRecommendedSite();


    // =====================================================
    // CAPACITY HELPERS
    // =====================================================

    const getSiteCapacity = (site) => {

        if (!site) {
            return null;
        }


        return (
            site.availableCapacity ??
            site.available ??
            site.capacityAvailable ??
            null
        );

    };


    const getTotalCapacity = (site) => {

        if (!site) {
            return null;
        }


        return (
            site.totalCapacity ??
            site.capacity ??
            null
        );

    };


    const getOccupiedCapacity = (site) => {

        if (!site) {
            return null;
        }


        return (
            site.occupiedCapacity ??
            site.occupied ??
            null
        );

    };


    // =====================================================
>>>>>>> Stashed changes
    // RENDER
    // =====================================================

    return (

        <div className="dashboard-page">


            {/* =========================================
                NAVBAR
            ========================================= */}

            <Navbar />


            <main className="dashboard-container">


<<<<<<< Updated upstream
                {/* =====================================
=======
                {/* =================================================
>>>>>>> Stashed changes
                    WELCOME HEADER
                ===================================== */}

                <div className="dashboard-header">

                    <div>

                        <h1>

                            Welcome back, {userName}!

                        </h1>


                        <p>

                            Stay informed and stay safe
                            with ResQ.

                        </p>

                    </div>


                    {/* LOCATION BUTTON */}

                    <button

                        className="location-button"

                        onClick={
                            getCurrentLocation
                        }

                        disabled={
                            locationLoading
                        }

                    >

                        📍{" "}

                        {locationLoading

                            ? "Detecting Location..."

                            : "Use My Current Location"

                        }

                    </button>

                </div>


                {/* =====================================
                    LOCATION STATUS
                ===================================== */}

                <div className="location-status">


                    {locationLoading && (

                        <p>

                            📍 Detecting your current
                            location...

                        </p>

                    )}


                    {locationError && (

                        <div>

                            <p className="location-error">

                                ⚠️ {locationError}

                            </p>


                            <button

                                className="location-button"

                                onClick={
                                    getCurrentLocation
                                }

                            >

                                Try Again

                            </button>

                        </div>

                    )}


                    {location && !locationLoading && (

                        <div className="location-success">

                            <p>

                                📍{" "}

                                <strong>
                                    Location detected
                                </strong>

                            </p>


                            <p>

                                Latitude:{" "}

                                {location.latitude.toFixed(6)}

                            </p>


                            <p>

                                Longitude:{" "}

                                {location.longitude.toFixed(6)}

                            </p>


                            <p>

                                Accuracy: approximately{" "}

                                {locationAccuracy
                                    ? Math.round(
                                        locationAccuracy
                                    )
                                    : "--"
                                }m

                            </p>

                        </div>

                    )}

                </div>


<<<<<<< Updated upstream
                {/* =====================================
=======
                {/* =================================================
                    SIH 191 CURRENT SAFETY STATUS
                ================================================= */}

                <section
                    className={`safety-status-card ${safetyStatus.className}`}
                >

                    <div className="safety-status-icon">

                        {safetyStatus.className ===
                        "critical"
                            ? "🚨"
                            : safetyStatus.className ===
                                "high"
                                ? "⚠️"
                                : safetyStatus.className ===
                                    "moderate"
                                    ? "🟡"
                                    : safetyStatus.className ===
                                        "low"
                                        ? "🟢"
                                        : "ℹ️"
                        }

                    </div>


                    <div className="safety-status-content">

                        <span className="safety-label">
                            CURRENT SAFETY STATUS
                        </span>

                        <h2>
                            {safetyStatus.title}
                        </h2>

                        <p>
                            {safetyStatus.description}
                        </p>

                    </div>


                    {(
                        safetyStatus.className ===
                        "critical" ||
                        safetyStatus.className ===
                        "high"
                    ) && (

                        <button
                            className="relocation-button"
                            onClick={() =>
                                handleQuickAction(
                                    "/safe-routes"
                                )
                            }
                        >
                            View Safe Route
                        </button>

                    )}

                </section>


                {/* =================================================
>>>>>>> Stashed changes
                    TOP DASHBOARD CARDS
                ===================================== */}

                <div className="dashboard-cards">

<<<<<<< Updated upstream
=======

                    {/* ACTIVE ALERTS */}
>>>>>>> Stashed changes

                    <AlertCard

                        count={
                            dataLoading
                                ? "..."
                                : dashboardData.activeAlerts
                        }

                        title="Active Alerts"

                        subtitle="Near your location"

                    />


<<<<<<< Updated upstream
=======
                    {/* HOSPITALS */}

>>>>>>> Stashed changes
                    <div className="dashboard-card">

                        <div className="card-icon">

                            🏥

                        </div>


                        <div>

                            <h3>

                                Nearby Hospitals

                            </h3>


                            <p className="card-number">

                                {dataLoading

                                    ? "..."

                                    : dashboardData.nearbyHospitals

                                }

                            </p>


                            <span>

                                Near your location

                            </span>

                        </div>

                    </div>


<<<<<<< Updated upstream
=======
                    {/* SHELTERS */}

>>>>>>> Stashed changes
                    <div className="dashboard-card">

                        <div className="card-icon">

                            🏠

                        </div>


                        <div>

                            <h3>

                                Nearby Shelters

                            </h3>


                            <p className="card-number">

                                {dataLoading

                                    ? "..."

                                    : dashboardData.nearbyShelters

                                }

                            </p>


                            <span>

                                Near your location

                            </span>

                        </div>

                    </div>


<<<<<<< Updated upstream
=======
                    {/* ML RISK */}

>>>>>>> Stashed changes
                    <RiskCard

                        riskLevel={
                            dataLoading
                                ? "..."
                                : dashboardData.riskLevel
                        }

                    />

                </div>


<<<<<<< Updated upstream
                {/* =====================================
                    MAP + SOS
                ===================================== */}

                <div className="map-sos-layout">

=======
                {/* =================================================
                    SIH 191 VULNERABILITY + RELOCATION
                ================================================= */}

                <div className="sih-intelligence-grid">


                    {/* VULNERABLE HABITATION */}

                    <section
                        className="dashboard-section vulnerability-section"
                    >

                        <div className="section-heading">

                            <div>

                                <span className="section-label">
                                    SIH 191
                                </span>

                                <h2>
                                    Vulnerable Habitation
                                </h2>

                                <p>
                                    Identification of vulnerable
                                    communities near your location.
                                </p>

                            </div>

                        </div>


                        {currentHabitation ? (

                            <div className="vulnerability-card">

                                <div className="vulnerability-header">

                                    <div>

                                        <span className="small-label">
                                            HABITATION
                                        </span>

                                        <h3>
                                            {currentHabitation.name ||
                                                currentHabitation.village ||
                                                currentHabitation.habitation ||
                                                "Priority Habitation"}
                                        </h3>

                                    </div>


                                    <span
                                        className={`priority-badge ${
                                            String(
                                                currentHabitation.priority ||
                                                currentHabitation.relocationPriority ||
                                                "HIGH"
                                            )
                                                .toLowerCase()
                                        }`}
                                    >
                                        {currentHabitation.priority ||
                                            currentHabitation.relocationPriority ||
                                            "HIGH"}
                                    </span>

                                </div>


                                <div className="vulnerability-details">

                                    <div>

                                        <span>
                                            Population
                                        </span>

                                        <strong>
                                            {currentHabitation.population ??
                                                "--"}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Risk Level
                                        </span>

                                        <strong>
                                            {currentHabitation.risk ||
                                                currentHabitation.riskLevel ||
                                                getRiskLevel()}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Hazards
                                        </span>

                                        <strong>
                                            {Array.isArray(
                                                currentHabitation.hazards
                                            )
                                                ? currentHabitation.hazards.join(
                                                    ", "
                                                )
                                                : currentHabitation.hazards ||
                                                "Multiple hazards"}
                                        </strong>

                                    </div>

                                </div>


                                <p className="vulnerability-note">

                                    ⚠️ This habitation has been
                                    identified as potentially
                                    vulnerable to disaster impact.

                                </p>

                            </div>

                        ) : (

                            <div className="empty-state">

                                <div>
                                    ✓
                                </div>

                                <p>
                                    No priority vulnerable
                                    habitation has been identified
                                    near your current location.
                                </p>

                            </div>

                        )}

                    </section>


                    {/* RELOCATION RECOMMENDATION */}

                    <section
                        className="dashboard-section relocation-section"
                    >

                        <div className="section-heading">

                            <div>

                                <span className="section-label">
                                    SIH 191
                                </span>

                                <h2>
                                    Safer Relocation Site
                                </h2>

                                <p>
                                    Recommended safer alternative
                                    based on available site capacity.
                                </p>

                            </div>

                        </div>


                        {recommendedSite ? (

                            <div className="relocation-site-card">

                                <div className="relocation-site-header">

                                    <div>

                                        <span className="small-label">
                                            RECOMMENDED SITE
                                        </span>

                                        <h3>
                                            {recommendedSite.name ||
                                                recommendedSite.siteName ||
                                                "Safer Alternative Site"}
                                        </h3>

                                    </div>


                                    <span className="safe-badge">
                                        SAFE
                                    </span>

                                </div>


                                <div className="relocation-site-info">

                                    <div>

                                        <span>
                                            📍 Distance
                                        </span>

                                        <strong>
                                            {recommendedSite.distance
                                                ? `${recommendedSite.distance} km`
                                                : "--"}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Capacity
                                        </span>

                                        <strong>
                                            {getTotalCapacity(
                                                recommendedSite
                                            ) ??
                                                "--"}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Available
                                        </span>

                                        <strong>
                                            {getSiteCapacity(
                                                recommendedSite
                                            ) ??
                                                "--"}
                                        </strong>

                                    </div>

                                </div>


                                {getOccupiedCapacity(
                                    recommendedSite
                                ) !== null && (

                                    <div className="capacity-bar-container">

                                        <div className="capacity-label">

                                            <span>
                                                Occupancy
                                            </span>

                                            <span>

                                                {
                                                    getOccupiedCapacity(
                                                        recommendedSite
                                                    )
                                                }

                                                {" / "}

                                                {
                                                    getTotalCapacity(
                                                        recommendedSite
                                                    ) ??
                                                    "--"
                                                }

                                            </span>

                                        </div>


                                        <div className="capacity-bar">

                                            <div
                                                className="capacity-fill"
                                                style={{
                                                    width:
                                                        getTotalCapacity(
                                                            recommendedSite
                                                        )
                                                            ? `${Math.min(
                                                                100,
                                                                (
                                                                    getOccupiedCapacity(
                                                                        recommendedSite
                                                                    ) /
                                                                    getTotalCapacity(
                                                                        recommendedSite
                                                                    )
                                                                ) *
                                                                100
                                                            )}%`
                                                            : "0%"
                                                }}
                                            />

                                        </div>

                                    </div>

                                )}


                                <button
                                    className="relocation-button full-width"
                                    onClick={() =>
                                        handleQuickAction(
                                            "/safe-routes"
                                        )
                                    }
                                >
                                    🛣️ View Safe Route
                                </button>

                            </div>

                        ) : (

                            <div className="empty-state">

                                <div>
                                    📍
                                </div>

                                <p>
                                    No specific relocation site
                                    recommendation is currently
                                    available.
                                </p>

                                <button
                                    className="secondary-action-button"
                                    onClick={() =>
                                        handleQuickAction(
                                            "/shelters"
                                        )
                                    }
                                >
                                    View Nearby Shelters
                                </button>

                            </div>

                        )}

                    </section>

                </div>


                {/* =================================================
                    WEATHER / ML INFORMATION
                ================================================= */}

                {dashboardData.weather && (

                    <div className="dashboard-section">

                        <div className="section-heading">

                            <div>

                                <h2>
                                    Current Environmental Conditions
                                </h2>

                                <p>
                                    Environmental data used by the
                                    disaster prediction model.
                                </p>

                            </div>

                        </div>


                        <div className="dashboard-cards">


                            {/* RAINFALL */}

                            <div className="dashboard-card">

                                <div className="card-icon">
                                    🌧️
                                </div>

                                <div>

                                    <h3>
                                        Rainfall
                                    </h3>

                                    <p className="card-number">

                                        {dashboardData.weather.rainfall ??
                                            "--"}

                                    </p>

                                    <span>
                                        mm
                                    </span>

                                </div>

                            </div>


                            {/* HUMIDITY */}

                            <div className="dashboard-card">

                                <div className="card-icon">
                                    💧
                                </div>

                                <div>

                                    <h3>
                                        Humidity
                                    </h3>

                                    <p className="card-number">

                                        {dashboardData.weather.humidity ??
                                            "--"}

                                    </p>

                                    <span>
                                        %
                                    </span>

                                </div>

                            </div>


                            {/* TEMPERATURE */}

                            <div className="dashboard-card">

                                <div className="card-icon">
                                    🌡️
                                </div>

                                <div>

                                    <h3>
                                        Temperature
                                    </h3>

                                    <p className="card-number">

                                        {dashboardData.weather.temperature ??
                                            "--"}

                                    </p>

                                    <span>
                                        °C
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                )}


                {/* =================================================
                    ML ERROR
                ================================================= */}

                {disasterError && (

                    <div className="location-error">

                        ⚠️ Disaster prediction:

                        {" "}

                        {disasterError}

                    </div>

                )}


                {/* =================================================
                    LIVE RISK MAP + SOS
                ================================================= */}

                <div className="map-sos-layout">


                    {/* MAP */}
>>>>>>> Stashed changes

                    {/* MAP */}

                    <section className="dashboard-section map-section">

                        <div className="section-heading">

                            <div>

                                <span className="section-label">
                                    SIH 191
                                </span>

                                <h2>
                                    Live Risk & Relocation Map
                                </h2>

                                <p>
                                    View hazard zones, vulnerable
                                    habitations, safer relocation
                                    sites and emergency resources
                                    around you.
                                </p>

                            </div>

                        </div>


                        <Map

                            location={location}

                            alerts={
                                dashboardData.alerts
                            }

                            hospitals={
                                dashboardData.hospitals
                            }

                            shelters={
                                dashboardData.shelters
                            }

                            hazardZones={
                                dashboardData.hazardZones
                            }

                            vulnerableHabitations={
                                dashboardData.vulnerableHabitations
                            }

                            relocationSites={
                                dashboardData.relocationSites
                            }

                        />

                    </section>


                    {/* SOS */}

                    <section className="dashboard-section sos-section">

                        <SOSCard

                            location={location}

                        />

                    </section>

                </div>


                {/* =====================================
                    QUICK ACTIONS
                ===================================== */}

                <section className="dashboard-section">

<<<<<<< Updated upstream
                    <div className="section-heading">

                        <div>

                            <h2>
                                Quick Actions
                            </h2>

                            <p>
                                Quickly access important
                                emergency services.
                            </p>

                        </div>

                    </div>
=======
                    <h2>
                        Emergency Actions
                    </h2>
>>>>>>> Stashed changes


                    <div className="quick-actions">


<<<<<<< Updated upstream
                        {/* SAFE ROUTES */}

=======
>>>>>>> Stashed changes
                        <div
                            className="quick-action-wrapper"
                            onClick={() =>
                                handleQuickAction(
                                    "/safe-routes"
                                )
                            }
                        >

                            <QuickActionCard

                                title="Safe Routes"

                                icon="🛣️"

                                path="/safe-routes"

                            />

                        </div>


                        {/* HOSPITALS */}

                        <div
                            className="quick-action-wrapper"
                            onClick={() =>
                                handleQuickAction(
                                    "/hospitals"
                                )
                            }
                        >

                            <QuickActionCard

                                title="Hospitals"

                                icon="🏥"

                                path="/hospitals"

                            />

                        </div>


                        {/* SHELTERS */}

                        <div
                            className="quick-action-wrapper"
                            onClick={() =>
                                handleQuickAction(
                                    "/shelters"
                                )
                            }
                        >

                            <QuickActionCard
<<<<<<< Updated upstream

                                title="Shelters"

=======
                                title="Safer Sites"
>>>>>>> Stashed changes
                                icon="🏠"

                                path="/shelters"

                            />

                        </div>


                        {/* RESOURCES */}

                        <div
                            className="quick-action-wrapper"
                            onClick={() =>
                                handleQuickAction(
                                    "/resources"
                                )
                            }
                        >

                            <QuickActionCard

                                title="Emergency Resources"

                                icon="📦"

                                path="/resources"

                            />

                        </div>

                        <div
                            className="quick-action-wrapper"
                            onClick={() =>
                                handleQuickAction("/volunteers")
                            }
                        >
                            <QuickActionCard
                                title="Volunteers & NGOs"
                                icon="🤝"
                                path="/volunteers"
                            />
                        </div>


                    </div>

                </section>


                {/* =====================================
                    DISASTER ALERTS
                ===================================== */}

                <section className="dashboard-section">

                    <div className="section-heading">

                        <div>

                            <h2>

                                Disaster Alerts

                            </h2>


                            <p>

                                Alerts affecting your area.

                            </p>

                        </div>

                    </div>


                    <div className="alerts-list">


                        {dashboardData.alerts.length === 0 && (

                            <p className="no-alerts">

                                No active alerts near
                                your location.

                            </p>

                        )}


                        {dashboardData.alerts.map(

                            (alert, index) => (

                                <DisasterAlert

                                    key={
                                        alert.id ||
                                        index
                                    }

                                    alert={alert}

                                />

                            )

                        )}

                    </div>

                </section>


            </main>

        </div>

    );

}


export default CitizenDashboard;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

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

            disasterRisk: null,
            weather: null,
            features: null
        });

    const [dataLoading, setDataLoading] =
        useState(false);

    const [disasterError, setDisasterError] =
        useState("");


    // =====================================================
    // EXTRACT ML RISK
    // =====================================================
    //
    // Your backend/ML can return:
    //
    // Option 1:
    // disasterRisk = {
    //     success: true,
    //     risk: "LOW",
    //     probability: 0.6607
    // }
    //
    // OR:
    //
    // Option 2:
    // disasterRisk = {
    //     success: true,
    //     prediction: {
    //         risk: "LOW",
    //         probability: 0.6607
    //     }
    // }
    //
    // This function supports BOTH.
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
    // FETCH DASHBOARD DATA
    // =====================================================

    const fetchDashboardData = async (
        latitude,
        longitude
    ) => {
        try {
            setDataLoading(true);
            setDisasterError("");

            const token =
                localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "No authentication token found. Please login again."
                );
            }


            console.log(
                "Fetching dashboard for:",
                latitude,
                longitude
            );


            // =================================================
            // CALL BACKEND
            // =================================================
            //
            // Backend is responsible for:
            //
            // 1. Getting weather from weather API
            // 2. Preparing ML features
            // 3. Calling Flask ML service
            // 4. Returning ML prediction
            //
            // Frontend only sends latitude + longitude.
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

            setDashboardData({

                activeAlerts:
                    data.activeAlerts ?? 0,

                nearbyHospitals:
                    data.nearbyHospitals ?? 0,

                nearbyShelters:
                    data.nearbyShelters ?? 0,

                riskLevel:
                    finalRisk,

                riskScore:
                    riskScore,

                alerts:
                    Array.isArray(data.alerts)
                        ? data.alerts
                        : [],

                hospitals:
                    Array.isArray(data.hospitals)
                        ? data.hospitals
                        : [],

                shelters:
                    Array.isArray(data.shelters)
                        ? data.shelters
                        : [],

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


            // =================================================
            // DEBUG INFORMATION
            // =================================================

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

        }

        catch (error) {

            console.error(
                "Dashboard API error:",
                error.response?.data ||
                error
            );


            const backendError =
                error.response?.data;


            setDisasterError(
                backendError?.message ||
                backendError?.error ||
                error.message ||
                "Unable to load dashboard data"
            );


            // Do NOT destroy previously loaded data.
            // Keep empty arrays safe for UI.

            setDashboardData({
                activeAlerts: 0,
                nearbyHospitals: 0,
                nearbyShelters: 0,

                riskLevel: "Unavailable",
                riskScore: 0,

                alerts: [],
                hospitals: [],
                shelters: [],

                disasterRisk: null,
                weather: null,
                features: null
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
        setDisasterError("");


        // =================================================
        // BROWSER SUPPORT
        // =================================================

        if (!navigator.geolocation) {

            setLocationError(
                "Geolocation is not supported by your browser."
            );

            setLocationLoading(false);

            return;
        }


        // =================================================
        // GET REAL GPS LOCATION
        // =================================================

        navigator.geolocation.getCurrentPosition(

            async (position) => {

                try {

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

                    console.log(
                        "Longitude:",
                        longitude
                    );

                    console.log(
                        "Accuracy:",
                        accuracy,
                        "meters"
                    );


                    // =================================================
                    // SAVE LOCATION
                    // =================================================

                    setLocation({
                        latitude,
                        longitude
                    });


                    setLocationAccuracy(
                        accuracy
                    );


                    setLocationLoading(false);


                    // =================================================
                    // FETCH EVERYTHING FROM BACKEND
                    // =================================================
                    //
                    // IMPORTANT:
                    //
                    // Only ONE API call is required.
                    //
                    // /api/dashboard
                    //
                    // Backend handles:
                    //
                    // GPS
                    // ↓
                    // Weather API
                    // ↓
                    // ML service
                    // ↓
                    // Dashboard response
                    //
                    // =================================================

                    await fetchDashboardData(
                        latitude,
                        longitude
                    );

                }

                catch (error) {

                    console.error(
                        "Location processing error:",
                        error
                    );

                    setLocationLoading(false);

                }

            },


            // =================================================
            // GEOLOCATION ERROR
            // =================================================

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


            // =================================================
            // GEOLOCATION OPTIONS
            // =================================================

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
    // QUICK ACTION
    // =====================================================

    const handleQuickAction = (path) => {
        navigate(path);
    };


    // =====================================================
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
            return String(risk).toUpperCase();
        }


        if (
            dashboardData.riskLevel &&
            dashboardData.riskLevel !== "Unknown"
        ) {
            return String(
                dashboardData.riskLevel
            ).toUpperCase();
        }


        return "Unknown";
    };



    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="dashboard-page">

            {/* =================================================
                NAVBAR
            ================================================= */}

            <Navbar />


            <main className="dashboard-container">

                {/* =================================================
                    WELCOME HEADER
                ================================================= */}

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


                {/* =================================================
                    LOCATION STATUS
                ================================================= */}

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


                    {location &&
                        !locationLoading && (

                            <div className="location-success">

                                <p>

                                    📍{" "}

                                    <strong>
                                        Location detected
                                    </strong>

                                </p>


                                <p>

                                    Latitude:{" "}

                                    {location.latitude.toFixed(
                                        6
                                    )}

                                </p>


                                <p>

                                    Longitude:{" "}

                                    {location.longitude.toFixed(
                                        6
                                    )}

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


                {/* =================================================
                    TOP DASHBOARD CARDS
                ================================================= */}

                <div className="dashboard-cards">

                    {/* =================================================
                        ACTIVE ALERTS
                    ================================================= */}

                    <AlertCard

                        count={
                            dataLoading
                                ? "..."
                                : dashboardData.activeAlerts
                        }

                        title="Active Alerts"

                        subtitle={
                            dashboardData.activeAlerts > 0
                                ? "Require your attention"
                                : "No active threats nearby"
                        }

                        severity = {
                            dashboardData.activeAlerts > 0
                                ? "danger"
                                : "safe"
                        }

                    />


                    {/* =================================================
                        HOSPITALS
                    ================================================= */}

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
                                    : (
                                        dashboardData?.nearbyHospitals ??
                                        dashboardData?.hospitals?.length ??
                                        0
                                    )
                                }

                            </p>


                            <span>
                                Near your location
                            </span>

                        </div>

                    </div>


                    {/* =================================================
                        SHELTERS
                    ================================================= */}

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
                                    : (
                                        dashboardData?.nearbyShelters ??
                                        dashboardData?.shelters?.length ??
                                        0
                                    )
                                }

                            </p>


                            <span>
                                Near your location
                            </span>

                        </div>

                    </div>


                    {/* =================================================
                        REAL ML RISK CARD
                    ================================================= */}

                    <RiskCard

                        riskLevel={
                            getRiskLevel()
                        }

                        riskScore={
                            getRiskScore()
                        }

                    />

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
                                    Data used by the disaster prediction model.
                                </p>

                            </div>

                        </div>


                        <div className="dashboard-cards">

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
                    MAP + SOS
                ================================================= */}

                <div className="map-sos-layout">

                    {/* =================================================
                        MAP
                    ================================================= */}

                    <section
                        className="dashboard-section map-section"
                    >

                        <div className="section-heading">

                            <div>

                                <h2>
                                    Live Risk Map
                                </h2>

                                <p>
                                    View disasters and emergency
                                    resources around you.
                                </p>

                            </div>

                        </div>


                        <Map

                            location={
                                location
                            }

                            alerts={
                                dashboardData.alerts
                            }

                            hospitals={
                                dashboardData.hospitals
                            }

                            shelters={
                                dashboardData.shelters
                            }

                        />

                    </section>


                    {/* =================================================
                        SOS
                    ================================================= */}

                    <section
                        className="dashboard-section sos-section"
                    >

                        <SOSCard
                            location={location}
                        />

                    </section>

                </div>


                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}

                <section
                    className="dashboard-section"
                >

                    <h2>
                        Quick Actions
                    </h2>


                    <div className="quick-actions">

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


                        <div
                            className="quick-action-wrapper"
                            onClick={() =>
                                handleQuickAction(
                                    "/shelters"
                                )
                            }
                        >

                            <QuickActionCard
                                title="Shelters"
                                icon="🏠"
                                path="/shelters"
                            />

                        </div>


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
                                handleQuickAction(
                                    "/volunteers"
                                )
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


                {/* =================================================
                    DISASTER ALERTS
                ================================================= */}

                <section
                    className="dashboard-section"
                >

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
                                        alert._id ||
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
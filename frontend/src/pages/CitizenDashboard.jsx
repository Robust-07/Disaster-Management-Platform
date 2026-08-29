import { useEffect, useState } from "react";
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

    const [disasterRisk, setDisasterRisk] = useState(null);


    // =====================================================
    // DASHBOARD DATA
    // =====================================================

    const [dashboardData, setDashboardData] = useState({

        activeAlerts: 0,

        nearbyHospitals: 0,

        nearbyShelters: 0,

        riskLevel: "Unknown",

        alerts: [],

        hospitals: [],

        shelters: []

    });


    const [dataLoading, setDataLoading] =
        useState(false);


    // =====================================================
    // CALL BACKEND
    // =====================================================

const fetchDashboardData = async (latitude, longitude) => {
    try {
        setDataLoading(true);

        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await api.get(
            `/api/dashboard?lat=${latitude}&lng=${longitude}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        // Axios already gives parsed JSON in response.data
        const data = response.data;

        console.log("Backend dashboard data:", data);

        setDashboardData({
            activeAlerts: data.activeAlerts ?? 0,

            nearbyHospitals:
                data.nearbyHospitals ?? 0,

            nearbyShelters:
                data.nearbyShelters ?? 0,

            riskLevel:
                data.riskLevel ?? "Unknown",

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
        });

    } catch (error) {

        console.error(
            "Dashboard API error:",
            error.response?.data || error
        );

        setDashboardData({
            activeAlerts: 0,
            nearbyHospitals: 0,
            nearbyShelters: 0,
            riskLevel: "Unavailable",
            alerts: [],
            hospitals: [],
            shelters: [],
        });

    } finally {
        setDataLoading(false);
    }
};

const fetchDisasterRisk = async () => {
    try {
        const response = await api.post(`/api/risk-zones/predict-disaster`, {
            rainfall: 50,
            river_level: 3,
            humidity: 80,
            temperature: 30,
            previous_floods: 2,
        });

        const data = response.data;
        console.log("Disaster ML response:", data);

        if (data.success) {
            setDisasterRisk(data);
        }
    } catch (error) {
        console.error("Disaster ML error:", error.response?.data || error.message);
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

                console.log(
                    "Longitude:",
                    longitude
                );

                console.log(
                    "Accuracy:",
                    accuracy,
                    "meters"
                );


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


                setLocationLoading(false);


                // -------------------------------------------------
                // FETCH LOCATION-BASED DATA
                // -------------------------------------------------

                fetchDashboardData(
                    latitude,
                    longitude
                );

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
        fetchDisasterRisk();

    }, []);


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="dashboard-page">


            {/* =========================================
                NAVBAR
            ========================================= */}

            <Navbar />


            <main className="dashboard-container">


                {/* =====================================
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
                            📍 <strong>Location detected</strong>
                        </p>

                        <p>
                            Latitude: {location.latitude.toFixed(6)}
                        </p>

                        <p>
                            Longitude: {location.longitude.toFixed(6)}
                        </p>

                        <p>
                            Accuracy: approximately{" "}
                            {Math.round(locationAccuracy)}m
                        </p>

                    </div>

                )}
                </div>


                {/* =====================================
                    TOP DASHBOARD CARDS
                ===================================== */}

                <div className="dashboard-cards">


                    <AlertCard

                        count={
                            dataLoading
                                ? "..."
                                : dashboardData.activeAlerts
                        }

                        title="Active Alerts"

                        subtitle="Near your location"

                    />


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

                                    : dashboardData
                                        .nearbyHospitals

                                }

                            </p>


                            <span>

                                Near your location

                            </span>

                        </div>

                    </div>


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

                                    : dashboardData
                                        .nearbyShelters

                                }

                            </p>


                            <span>

                                Near your location

                            </span>

                        </div>

                    </div>


                    <RiskCard
                        riskLevel={
                            dataLoading
                            ? "Loading..."
                                : disasterRisk?.success
                            ? disasterRisk.risk
                                : dashboardData.riskLevel
                        }
                        riskScore={
                            dataLoading
                                ? 0
                                : disasterRisk?.success
                            ? Math.round(disasterRisk.probability * 100)
                                : dashboardData.riskScore ?? 0
                            }
                    />

                </div>


                {/* =====================================
                    MAP + SOS
                ===================================== */}

                <div className="map-sos-layout">


                    {/* MAP */}

                    <section className="dashboard-section map-section">

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

                    <h2>

                        Quick Actions

                    </h2>


                    <div className="quick-actions">

                        <QuickActionCard

                            title="Safe Routes"

                            icon="🛣️"

                            path="/safe-routes"

                        />


                        <QuickActionCard

                            title="Hospitals"

                            icon="🏥"

                            path="/hospitals"

                        />


                        <QuickActionCard

                            title="Shelters"

                            icon="🏠"

                            path="/shelters"

                        />


                        <QuickActionCard

                            title="Emergency Resources"

                            icon="📦"

                            path="/resources"

                        />

                    </div>

                </section>


                {/* =====================================
                    DISASTER ALERTS
                ===================================== */}

                <section className="dashboard-section">
                    <div className="section-heading">
                        <div>
                            <h2>Disaster Alerts</h2>
                            <p>Alerts affecting your area.</p>
                        </div>
                    </div>
                    <div className="alerts-list">
                        {dashboardData.alerts.length === 0 && (
                            <p className="no-alerts">No active alerts near your location.</p>
                        )}
                        {dashboardData.alerts.map(
                            (alert, index) => (
                            <DisasterAlert
                                key={alert.id || index}
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
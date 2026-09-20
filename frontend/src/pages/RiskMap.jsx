import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Circle,
    Popup,
    useMap,
} from "react-leaflet";

import {
    Search,
    Layers,
    MapPin,
    AlertTriangle,
    Activity,
    ShieldCheck,
    RefreshCw,
} from "lucide-react";

import "leaflet/dist/leaflet.css";
import "./RiskMap.css";

import AuthorityLayout from "../components/AuthorityLayout";

const API_URL = "/api/risk-zones";

function MapController({ selectedZone }) {
    const map = useMap();

    useEffect(() => {
        if (
            selectedZone &&
            selectedZone.latitude != null &&
            selectedZone.longitude != null
        ) {
            map.flyTo(
                [selectedZone.latitude, selectedZone.longitude],
                13,
                {
                    duration: 1,
                }
            );
        }
    }, [selectedZone, map]);

    return null;
}

function RiskMap() {
    const [zones, setZones] = useState([]);
    const [selectedZone, setSelectedZone] = useState(null);

    const [riskFilter, setRiskFilter] = useState("All");
    const [hazardFilter, setHazardFilter] = useState("All");
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRiskZones = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Unable to fetch risk-zone data.");
            }

            const data = await response.json();

            const receivedZones = Array.isArray(data)
                ? data
                : data.zones || [];

            setZones(receivedZones);
        } catch (err) {
            console.error("Risk zone error:", err);
            setError(err.message);
            setZones([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRiskZones();
    }, []);

    const hazardTypes = [
        ...new Set(
            zones
                .map((zone) => zone.type)
                .filter(Boolean)
        ),
    ];

    const filteredZones = zones.filter((zone) => {
        const matchesRisk =
            riskFilter === "All" ||
            zone.risk === riskFilter;

        const matchesHazard =
            hazardFilter === "All" ||
            zone.type === hazardFilter;

        const searchText = search.toLowerCase().trim();

        const matchesSearch =
            !searchText ||
            zone.name?.toLowerCase().includes(searchText) ||
            zone.type?.toLowerCase().includes(searchText);

        return (
            matchesRisk &&
            matchesHazard &&
            matchesSearch
        );
    });

    const highRiskCount = zones.filter(
        (zone) => zone.risk === "High"
    ).length;

    const mediumRiskCount = zones.filter(
        (zone) => zone.risk === "Medium"
    ).length;

    const lowRiskCount = zones.filter(
        (zone) => zone.risk === "Low"
    ).length;

    const getRiskColor = (risk) => {
        switch (risk) {
            case "High":
                return "#ef4444";

            case "Medium":
                return "#f59e0b";

            case "Low":
                return "#22c55e";

            default:
                return "#2563eb";
        }
    };

    return (
        <AuthorityLayout>
        <div className="risk-page">

            
            {/* PAGE HEADER */}
            <div className="risk-header">

                <div>
                    <div className="page-label">
                        GIS INTELLIGENCE
                    </div>

                    <h1>
                        Risk & Hazard Map
                    </h1>

                    <p>
                        Monitor hazard exposure and AI-driven
                        risk intelligence across the region.
                    </p>
                </div>

                <button
                    className="refresh-button"
                    onClick={fetchRiskZones}
                >
                    <RefreshCw size={15} />
                    Refresh Data
                </button>

            </div>


            {/* STAT CARDS */}
            <div className="risk-stats">

                <div className="risk-stat-card">

                    <div className="stat-icon blue">
                        <Layers size={19} />
                    </div>

                    <div>
                        <span>Total Risk Zones</span>

                        <strong>
                            {loading ? "—" : zones.length}
                        </strong>
                    </div>

                </div>


                <div className="risk-stat-card">

                    <div className="stat-icon red">
                        <AlertTriangle size={19} />
                    </div>

                    <div>
                        <span>High Risk</span>

                        <strong>
                            {loading ? "—" : highRiskCount}
                        </strong>
                    </div>

                </div>


                <div className="risk-stat-card">

                    <div className="stat-icon orange">
                        <Activity size={19} />
                    </div>

                    <div>
                        <span>Medium Risk</span>

                        <strong>
                            {loading ? "—" : mediumRiskCount}
                        </strong>
                    </div>

                </div>


                <div className="risk-stat-card">

                    <div className="stat-icon green">
                        <ShieldCheck size={19} />
                    </div>

                    <div>
                        <span>Low Risk</span>

                        <strong>
                            {loading ? "—" : lowRiskCount}
                        </strong>
                    </div>

                </div>

            </div>


            {/* MAIN CONTENT */}
            <div className="risk-content">

                {/* MAP */}
                <div className="map-card">

                    <div className="map-toolbar">

                        <div className="search-box">
                            <Search size={17} />

                            <input
                                type="text"
                                placeholder="Search risk zones..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />
                        </div>


                        <select
                            value={riskFilter}
                            onChange={(e) =>
                                setRiskFilter(e.target.value)
                            }
                        >
                            <option value="All">
                                All Risk Levels
                            </option>

                            <option value="High">
                                High Risk
                            </option>

                            <option value="Medium">
                                Medium Risk
                            </option>

                            <option value="Low">
                                Low Risk
                            </option>
                        </select>


                        <select
                            value={hazardFilter}
                            onChange={(e) =>
                                setHazardFilter(e.target.value)
                            }
                        >
                            <option value="All">
                                All Hazards
                            </option>

                            {hazardTypes.map((type) => (
                                <option
                                    key={type}
                                    value={type}
                                >
                                    {type}
                                </option>
                            ))}
                        </select>

                    </div>


                    {/* MAP ALWAYS RENDERS */}
                    <div className="map-wrapper">

                        <MapContainer
                            center={[25.4358, 81.8463]}
                            zoom={12}
                            scrollWheelZoom={true}
                            className="risk-map"
                        >

                            <TileLayer
                                attribution="&copy; OpenStreetMap contributors"
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            <MapController
                                selectedZone={selectedZone}
                            />


                            {filteredZones.map((zone, index) => {

                                if (
                                    zone.latitude == null ||
                                    zone.longitude == null
                                ) {
                                    return null;
                                }

                                return (
                                    <Circle
                                        key={
                                            zone.id ||
                                            zone._id ||
                                            index
                                        }
                                        center={[
                                            Number(zone.latitude),
                                            Number(zone.longitude),
                                        ]}
                                        radius={
                                            Number(zone.radius) ||
                                            1500
                                        }
                                        pathOptions={{
                                            color: getRiskColor(
                                                zone.risk
                                            ),

                                            fillColor: getRiskColor(
                                                zone.risk
                                            ),

                                            fillOpacity: 0.22,

                                            weight: 2,
                                        }}
                                        eventHandlers={{
                                            click: () =>
                                                setSelectedZone(
                                                    zone
                                                ),
                                        }}
                                    >

                                        <Popup>

                                            <div className="popup-content">

                                                <strong>
                                                    {zone.name ||
                                                        "Risk Zone"}
                                                </strong>

                                                {zone.type && (
                                                    <span>
                                                        Hazard:{" "}
                                                        {zone.type}
                                                    </span>
                                                )}

                                                {zone.risk && (
                                                    <span>
                                                        Risk:{" "}
                                                        {zone.risk}
                                                    </span>
                                                )}

                                            </div>

                                        </Popup>

                                    </Circle>
                                );
                            })}

                        </MapContainer>


                        {/* EMPTY BACKEND STATE */}
                        {!loading &&
                            !error &&
                            zones.length === 0 && (
                                <div className="map-empty-message">

                                    <Activity size={24} />

                                    <strong>
                                        Waiting for risk intelligence
                                    </strong>

                                    <span>
                                        Risk zones will appear here
                                        when data is received from
                                        the backend.
                                    </span>

                                </div>
                            )}


                        {/* BACKEND ERROR */}
                        {!loading && error && (
                            <div className="map-error-message">

                                <AlertTriangle size={22} />

                                <strong>
                                    Risk data unavailable
                                </strong>

                                <span>
                                    The map is available, but
                                    risk intelligence could not
                                    be retrieved from the backend.
                                </span>

                                <button
                                    onClick={fetchRiskZones}
                                >
                                    Try Again
                                </button>

                            </div>
                        )}


                        {/* LEGEND */}
                        <div className="map-legend">

                            <div className="legend-title">
                                RISK LEVEL
                            </div>

                            <div>
                                <span className="legend-dot high"></span>
                                High
                            </div>

                            <div>
                                <span className="legend-dot medium"></span>
                                Medium
                            </div>

                            <div>
                                <span className="legend-dot low"></span>
                                Low
                            </div>

                        </div>

                    </div>

                </div>


                {/* SIDE PANEL */}
                <div className="zone-panel">

                    <div className="panel-heading">

                        <div>
                            <span>
                                AREA INTELLIGENCE
                            </span>

                            <h2>
                                {selectedZone?.name ||
                                    "Select a Risk Zone"}
                            </h2>
                        </div>

                        <MapPin size={20} />

                    </div>


                    {selectedZone ? (

                        <div className="zone-details">

                            {selectedZone.type && (
                                <div className="detail-row">

                                    <span>
                                        Hazard Type
                                    </span>

                                    <strong>
                                        {selectedZone.type}
                                    </strong>

                                </div>
                            )}


                            {selectedZone.risk && (
                                <div className="detail-row">

                                    <span>
                                        Risk Level
                                    </span>

                                    <strong
                                        style={{
                                            color:
                                                getRiskColor(
                                                    selectedZone.risk
                                                ),
                                        }}
                                    >
                                        {selectedZone.risk}
                                    </strong>

                                </div>
                            )}


                            {selectedZone.affectedPopulation != null && (
                                <div className="detail-row">

                                    <span>
                                        Affected Population
                                    </span>

                                    <strong>
                                        {Number(
                                            selectedZone.affectedPopulation
                                        ).toLocaleString()}
                                    </strong>

                                </div>
                            )}


                            {selectedZone.description && (
                                <div className="detail-description">
                                    {selectedZone.description}
                                </div>
                            )}

                        </div>

                    ) : (

                        <div className="empty-zone">

                            <div className="empty-icon">
                                <MapPin size={22} />
                            </div>

                            <strong>
                                No Area Selected
                            </strong>

                            <p>
                                Select a risk zone on the map
                                to view its intelligence.
                            </p>

                        </div>

                    )}

                </div>

            </div>

        </div>
    </AuthorityLayout>
    );
}

export default RiskMap;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import "./CreateRiskZone.css";

function CreateRiskZone() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        areaName: "",
        disasterType: "flood",
        riskLevel: "medium",
        description: "",
        latitude: "",
        longitude: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const getCurrentLocation = () => {
        setError("");

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData((prev) => ({
                    ...prev,
                    latitude: position.coords.latitude.toFixed(6),
                    longitude: position.coords.longitude.toFixed(6)
                }));
            },
            (err) => {
                console.error("Location error:", err);
                setError(
                    "Unable to get your current location. Please enter latitude and longitude manually."
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.areaName.trim()) {
            setError("Please enter the area name.");
            return;
        }

        if (!formData.latitude || !formData.longitude) {
            setError("Please enter latitude and longitude.");
            return;
        }

        const latitude = Number(formData.latitude);
        const longitude = Number(formData.longitude);

        if (
            Number.isNaN(latitude) ||
            Number.isNaN(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            setError("Please enter valid latitude and longitude values.");
            return;
        }

        try {
            setLoading(true);

            await api.post("/api/risk-zones", {
                areaName: formData.areaName.trim(),
                disasterType: formData.disasterType,
                riskLevel: formData.riskLevel,
                description: formData.description.trim(),
                latitude,
                longitude
            });

            setSuccess(
                "Risk zone created successfully. Citizens near this location will receive the alert."
            );

            setTimeout(() => {
                navigate("/authority-dashboard");
            }, 1500);
        } catch (err) {
            console.error(
                "Create risk zone error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Failed to create risk zone. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-risk-zone-page">

            <Navbar />

            <div className="risk-zone-container">

                <div className="risk-zone-header">
                    <div>
                        <h1>Create Risk Zone</h1>
                        <p>
                            Create an emergency risk zone and alert citizens
                            in the affected area.
                        </p>
                    </div>

                    <button
                        className="back-btn"
                        onClick={() => navigate("/authority-dashboard")}
                    >
                        ← Back
                    </button>
                </div>


                {error && (
                    <div className="risk-zone-message error-message">
                         {error}
                    </div>
                )}

                {success && (
                    <div className="risk-zone-message success-message">
                         {success}
                    </div>
                )}


                <form
                    className="risk-zone-form"
                    onSubmit={handleSubmit}
                >

                    {/* AREA NAME */}

                    <div className="form-group">
                        <label htmlFor="areaName">
                            Area Name <span>*</span>
                        </label>

                        <input
                            id="areaName"
                            type="text"
                            name="areaName"
                            value={formData.areaName}
                            onChange={handleChange}
                            placeholder="e.g. MNNIT Campus"
                            required
                        />
                    </div>


                    {/* DISASTER TYPE */}

                    <div className="form-row">

                        <div className="form-group">
                            <label htmlFor="disasterType">
                                Disaster Type <span>*</span>
                            </label>

                            <select
                                id="disasterType"
                                name="disasterType"
                                value={formData.disasterType}
                                onChange={handleChange}
                            >
                                <option value="flood"> Flood</option>
                                <option value="cyclone"> Cyclone</option>
                                <option value="earthquake"> Earthquake</option>
                                <option value="landslide"> Landslide</option>
                                <option value="storm"> Storm</option>
                                <option value="wildfire"> Wildfire</option>
                                <option value="other"> Other</option>
                            </select>
                        </div>


                        {/* RISK LEVEL */}

                        <div className="form-group">
                            <label htmlFor="riskLevel">
                                Risk Level <span>*</span>
                            </label>

                            <select
                                id="riskLevel"
                                name="riskLevel"
                                value={formData.riskLevel}
                                onChange={handleChange}
                            >
                                <option value="low">🟢 Low</option>
                                <option value="medium">🟡 Medium</option>
                                <option value="high">🟠 High</option>
                                <option value="critical">🔴 Critical</option>
                            </select>
                        </div>

                    </div>


                    {/* DESCRIPTION */}

                    <div className="form-group">
                        <label htmlFor="description">
                            Description
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the emergency situation, affected area, or instructions for citizens..."
                            rows="4"
                        />
                    </div>


                    {/* LOCATION */}

                    <div className="location-section">

                        <div className="location-title">
                            <div>
                                <h2> Risk Zone Location</h2>
                                <p>
                                    Enter the coordinates of the affected
                                    area.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="location-btn"
                                onClick={getCurrentLocation}
                            >
                                 Use My Location
                            </button>
                        </div>


                        <div className="form-row">

                            <div className="form-group">
                                <label htmlFor="latitude">
                                    Latitude <span>*</span>
                                </label>

                                <input
                                    id="latitude"
                                    type="number"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    placeholder="e.g. 25.4358"
                                    step="any"
                                    min="-90"
                                    max="90"
                                    required
                                />
                            </div>


                            <div className="form-group">
                                <label htmlFor="longitude">
                                    Longitude <span>*</span>
                                </label>

                                <input
                                    id="longitude"
                                    type="number"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    placeholder="e.g. 81.8463"
                                    step="any"
                                    min="-180"
                                    max="180"
                                    required
                                />
                            </div>

                        </div>


                        {formData.latitude && formData.longitude && (
                            <div className="coordinate-preview">
                                <span></span>

                                <div>
                                    <strong>Selected Location</strong>

                                    <p>
                                        {formData.latitude},{" "}
                                        {formData.longitude}
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>


                    {/* SUBMIT */}

                    <div className="form-actions">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() =>
                                navigate("/authority-dashboard")
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="create-zone-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating Risk Zone..."
                                :  " Create Risk Zone"}
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
}

export default CreateRiskZone;
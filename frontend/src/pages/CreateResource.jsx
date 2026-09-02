import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import "./AuthorityDashboard.css";

const RESOURCE_TYPES = ["food", "water", "medicine", "beds", "clothing", "other"];

function CreateResource() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        type: "food",
        quantity: "",
        latitude: "",
        longitude: "",
        transportAvailable: false,
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleUseMyLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setForm((prev) => ({
                    ...prev,
                    latitude: position.coords.latitude.toFixed(6),
                    longitude: position.coords.longitude.toFixed(6),
                }));
                toast.success("Location captured.");
            },
            () => toast.error("Could not get location.")
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.quantity || !form.latitude || !form.longitude) {
            setError("Quantity, latitude, and longitude are required.");
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                type: form.type,
                quantity: Number(form.quantity),
                latitude: Number(form.latitude),
                longitude: Number(form.longitude),
                transportAvailable: form.transportAvailable,
            };

            await api.post("/api/resources", payload);
            toast.success("Resource listed successfully.");
            navigate("/authority");
        } catch (err) {
            console.error("Create resource error:", err.response?.data || err.message);
            const message = err.response?.data?.message || "Failed to list resource.";
            setError(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="authority-page">
            <Navbar />
            <header className="authority-header">
                <div>
                    <h1>ResQ — List a Resource</h1>
                    <p>Add supplies available for allocation</p>
                </div>
                <button className="refresh-btn" onClick={() => navigate("/authority")}>
                    ← Back
                </button>
            </header>

            <main className="authority-list">
                <div className="sos-report-card">
                    {error && <p className="authority-error">⚠️ {error}</p>}

                    <form onSubmit={handleSubmit} className="sos-form">
                        <div className="field-row">
                            <div>
                                <label>Resource Type</label>
                                <select name="type" value={form.type} onChange={handleChange}>
                                    {RESOURCE_TYPES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    min="1"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="field-row">
                            <div>
                                <label>Latitude</label>
                                <input type="number" step="any" name="latitude" value={form.latitude} onChange={handleChange} required />
                            </div>
                            <div>
                                <label>Longitude</label>
                                <input type="number" step="any" name="longitude" value={form.longitude} onChange={handleChange} required />
                            </div>
                        </div>

                        <button type="button" className="cancel-assign" style={{ alignSelf: "flex-start" }} onClick={handleUseMyLocation}>
                            📍 Use My Current Location
                        </button>

                        <div className="checkbox-row">
                            <input
                                type="checkbox"
                                checked={form.transportAvailable}
                                onChange={(e) => setForm((prev) => ({ ...prev, transportAvailable: e.target.checked }))}
                            />
                            <label style={{ marginBottom: 0 }}>Transport available</label>
                        </div>

                        <button type="submit" className="assign-btn" disabled={submitting}>
                            {submitting ? "Listing..." : "List Resource"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default CreateResource;
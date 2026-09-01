import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./SOSForm.css";

function SOSForm() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        description: "",
        peopleCount: 1,
        injured_people: 0,
        critical_injuries: 0,
        children_elderly: 0,
        water_level: 0,
        building_damage: 0,
        hours_trapped: 0,
        communication_available: 1
    });

    const [photo, setPhoto] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.description.trim()) {
            setError("Please describe your emergency.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const position = await new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error("Geolocation not supported by your browser."));
                    return;
                }
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                });
            });

            const { latitude, longitude } = position.coords;

            const formData = new FormData();
            formData.append("description", form.description);
            formData.append("peopleCount", form.peopleCount);
            formData.append("injured_people", form.injured_people);
            formData.append("critical_injuries", form.critical_injuries);
            formData.append("children_elderly", form.children_elderly);
            formData.append("water_level", form.water_level);
            formData.append("building_damage", form.building_damage);
            formData.append("hours_trapped", form.hours_trapped);
            formData.append("communication_available", form.communication_available);
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);

            if (photo) {
                formData.append("photo", photo);
            }

            // Let axios set its own multipart boundary — don't set Content-Type manually
            const response = await api.post("/api/sos", formData, {
                headers: { "Content-Type": undefined }
            });

            // Pass the created report + accuracy forward to the status page
            navigate("/emergency", {
                state: {
                    sosReport: response.data.sosReport,
                    location: {
                        latitude,
                        longitude,
                        accuracy: Math.round(position.coords.accuracy)
                    }
                }
            });
        } catch (err) {
            console.error("SOS submit error:", err.response?.data || err.message);
            setError(
                err.response?.data?.message ||
                (err.message.includes("denied") || err.message.includes("Geolocation")
                    ? "Location access is required to send an SOS."
                    : "Failed to submit SOS. Please try again.")
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="emergency-page">
            <header className="emergency-header">
                <div>
                    <h1>ResQ</h1>
                    <p>Emergency SOS</p>
                </div>
                <button className="back-dashboard-btn" onClick={() => navigate("/dashboard")}>
                    ← Dashboard
                </button>
            </header>

            <main className="emergency-container">
                <section className="emergency-card">
                    <h2>Describe your emergency</h2>

                    {error && <p className="location-error">⚠️ {error}</p>}

                    <form onSubmit={handleSubmit} className="sos-form">
    <div>
        <label>What's happening?</label>
        <textarea
            name="description"
            placeholder="e.g. Trapped on second floor, building partially collapsed"
            value={form.description}
            onChange={handleChange}
            required
        />
    </div>

    <div className="field-row">
        <div>
            <label>People trapped</label>
            <input type="number" name="peopleCount" min="1" value={form.peopleCount} onChange={handleChange} />
        </div>
        <div>
            <label>Injured people</label>
            <input type="number" name="injured_people" min="0" value={form.injured_people} onChange={handleChange} />
        </div>
    </div>

    <div className="field-row">
        <div>
            <label>Critical injuries</label>
            <input type="number" name="critical_injuries" min="0" value={form.critical_injuries} onChange={handleChange} />
        </div>
        <div>
            <label>Children / elderly present</label>
            <input type="number" name="children_elderly" min="0" value={form.children_elderly} onChange={handleChange} />
        </div>
    </div>

    <div className="field-row">
        <div>
            <label>Water level (0 = none)</label>
            <input type="number" name="water_level" min="0" value={form.water_level} onChange={handleChange} />
        </div>
        <div>
            <label>Building damage (0–10)</label>
            <input type="number" name="building_damage" min="0" max="10" value={form.building_damage} onChange={handleChange} />
        </div>
    </div>

    <div>
        <label>Hours trapped</label>
        <input type="number" name="hours_trapped" min="0" value={form.hours_trapped} onChange={handleChange} />
    </div>

    <div className="checkbox-row">
        <input
            type="checkbox"
            checked={form.communication_available === 1}
            onChange={(e) =>
                setForm((prev) => ({
                    ...prev,
                    communication_available: e.target.checked ? 1 : 0
                }))
            }
        />
        <label style={{ marginBottom: 0 }}>I have a working phone</label>
    </div>

    <div>
        <label>Photo (optional)</label>
        <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
    </div>

    <button type="submit" disabled={submitting}>
        {submitting ? "Sending..." : "🚨 Submit SOS"}
    </button>
</form>

                </section>
            </main>
        </div>
    );
}

export default SOSForm;
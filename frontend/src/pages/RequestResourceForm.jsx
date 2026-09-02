import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./Emergency.css"; // reuse form styling from earlier
import "./RequestResource.css"; // specific styling for this form

const RESOURCE_TYPES = ["food", "water", "medicine", "beds", "clothing", "other"];
const URGENCY_LEVELS = ["low", "medium", "high", "critical"];

function RequestResourceForm() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        campName: "",
        type: "food",
        quantityNeeded: "",
        population: "",
        peoplePerUnit: 1,
        currentStock: 0,
        dailyConsumption: 0,
        incomingSupply: 0,
        consumptionRatePerHour: 0,
        urgency: "medium",
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.campName.trim() || !form.quantityNeeded || !form.population) {
            setError("Camp name, quantity needed, and population are required.");
            return;
        }

        setSubmitting(true);

        try {
            const position = await new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error("Geolocation not supported."));
                    return;
                }
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 15000,
                });
            });

            const { latitude, longitude } = position.coords;

            const payload = {
                campName: form.campName.trim(),
                type: form.type,
                quantityNeeded: Number(form.quantityNeeded),
                population: Number(form.population),
                peoplePerUnit: Number(form.peoplePerUnit),
                currentStock: Number(form.currentStock),
                dailyConsumption: Number(form.dailyConsumption),
                incomingSupply: Number(form.incomingSupply),
                consumptionRatePerHour: Number(form.consumptionRatePerHour),
                urgency: form.urgency,
                latitude,
                longitude,
            };

            const response = await api.post("/api/resource-requests", payload);

            toast.success("Resource request submitted.");
            navigate("/resources", {
                state: { newRequest: response.data.request, shortagePrediction: response.data.shortagePrediction },
            });
        } catch (err) {
            console.error("Resource request error:", err.response?.data || err.message);
            const message = err.response?.data?.message || "Failed to submit request.";
            setError(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="emergency-page">
            <header className="emergency-header">
                <div>
                    <h1>ResQ</h1>
                    <p>Request Resources</p>
                </div>
                <button className="back-dashboard-btn" onClick={() => navigate("/resources")}>
                    ← Resources
                </button>
            </header>

            <main className="emergency-container">
                <section className="emergency-card">
                    <h2>Tell us what your camp needs</h2>

                    {error && <p className="location-error">⚠️ {error}</p>}

                    <form onSubmit={handleSubmit} className="sos-form">
                        <div>
                            <label>Camp / Location Name</label>
                            <input
                                type="text"
                                name="campName"
                                placeholder="e.g. Relief Camp - VG Mall"
                                value={form.campName}
                                onChange={handleChange}
                                required
                            />
                        </div>

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
                                <label>Quantity Needed</label>
                                <input
                                    type="number"
                                    name="quantityNeeded"
                                    min="1"
                                    value={form.quantityNeeded}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="field-row">
                            <div>
                                <label>People at Camp</label>
                                <input
                                    type="number"
                                    name="population"
                                    min="1"
                                    value={form.population}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label>People per Unit</label>
                                <input
                                    type="number"
                                    name="peoplePerUnit"
                                    min="1"
                                    value={form.peoplePerUnit}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="field-row">
                            <div>
                                <label>Current Stock</label>
                                <input type="number" name="currentStock" min="0" value={form.currentStock} onChange={handleChange} />
                            </div>
                            <div>
                                <label>Daily Consumption</label>
                                <input type="number" name="dailyConsumption" min="0" value={form.dailyConsumption} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="field-row">
                            <div>
                                <label>Incoming Supply</label>
                                <input type="number" name="incomingSupply" min="0" value={form.incomingSupply} onChange={handleChange} />
                            </div>
                            <div>
                                <label>Urgency</label>
                                <select name="urgency" value={form.urgency} onChange={handleChange}>
                                    {URGENCY_LEVELS.map((u) => (
                                        <option key={u} value={u}>{u}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button type="submit" disabled={submitting}>
                            {submitting ? "Submitting..." : "Submit Request"}
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
}

export default RequestResourceForm;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io as socketIO } from "socket.io-client";
import api from "../api/axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import "./AuthorityDashboard.css";

function ResourceRequestsDashboard() {
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [matchingId, setMatchingId] = useState(null); // which request's matches are open
    const [matches, setMatches] = useState([]);
    const [matchLoading, setMatchLoading] = useState(false);

    const [allocatingResourceId, setAllocatingResourceId] = useState(null);
    const [allocateQty, setAllocateQty] = useState("");

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await api.get("/api/resource-requests");
            setRequests(response.data.requests || []);
        } catch (err) {
            console.error("Fetch resource requests error:", err.response?.data || err.message);
            setError(
                err.response?.data?.message ||
                "Failed to load resource requests. Are you logged in as authority/NGO?"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();

        const socket = socketIO(import.meta.env.VITE_API_URL || "http://localhost:5000");

        socket.on("resource-allocated", () => {
            // Refresh so quantityFulfilled/status reflect the change live
            fetchRequests();
        });

        return () => socket.disconnect();
    }, []);

    const handleFindMatches = async (requestId) => {
        setMatchingId(requestId);
        setMatches([]);
        setMatchLoading(true);
        setAllocatingResourceId(null);

        try {
            const response = await api.post("/api/resources/match", { requestId });
            setMatches(response.data.matches || []);
            if ((response.data.matches || []).length === 0) {
                toast("No available resources of this type right now.", { icon: "ℹ️" });
            }
        } catch (err) {
            console.error("Match resources error:", err.response?.data || err.message);
            toast.error(err.response?.data?.message || "Failed to find matches.");
        } finally {
            setMatchLoading(false);
        }
    };

    const handleAllocate = async (requestId, resourceId, maxQuantity) => {
        const qty = Number(allocateQty);

        if (!qty || qty <= 0) {
            toast.error("Enter a valid quantity to allocate.");
            return;
        }
        if (qty > maxQuantity) {
            toast.error(`Only ${maxQuantity} units available from this provider.`);
            return;
        }

        try {
            await api.post("/api/resources/allocate", {
                requestId,
                resourceId,
                quantityAllocated: qty,
            });
            toast.success("Resource allocated successfully.");
            setAllocatingResourceId(null);
            setAllocateQty("");
            setMatchingId(null);
            setMatches([]);
            fetchRequests();
        } catch (err) {
            console.error("Allocate error:", err.response?.data || err.message);
            toast.error(err.response?.data?.message || "Failed to allocate resource.");
        }
    };

    const urgencyColor = (urgency) => {
        switch (urgency) {
            case "critical": return "#e63946";
            case "high": return "#f4784b";
            case "medium": return "#f1b13c";
            default: return "#4caf82";
        }
    };

    const shortageColor = (status) => {
        switch (status) {
            case "CRITICAL": return "#e63946";
            case "WARNING": return "#f4784b";
            case "MONITOR": return "#f1b13c";
            case "SAFE": return "#4caf82";
            default: return "#999";
        }
    };

    if (loading) return <div className="authority-page"><p>Loading resource requests...</p></div>;

    return (
        <div className="authority-page">
            <Navbar />
            <header className="authority-header">
                <div>
                    <h1>ResQ — Resource Requests</h1>
                    <p>Camp needs & shortage status</p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button className="refresh-btn" onClick={() => navigate("/authority")}>
                        ← SOS Dashboard
                    </button>
                    <button className="refresh-btn" onClick={fetchRequests}>⟳ Refresh</button>
                </div>
            </header>

            {error && <p className="authority-error">⚠️ {error}</p>}

            <main className="authority-list">
                {requests.length === 0 && !error && <p>No resource requests yet.</p>}

                {requests.map((req) => (
                    <div className="sos-report-card" key={req._id}>
                        <div className="sos-report-top">
                            <span
                                className="severity-badge"
                                style={{ background: urgencyColor(req.urgency) }}
                            >
                                {req.urgency?.toUpperCase()}
                            </span>
                            <span className={`status-pill status-${req.status}`}>
                                {req.status}
                            </span>
                        </div>

                        <p className="sos-description">
                            <strong>{req.campName}</strong> needs <strong>{req.quantityNeeded} {req.type}</strong>
                            {" "}({req.quantityFulfilled}/{req.quantityNeeded} fulfilled)
                        </p>

                        <div className="sos-meta-grid">
                            <div><span>Requester</span><strong>{req.requesterId?.name || "Unknown"}</strong></div>
                            <div><span>Population</span><strong>{req.population}</strong></div>
                            <div><span>Current stock</span><strong>{req.currentStock}</strong></div>
                            <div><span>Daily consumption</span><strong>{req.dailyConsumption}</strong></div>
                        </div>

                        {req.shortageStatus && (
                            <div
                                className="shortage-banner"
                                style={{ borderColor: shortageColor(req.shortageStatus) }}
                            >
                                <span style={{ color: shortageColor(req.shortageStatus), fontWeight: 700 }}>
                                    {req.shortageStatus}
                                </span>
                                {" — "}
                                {req.shortageHours != null
                                    ? `~${req.shortageHours} hours until shortage`
                                    : "shortage estimate unavailable"}
                                {req.isShortageMlPredicted && (
                                    <span className="ml-tag"> (ML predicted)</span>
                                )}
                            </div>
                        )}

                        <div className="sos-actions">
                            {req.status !== "fulfilled" && (
                                <button
                                    className="assign-btn"
                                    onClick={() => handleFindMatches(req._id)}
                                >
                                    Find Matching Resources
                                </button>
                            )}
                        </div>

                        {matchingId === req._id && (
                            <div className="matches-panel">
                                {matchLoading ? (
                                    <p>Searching for matches...</p>
                                ) : matches.length === 0 ? (
                                    <p>No available resources of this type nearby.</p>
                                ) : (
                                    matches.map((m) => (
                                        <div className="match-row" key={m.resourceId}>
                                            <div>
                                                <strong>{m.quantity} units</strong> available
                                                {m.transportAvailable && " · 🚚 transport available"}
                                                <br />
                                                <small>
                                                    ~{m.distanceKm?.toFixed(1)} km away · match score {m.score?.toFixed(2)}
                                                </small>
                                            </div>

                                            {allocatingResourceId === m.resourceId ? (
                                                <div className="assign-form">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={m.quantity}
                                                        placeholder="Qty"
                                                        value={allocateQty}
                                                        onChange={(e) => setAllocateQty(e.target.value)}
                                                    />
                                                    <button
                                                        onClick={() => handleAllocate(req._id, m.resourceId, m.quantity)}
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        className="cancel-assign"
                                                        onClick={() => { setAllocatingResourceId(null); setAllocateQty(""); }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="progress-btn"
                                                    onClick={() => setAllocatingResourceId(m.resourceId)}
                                                >
                                                    Allocate
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                                <button
                                    className="cancel-assign"
                                    style={{ marginTop: "10px" }}
                                    onClick={() => { setMatchingId(null); setMatches([]); }}
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </main>
        </div>
    );
}

export default ResourceRequestsDashboard;
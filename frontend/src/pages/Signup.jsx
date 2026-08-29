import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "citizen",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validateForm = () => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const phoneRegex = /^[6-9]\d{9}$/;

        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address");
            return false;
        }
        if (!phoneRegex.test(formData.phone)) {
            setError("Please enter a valid 10-digit phone number");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!validateForm()) return;

        try {
            const response = await fetch("http://localhost:5000/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Registration failed");
                setLoading(false);
                return;
            }

            // Store the token — same pattern as Login.jsx
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            toast.success(`Welcome back, ${data.user.name}!`);
            navigate("/dashboard");

        } catch (error) {
            console.error("Signup error:", error);
            setError("Unable to connect to backend");
            setLoading(false);
            toast.error(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="auth-page">
            {/* LEFT SIDE - unchanged */}
            <div className="auth-left">
                <div className="resq-brand">
                    <h2>ResQ</h2>
                    <span>Emergency Response & Relief Platform</span>
                </div>
                <div className="hero-content">
                    <h1>One Platform.<br />One Response.</h1>
                    <p>ResQ brings citizens, rescuers, authorities, NGOs and volunteers together for coordinated disaster response.</p>
                </div>
                <div className="footer-text">जन सेवा • आपदा प्रबंधन • सुरक्षित भारत</div>
            </div>

            {/* RIGHT SIDE */}
            <div className="auth-right">
                <div className="auth-card signup-card">
                    <div className="card-header">
                        <h1>Create Account</h1>
                        <p>Register with ResQ</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" name="name" placeholder="Enter your full name"
                                value={formData.name} onChange={handleChange} required />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" name="email" placeholder="Enter your email"
                                    value={formData.email} onChange={handleChange} 
                                    pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                                    title="Enter a valid email address (e.g. name@example.com)" required />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="tel" name="phone" placeholder="Enter phone number"
                                    value={formData.phone} onChange={handleChange}
                                    pattern="[6-9][0-9]{9}"
                                    title="Enter a valid 10-digit Indian mobile number"
                                    maxLength="10" required 
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" name="password" placeholder="Minimum 6 characters"
                                value={formData.password} onChange={handleChange} minLength="6" required />
                        </div>

                        <div className="form-group">
                            <label>Account Type</label>
                            <select name="role" value={formData.role} onChange={handleChange}>
                                <option value="citizen">Citizen</option>
                                <option value="rescuer">Rescuer</option>
                                <option value="authority">Authority</option>
                                <option value="ngo">NGO</option>
                                <option value="volunteer">Volunteer</option>
                            </select>
                        </div>

                        {error && <p className="error-text">{error}</p>}

                        <button type="submit" className="primary-button" disabled={loading}>
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>

                    <div className="auth-switch">
                        <p>Already have an account? <Link to="/login">Sign In</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
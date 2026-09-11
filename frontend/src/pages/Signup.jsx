import { useState } from "react";
import { Link } from "react-router-dom";

function Signup() {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "citizen",
    });
<<<<<<< Updated upstream
=======

    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
>>>>>>> Stashed changes

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        setError("");
    };

<<<<<<< Updated upstream
    const handleSubmit = (e) => {
=======
    const validateForm = () => {
        const emailRegex =
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        const phoneRegex = /^[6-9]\d{9}$/;

        if (!formData.name.trim()) {
            setError("Please enter your full name");
            return false;
        }

        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address");
            return false;
        }

        if (!phoneRegex.test(formData.phone)) {
            setError("Please enter a valid 10-digit phone number");
            return false;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return false;
        }

        return true;
    };

    // STEP 1: Send OTP
    const handleSendOTP = async () => {
        setError("");

        if (!validateForm()) return;

        setOtpLoading(true);

        try {
            const response = await api.post("/api/auth/send-otp", {
                email: formData.email,
            });

            toast.success(
                response.data?.message || "OTP sent to your email"
            );

            setOtpSent(true);
        } catch (error) {
            console.error(
                "Send OTP error:",
                error.response?.data || error.message
            );

            const message =
                error.response?.data?.message ||
                "Unable to send OTP. Please try again.";

            setError(message);
            toast.error(message);
        } finally {
            setOtpLoading(false);
        }
    };

    // STEP 2: Verify OTP
    const handleVerifyOTP = async () => {
        setError("");

        if (!otp || otp.length !== 6) {
            setError("Please enter the 6-digit OTP");
            return;
        }

        setOtpLoading(true);

        try {
            const response = await api.post("/api/auth/verify-otp", {
                email: formData.email,
                otp: otp,
            });

            toast.success(
                response.data?.message || "Email verified successfully"
            );

            setOtpVerified(true);
        } catch (error) {
            console.error(
                "Verify OTP error:",
                error.response?.data || error.message
            );

            const message =
                error.response?.data?.message ||
                "Invalid or expired OTP";

            setError(message);
            toast.error(message);
        } finally {
            setOtpLoading(false);
        }
    };

    // STEP 3: Create Account
    const handleSubmit = async (e) => {
>>>>>>> Stashed changes
        e.preventDefault();

<<<<<<< Updated upstream
        // Temporary frontend-only signup
        localStorage.setItem("userName", formData.name);
        localStorage.setItem("userEmail", formData.email);

        console.log("Signup submitted:", formData);
=======
        if (!otpVerified) {
            setError("Please verify your email with OTP first");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(
                "/api/auth/signup",
                formData
            );

            const data = response.data;

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            toast.success(`Welcome, ${data.user.name}!`);

            navigate("/dashboard");
        } catch (error) {
            console.error(
                "Signup error:",
                error.response?.data || error.message
            );

            const message =
                error.response?.data?.message ||
                "Unable to create account. Please try again.";

            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
>>>>>>> Stashed changes
    };

    return (
        <div className="auth-page">

            {/* LEFT SIDE */}
            <div className="auth-left">

                <div className="resq-brand">
<<<<<<< Updated upstream
            <h2>ResQ</h2>
            <span>Emergency Response & Relief Platform</span>
</div>


                <div className="hero-content">

=======
                    <h2>ResQ</h2>
                    <span>
                        Emergency Response & Relief Platform
                    </span>
                </div>

                <div className="hero-content">
>>>>>>> Stashed changes
                    <h1>
                        One Platform.
                        <br />
                        One Response.
                    </h1>

                    <p>
<<<<<<< Updated upstream
                        ResQ brings citizens, rescuers,
                        authorities, NGOs and volunteers together
                        for coordinated disaster response.
                    </p>

                </div>


                <div className="footer-text">
                    जन सेवा • आपदा प्रबंधन • सुरक्षित भारत
                </div>

=======
                        ResQ brings citizens, rescuers, authorities,
                        NGOs and volunteers together for coordinated
                        disaster response.
                    </p>
                </div>

                <div className="footer-text">
                    जन सेवा • आपदा प्रबंधन • सुरक्षित भारत
                </div>
>>>>>>> Stashed changes
            </div>


            {/* RIGHT SIDE */}
            <div className="auth-right">

                <div className="auth-card signup-card">

                    <div className="card-header">

                        <h1>Create Account</h1>

                        <p>
                            Register with ResQ
                        </p>

                    </div>


                    <form onSubmit={handleSubmit}>

                        {/* NAME */}
<<<<<<< Updated upstream

                        <div className="form-group">

                            <label>
                                Full Name
                            </label>
=======
                        <div className="form-group">
                            <label>Full Name</label>
>>>>>>> Stashed changes

                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
<<<<<<< Updated upstream

                        </div>


                        {/* EMAIL + PHONE */}

                        <div className="form-row">

                            <div className="form-group">

                                <label>
                                    Email Address
                                </label>
=======
                        </div>

                        {/* EMAIL + PHONE */}
                        <div className="form-row">

                            <div className="form-group">
                                <label>Email Address</label>
>>>>>>> Stashed changes

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
<<<<<<< Updated upstream
=======
                                    pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                                    title="Enter a valid email address"
>>>>>>> Stashed changes
                                    required
                                />

                            </div>

<<<<<<< Updated upstream

                            <div className="form-group">

                                <label>
                                    Phone Number
                                </label>
=======
                            <div className="form-group">
                                <label>Phone Number</label>
>>>>>>> Stashed changes

                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
<<<<<<< Updated upstream
                                    required
                                />

=======
                                    pattern="[6-9][0-9]{9}"
                                    title="Enter a valid 10-digit Indian mobile number"
                                    maxLength="10"
                                    required
                                />
>>>>>>> Stashed changes
                            </div>

                        </div>

<<<<<<< Updated upstream

                        {/* PASSWORD */}
=======
                        {/* PASSWORD */}
                        <div className="form-group">
                            <label>Password</label>

                            <input
                                type="password"
                                name="password"
                                placeholder="Minimum 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                minLength="6"
                                required
                            />
                        </div>
>>>>>>> Stashed changes

                        {/* ACCOUNT TYPE */}
                        <div className="form-group">
<<<<<<< Updated upstream

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                placeholder="Minimum 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                minLength="6"
                                required
                            />

                        </div>


                        {/* ROLE */}

                        <div className="form-group">

                            <label>
                                Account Type
                            </label>
=======
                            <label>Account Type</label>
>>>>>>> Stashed changes

                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            >
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
                                <option value="citizen">
                                    Citizen
                                </option>

                                <option value="rescuer">
                                    Rescuer
                                </option>

                                <option value="authority">
                                    Authority
                                </option>

                                <option value="ngo">
                                    NGO
                                </option>

                                <option value="volunteer">
                                    Volunteer
                                </option>
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
                            </select>

                        </div>

<<<<<<< Updated upstream


                        <button
                            type="submit"
                            className="primary-button"
                        >
                            Create Account
                        </button>

=======
                        {/* SEND OTP BUTTON */}
                        {!otpSent && (
                            <button
                                type="button"
                                className="primary-button"
                                onClick={handleSendOTP}
                                disabled={otpLoading}
                            >
                                {otpLoading
                                    ? "Sending OTP..."
                                    : "Send OTP"}
                            </button>
                        )}

                        {/* OTP SECTION */}
                        {otpSent && !otpVerified && (
                            <div className="otp-section">

                                <div className="otp-message">
                                    <p>
                                        We've sent a 6-digit OTP to
                                    </p>

                                    <strong>
                                        {formData.email}
                                    </strong>
                                </div>

                                <div className="form-group">
                                    <label>Enter OTP</label>

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength="6"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => {
                                            const value =
                                                e.target.value.replace(
                                                    /\D/g,
                                                    ""
                                                );

                                            setOtp(value);
                                            setError("");
                                        }}
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={handleVerifyOTP}
                                    disabled={
                                        otpLoading ||
                                        otp.length !== 6
                                    }
                                >
                                    {otpLoading
                                        ? "Verifying..."
                                        : "Verify OTP"}
                                </button>

                                <button
                                    type="button"
                                    className="resend-button"
                                    onClick={handleSendOTP}
                                    disabled={otpLoading}
                                >
                                    Resend OTP
                                </button>

                            </div>
                        )}

                        {/* VERIFIED MESSAGE */}
                        {otpVerified && (
                            <div className="otp-verified">
                                ✓ Email verified successfully
                            </div>
                        )}

                        {/* CREATE ACCOUNT */}
                        {otpVerified && (
                            <button
                                type="submit"
                                className="primary-button"
                                disabled={loading}
                            >
                                {loading
                                    ? "Creating account..."
                                    : "Create Account"}
                            </button>
                        )}

                        {/* ERROR */}
                        {error && (
                            <p className="error-text">
                                {error}
                            </p>
                        )}

>>>>>>> Stashed changes
                    </form>


                    <div className="auth-switch">
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
                        <p>
                            Already have an account?{" "}
                            <Link to="/login">
                                Sign In
                            </Link>
                        </p>
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Signup;
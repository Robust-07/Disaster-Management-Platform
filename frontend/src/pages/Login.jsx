import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
    e.preventDefault();

    // Temporary frontend-only login

    const storedEmail = localStorage.getItem("userEmail");
    const storedName = localStorage.getItem("userName");

    if (storedEmail === email && storedName) {

        navigate("/citizen-dashboard");

    } else {

        // Temporary fallback
        // If no signup data exists, use email prefix
        localStorage.setItem(
            "userName",
            email.split("@")[0]
        );

        localStorage.setItem(
            "userEmail",
            email
        );

        navigate("/citizen-dashboard");
    }
};

    return (
        <div className="auth-page">

            {/* LEFT SIDE */}
            <div className="auth-left">

                <div className="resq-brand">
                <h2>ResQ</h2>
                <span>Emergency Response & Relief Platform</span>
        </div>

                <div className="hero-content">

                    <h1>
                        Emergency Response
                        <br />
                        & Relief Platform
                    </h1>

                    <p>
                        A unified platform connecting citizens,
                        rescuers, authorities, NGOs and volunteers
                        for faster and coordinated emergency response.
                    </p>

                </div>

                <div className="footer-text">
                    जन सेवा • आपदा प्रबंधन • सुरक्षित भारत
                </div>

            </div>


            {/* RIGHT SIDE */}
            <div className="auth-right">

                <div className="auth-card">

                    <div className="card-header">

                        <h1>Welcome Back</h1>

                        <p>
                            Sign in to your ResQ account
                        </p>

                    </div>


                    <form onSubmit={handleSubmit}>

                        <div className="form-group">

                            <label>
                                Email Address
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />

                        </div>


                        <button
                            type="submit"
                            className="primary-button"
                        >
                            Sign In
                        </button>

                    </form>


                    <div className="auth-switch">

                        <p>
                            Don't have an account?{" "}
                            <Link to="/signup">
                                Create an account
                            </Link>
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;
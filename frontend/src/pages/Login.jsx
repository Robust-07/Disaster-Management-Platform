import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        return false;
    }
    return true;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/api/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-left">
        <div className="resq-brand">
          <h2>ResQ</h2>
          <span>Emergency Response & Relief Platform</span>
        </div>

        <div className="hero-content">
          <h1>
            One Platform.
            <br />
            One Response.
          </h1>
          <p>
            ResQ brings citizens, rescuers, authorities, NGOs and volunteers
            together for coordinated disaster response.
          </p>
        </div>

        <div className="footer-text">जन सेवा • आपदा प्रबंधन • सुरक्षित भारत</div>
      </div>

      <div className="auth-right">
        <div className="auth-card login-card">
          <div className="card-header">
            <h1>Welcome Back</h1>
            <p>Log in to ResQ</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="primary-button">
              Log In
            </button>
          </form>

          <div className="auth-switch">
            <p>
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Login;
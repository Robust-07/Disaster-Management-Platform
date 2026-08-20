import React from "react";
import "./Home.css";

function Home() {
  return (
    <div className="home">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          ResQ
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-buttons">
          <a href="/login" className="login-btn">
            Login
          </a>

          <a href="/signup" className="signup-btn">
            Sign Up
          </a>
        </div>
      </nav>


      {/* Hero Section */}
      <section className="hero">

        <div className="hero-content">

          <p className="hero-label">
            SMART DISASTER RESPONSE PLATFORM
          </p>

          <h1>
            Predict. Respond. <span>Rescue.</span>
          </h1>

          <p className="hero-description">
            An intelligent disaster-response platform connecting
            citizens, rescue teams, healthcare, resources and
            volunteers when every second matters.
          </p>

          <div className="hero-buttons">
            <a href="/signup" className="primary-btn">
              Get Started
            </a>

            <a href="#features" className="secondary-btn">
              Explore Features
            </a>
          </div>

        </div>


        {/* Hero visual */}
        <div className="hero-visual">

          <div className="map-card">

            <div className="map-header">
          <span>Intelligent Risk Mapping</span>
          <span className="live">RISK PREVIEW</span>
          </div>

            <div className="map-area">

              <div className="risk-zone zone-one"></div>
              <div className="risk-zone zone-two"></div>
              <div className="location-point point-one"></div>
              <div className="location-point point-two"></div>
              <div className="location-point point-three"></div>

            </div>

            <div className="map-footer">
              <span>🔴 High Risk</span>
              <span>🟠 Moderate</span>
              <span>🟢 Safe</span>
            </div>

          </div>

        </div>

      </section>


      {/* Emergency Alert */}
      <section className="alert-section">

        <div className="alert-icon">
          ⚠️
        </div>

        <div>
          <strong>Stay Alert. Stay Safe.</strong>
          <p>
            Get real-time disaster alerts and safety information
            for your location.
          </p>
        </div>

        <a href="#how-it-works" className="primary-btn">
        Learn How It Works
        </a>

      </section>


      {/* Features */}
      <section className="features" id="features">

        <div className="section-heading">

          <p>OUR PLATFORM</p>

          <h2>
            Everything You Need When
            <span> Disaster Strikes</span>
          </h2>

          <p>
            From early warnings to rescue coordination,
            ResQ brings disaster response together in one platform.
          </p>

        </div>


        <div className="feature-grid">

          <div className="feature-card">
            <div>🗺️</div>
            <h3>Risk Prediction & GIS</h3>
            <p>
              Identify disaster-prone zones and visualize
              risks on an interactive map.
            </p>
          </div>

          <div className="feature-card">
            <div>🚨</div>
            <h3>SOS & Rescue</h3>
            <p>
              Send an emergency SOS and get connected
              with the most suitable rescue team.
            </p>
          </div>

          <div className="feature-card">
            <div>🛣️</div>
            <h3>Safe Routes</h3>
            <p>
              Find evacuation routes that prioritize
              safety instead of simply choosing the shortest path.
            </p>
          </div>

          <div className="feature-card">
            <div>📦</div>
            <h3>Resource Matching</h3>
            <p>
              Connect affected areas with available food,
              water, medicine and other essential resources.
            </p>
          </div>

          <div className="feature-card">
            <div>🏥</div>
            <h3>Healthcare</h3>
            <p>
              Find nearby hospitals, available beds,
              ambulances and blood resources.
            </p>
          </div>

          <div className="feature-card">
            <div>🤝</div>
            <h3>Volunteer & NGO Matching</h3>
            <p>
              Connect volunteers and organizations with
              relief operations where they are needed most.
            </p>
          </div>

        </div>

      </section>


      {/* How it works */}
      <section className="how-it-works" id="how-it-works">

        <div className="section-heading">

          <p>HOW IT WORKS</p>

          <h2>
            From Emergency to
            <span> Response</span>
          </h2>

        </div>


        <div className="steps">

          <div className="step">
            <div className="step-number">01</div>
            <h3>Detect</h3>
            <p>
              Monitor disaster risks and identify affected zones.
            </p>
          </div>

          <div className="step">
            <div className="step-number">02</div>
            <h3>Report</h3>
            <p>
              Citizens can quickly report emergencies through SOS.
            </p>
          </div>

          <div className="step">
            <div className="step-number">03</div>
            <h3>Coordinate</h3>
            <p>
              Match rescue teams, resources and volunteers
              with those who need them.
            </p>
          </div>

          <div className="step">
            <div className="step-number">04</div>
            <h3>Rescue</h3>
            <p>
              Guide responders using safe routes and
              real-time information.
            </p>
          </div>

        </div>

      </section>


      {/* CTA */}
      <section className="cta">

        <h2>
          Be Ready. Stay Connected.
        </h2>

        <p>
          Join a smarter approach to disaster preparedness
          and emergency response.
        </p>

        <a href="/signup">
          Create Your Account
        </a>

      </section>


      {/* Footer */}
      <footer className="footer">

        <div>
          <h2>ResQ</h2>
          <p>
            Predict. Respond. Rescue.
          </p>
        </div>

        <div>
          <p>Emergency</p>
          <p>Safety Guidelines</p>
          <p>Privacy</p>
        </div>

        <div>
          <p>© 2026 ResQ</p>
        </div>

      </footer>

    </div>
  );
}

export default Home;
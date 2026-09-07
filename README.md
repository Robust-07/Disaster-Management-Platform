# 🌐 ResQTech — Integrated Intelligent Disaster Management & Response Platform

**Smart India Hackathon 2026 — Team: ResQTech**

ResQTech is a coordinated disaster response platform that connects **citizens**, **authorities**, **rescue teams**, **volunteers** and **NGOs** on a single system — using machine learning to triage emergencies, predict resource shortages, and assess disaster risk in real time, instead of relying on manual guesswork under pressure.

---

## 🎯 Problem Statement

During disasters, the biggest failures are rarely a lack of **help** — they're a lack of **coordination and information**:

- Citizens don't know who to contact or how urgent their situation looks to responders.
- Authorities receive scattered, unverified reports with no way to prioritize who needs help most.
- Relief camps run out of food, water, or medicine without warning.
- Rescue teams are dispatched based on guesswork rather than actual availability or proximity.

ResQ addresses this by combining real-time coordination with predictive machine learning, so response decisions are based on data, not guesswork.

---

## Target Audience

| User | Need |
|---|---|
| **Citizens** in disaster-affected areas | Fast emergency reporting and live status updates |
| **Government disaster authorities** | Centralized, severity-prioritized visibility into all active emergencies |
| **Rescue & emergency response teams** | Clear digital assignment and status tracking |
| **NGOs / relief camp coordinators** | Advance warning of resource shortages, not after-the-fact discovery |
| **Volunteers** | A structured way to plug into the response effort |

---

## 🛠️ Tech Stack

### Frontend ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
- **React.js (Vite)**
- **React Router** — navigation, protected & role-based routes
- **Axios** — API calls with a centralized instance + JWT auto-attach interceptor
- **Socket.io-client** — real-time bidirectional updates
- **react-hot-toast** — notifications
- **Leaflet** — live risk map with location markers

### Backend  ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
- **Node.js + Express.js** — REST API layer
- **MongoDB + Mongoose** — data persistence
- **Socket.io** (server) — real-time push events: new SOS, status updates, team assignment, resource allocation
- **JWT authentication** with role-based authorization middleware
- **Cloudinary** — SOS evidence photo upload/storage
- **Helmet, Morgan, CORS** — security headers, request logging, cross-origin handling

### Machine Learning
- **Python + Flask** microservice (decoupled from the Node backend, communicates over HTTP)
- **scikit-learn** models, serialized with `joblib`:
  1. **Disaster Risk Prediction** — rainfall, river level, humidity, temperature, previous floods → risk level (LOW/MEDIUM/HIGH) + probability
  2. **SOS Severity Classification** — people trapped, injuries, water level, building damage, hours trapped, communication status → severity (LOW/MEDIUM/HIGH/CRITICAL) + numeric score
  3. **Resource Shortage Prediction** — population, current stock, daily consumption, incoming supply, people-per-unit → hours until shortage + status (CRITICAL/WARNING/MONITOR/SAFE)

### External APIs
- **Open-Meteo** — live weather data (rainfall, humidity, temperature) feeding the disaster risk model
- **Browser Geolocation API** — citizen, SOS, and rescue team positioning

### Architecture

```
React Frontend  →  Node/Express API  →  MongoDB (persistence)
                         │
                         ├──→  Flask ML Service (stateless predictions)
                         │
                         └──→  Socket.io (real-time layer)
```

A 3-tier architecture: the API layer owns business logic, auth, and data; the ML service is a pure, stateless prediction endpoint; Socket.io cuts across both layers to keep citizen and authority views in sync live.

---

## ✨ Core Features

### 1. Citizen SOS Reporting
- Structured form capturing 8 triage inputs (people trapped, injuries, critical injuries, children/elderly present, water level, building damage, hours trapped, communication availability)
- Optional photo evidence uploaded to Cloudinary
- Live GPS location capture, stored as GeoJSON
- ML-driven severity classification (with a rule-based heuristic fallback if the ML service is unreachable)

### 2. Authority Dashboard
- Live list of all SOS reports, sorted and pushed in real time via Socket.io (no polling, no manual refresh)
- Assign an available rescue team via a dropdown populated live from the database
- Progress reports through `pending → assigned → in-progress → resolved`
- Rescue teams automatically flip between `AVAILABLE`/`BUSY` as they're assigned/freed

### 3. Rescue Team Management
- Authorities can register new rescue teams (organization, type, capabilities, equipment, location) directly through the app

### 4. Resource Requests & Shortage Prediction
- Camp coordinators log resource needs (population, current stock, daily consumption)
- ML model predicts hours until shortage and classifies urgency (CRITICAL/WARNING/MONITOR/SAFE)
- Authority dashboard sorts requests by urgency automatically

### 5. Resource Matching & Allocation
- Matching algorithm scores available resources against a request by distance, quantity, and transport availability
- Allocation updates both resource stock and request fulfillment atomically

### 6. Real-Time Citizen Visibility
- Citizens see their SOS status update live as authorities act on it — assignment, progress, and resolution all push instantly to the citizen's screen

### 7. Role-Based Access Control
- Backend middleware enforces role permissions on every route (not just hidden in the UI)
- Frontend route guards (`ProtectedRoute` with `allowedRoles`) redirect unauthorized users away from restricted pages

---

## 📂 Project Structure (Backend)

```
disaster-management-backend/
├── config/              # DB connection config
├── controllers/         # Route handlers (auth, sos, rescue, resource, dashboard, riskZone, shelter, etc.)
├── middleware/          # Auth (protect, authorize), file upload (multer)
├── ml-service/          # Flask ML microservice (Python)
├── models/              # Mongoose schemas
├── routes/              # Express route definitions
├── utils/                # ML service callers, weather service, resource matching, severity calc
├── index.js             # App entry point
└── package.json
```

---

## 📦 Setup & Installation

### Prerequisites
- Node.js ≥ 18
- Python 3.x
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- (Optional) Weather API — currently uses keyless Open-Meteo

### Backend
```bash
cd disaster-management-backend
npm install
```
Create a `.env` file:
```
PORT=5000
MONGODB_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<your-secret>
CLOUDINARY_CLOUD_NAME=<...>
CLOUDINARY_API_KEY=<...>
CLOUDINARY_API_SECRET=<...>
ML_SERVICE_URL=http://localhost:5001
```
```bash
npm run dev   # or: npm start
```

### ML Service (Flask)
```bash
cd ml-service
pip install -r requirements.txt
python app.py     # runs on port 5001
```

### Frontend
```bash
cd frontend
npm install
```
Create a `.env` file:
```
VITE_API_URL=http://localhost:5000
```
```bash
npm run dev
```

---

## 🚀 Deployment

| Layer | Platform |
|---|---|
| Frontend | Vercel |
| Backend (Node) | Render |
| ML Service (Flask) | Render |
| Database | MongoDB Atlas |
| Image Storage | Cloudinary |

**Note:** Free-tier hosting (Render) spins down on inactivity, which can add 30–50s cold-start latency on the first request after idling. All ML service calls include timeout + graceful fallback handling so the app degrades gracefully rather than failing outright if a prediction service is slow to wake.

---



---

## Team

Built as part of Smart India Hackathon 2026, Team ResQ Tech.

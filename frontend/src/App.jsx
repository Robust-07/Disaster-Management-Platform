
import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CitizenDashboard from "./pages/CitizenDashboard";
import Emergency from "./pages/Emergency";
import Resources from "./pages/Resources";
import VolunteerNGO from "./pages/VolunteerNGO";

function App() {

    return (
        <BrowserRouter>

            <Routes>

                {/* Home */}
                <Route
                    path="/"
                    element={<Home />}
                />

                {/* Authentication */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/signup"
                    element={<Signup />}
                />

                {/* Citizen Dashboard */}
                <Route
                    path="/citizen-dashboard"
                    element={<CitizenDashboard />}
                />

                <Route 
                    path="/emergency" 
                    element={<Emergency />} />

                <Route 
                    path="/resources" 
                    element={<Resources />} />

                <Route
                    path="/volunteers"
                    element={<VolunteerNGO />}
                />
        </Routes>
        </BrowserRouter>
    );
}

export default App;
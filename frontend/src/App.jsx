import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CitizenDashboard from "./pages/CitizenDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Emergency from "./pages/Emergency";
import SOSForm from "./pages/SOSForm";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import Resources from "./pages/Resources";
import VolunteerNGO from "./pages/VolunteerNGO";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
    return (
        
        <BrowserRouter>
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

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
                    path="/dashboard"
                    element={<ProtectedRoute> <CitizenDashboard /></ProtectedRoute>}
                />

                <Route path="/authority" element={<AuthorityDashboard />} />

                <Route 
                    path="/emergency" 
                    element={<ProtectedRoute> <Emergency /> </ProtectedRoute>} 
                />
                <Route path="/sos-form" element={<SOSForm />} />

                <Route 
                    path="/resources" 
                    element={<ProtectedRoute> <Resources /> </ProtectedRoute>} 
                />

                <Route
                    path="/volunteers"
                    element={<ProtectedRoute> <VolunteerNGO /> </ProtectedRoute>}
                />
                {/* Catch-all route for 404 Not Found */}
                <Route 
                    path="*" 
                    element={<NotFoundPage />} 
                />
        </Routes>
        </BrowserRouter>
    );
}

export default App;
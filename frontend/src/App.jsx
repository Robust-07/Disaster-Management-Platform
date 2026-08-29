import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CitizenDashboard from "./pages/CitizenDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFoundPage from "./pages/NotFoundPage";

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
                    path="/dashboard"
                    element={<ProtectedRoute> <CitizenDashboard /></ProtectedRoute>}
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
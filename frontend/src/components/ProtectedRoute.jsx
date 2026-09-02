import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" state={{ message: "Please log in to continue" }} replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        const role = user?.role;

        if (!role || !allowedRoles.includes(role)) {
            return (
                <Navigate
                    to="/dashboard"
                    state={{ message: "You don't have permission to access that page." }}
                    replace
                />
            );
        }
    }

    return children;
}

export default ProtectedRoute;
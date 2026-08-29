import { Link } from "react-router-dom";
import "./NotFoundPage.css";

function NotFoundPage() {
    const token = localStorage.getItem("token");

    return (
        <div className="notfound-page">
            <div className="notfound-content">
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <p>
                    The page you're looking for doesn't exist or may have
                    been moved.
                </p>
                <Link
                    to={token ? "/dashboard" : "/"}
                    className="notfound-button"
                >
                    {token ? "Back to Dashboard" : "Back to Home"}
                </Link>
            </div>
        </div>
    );
}

export default NotFoundPage;
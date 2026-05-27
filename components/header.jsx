// components/header.jsx
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw && raw !== "undefined" ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-blue-600 text-white shadow-md">
      <div className="text-xl font-bold">MyApp</div>

      <nav className="flex gap-6 items-center">
        <Link to="/" className="hover:text-blue-200 font-medium transition">
          Home
        </Link>

        {user ? (
          <>
            {user.role === "admin" && (
              <Link to="/admin" className="hover:text-blue-200 font-medium transition">
                Admin
              </Link>
            )}
            <span className="text-blue-100 text-sm">
              Hi, {user.firstName}
            </span>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 px-3 py-1 rounded font-medium text-sm hover:bg-blue-50 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-200 font-medium transition">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-white text-blue-600 px-3 py-1 rounded font-medium text-sm hover:bg-blue-50 transition"
            >
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
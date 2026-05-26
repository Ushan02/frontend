import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-blue-600 text-white shadow-md">
      
      <div className="text-xl font-bold">
        MyApp
      </div>

      <nav className="flex gap-6">
        <Link
          to="/"
          className="hover:text-blue-200 font-medium transition">
          Home
        </Link>
        <Link
          to="/login"
          className="hover:text-blue-200 font-medium transition">
          Login
        </Link>
        <Link to="/admin" className="hover:text-blue-200 font-medium transition"> Admin </Link>
      </nav>

    </header>
  );
}
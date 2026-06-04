import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineUserPlus,
  HiOutlineBeaker,
  HiOutlineShoppingBag,
} from "react-icons/hi2";

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw && raw !== "undefined" ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function NavLinkItem({ to, children, icon: Icon, className = "" }) {
  return (
    <Link
      to={to}
      className={`hover:text-blue-200 font-medium transition flex items-center gap-1.5 ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </Link>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-blue-600 text-white shadow-md">
      <div className="text-xl font-bold">
        <Link to="/" className="hover:text-blue-200 transition flex items-center gap-2">
          <HiOutlineHome className="w-5 h-5" />
          MyApp
        </Link>
      </div>

      <nav className="flex gap-6 items-center">
        <NavLinkItem to="/" icon={HiOutlineHome}>
          Home
        </NavLinkItem>
        <NavLinkItem to="/products" icon={HiOutlineShoppingBag}>
          Products
        </NavLinkItem>
        <NavLinkItem to="/testing" icon={HiOutlineBeaker}>
          Testing
        </NavLinkItem>

        {user ? (
          <>
            {user.role === "admin" && (
              <NavLinkItem to="/admin" icon={HiOutlineCog6Tooth}>
                Admin
              </NavLinkItem>
            )}
            <span className="text-blue-100 text-sm">Hi, {user.firstName}</span>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 px-3 py-1 rounded font-medium text-sm hover:bg-blue-50 transition flex items-center gap-1.5"
            >
              <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLinkItem to="/login" icon={HiOutlineArrowLeftOnRectangle}>
              Login
            </NavLinkItem>
            <Link
              to="/register"
              className="bg-white text-blue-600 px-3 py-1 rounded font-medium text-sm hover:bg-blue-50 transition flex items-center gap-1.5"
            >
              <HiOutlineUserPlus className="w-4 h-4" />
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

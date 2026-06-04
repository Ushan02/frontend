import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineUserPlus,
  HiOutlineShoppingBag,
  HiOutlineShoppingCart,
} from "react-icons/hi2";
import { useCart } from "../src/context/CartContext";

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
  const { cartCount, reloadCart } = useCart();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    reloadCart();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 shrink-0 h-16 flex items-center justify-between px-4 sm:px-8 bg-blue-600 text-white shadow-md">
      <div className="text-xl font-bold">
        <Link to="/" className="hover:text-blue-200 transition flex items-center gap-2">
          <HiOutlineHome className="w-5 h-5" />
          MyApp
        </Link>
      </div>

      <nav className="flex gap-4 sm:gap-6 items-center">
        <NavLinkItem to="/" icon={HiOutlineHome}>
          Home
        </NavLinkItem>
        <NavLinkItem to="/products" icon={HiOutlineShoppingBag}>
          Products
        </NavLinkItem>

        <Link
          to="/cart"
          className="relative hover:text-blue-200 font-medium transition flex items-center gap-1.5"
        >
          <HiOutlineShoppingCart className="w-5 h-5" />
          <span className="hidden sm:inline">Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 sm:static sm:ml-0 min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full bg-white text-blue-600 text-xs font-bold">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Link>

        {user ? (
          <>
            {user.role === "admin" && (
              <NavLinkItem to="/admin" icon={HiOutlineCog6Tooth}>
                Admin
              </NavLinkItem>
            )}
            <span className="text-blue-100 text-sm hidden lg:inline">
              Hi, {user.firstName}
            </span>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 px-3 py-1 rounded font-medium text-sm hover:bg-blue-50 transition flex items-center gap-1.5"
            >
              <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
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

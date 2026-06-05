import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineUserPlus,
  HiOutlineShoppingBag,
  HiOutlineShoppingCart,
  HiOutlineBars3,
  HiOutlineXMark,
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

function NavLinkItem({ to, children, icon: Icon, className = "", onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`hover:text-blue-200 font-medium transition flex items-center gap-2 min-h-11 ${className}`}
    >
      {Icon && <Icon className="w-5 h-5 shrink-0" />}
      {children}
    </Link>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();
  const { cartCount, reloadCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    reloadCart();
    closeMenu();
    navigate("/login");
  };

  const navLinks = (
    <>
      <NavLinkItem to="/" icon={HiOutlineHome} onClick={closeMenu}>
        Home
      </NavLinkItem>
      <NavLinkItem to="/products" icon={HiOutlineShoppingBag} onClick={closeMenu}>
        Products
      </NavLinkItem>
      <Link
        to="/cart"
        onClick={closeMenu}
        className="relative hover:text-blue-200 font-medium transition flex items-center gap-2 min-h-11"
      >
        <HiOutlineShoppingCart className="w-5 h-5 shrink-0" />
        Cart
        {cartCount > 0 && (
          <span className="min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full bg-white text-blue-600 text-xs font-bold">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </Link>
      {user ? (
        <>
          {user.role === "admin" && (
            <NavLinkItem to="/admin" icon={HiOutlineCog6Tooth} onClick={closeMenu}>
              Admin
            </NavLinkItem>
          )}
          <span className="text-blue-100 text-sm py-2 lg:py-0">
            Hi, {user.firstName}
          </span>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-50 transition flex items-center gap-2 min-h-11 w-full lg:w-auto justify-center lg:justify-start"
          >
            <HiOutlineArrowRightOnRectangle className="w-5 h-5 shrink-0" />
            Logout
          </button>
        </>
      ) : (
        <>
          <NavLinkItem to="/login" icon={HiOutlineArrowLeftOnRectangle} onClick={closeMenu}>
            Login
          </NavLinkItem>
          <Link
            to="/register"
            onClick={closeMenu}
            className="bg-white text-blue-600 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-50 transition flex items-center gap-2 min-h-11 w-full lg:w-auto justify-center lg:justify-start"
          >
            <HiOutlineUserPlus className="w-5 h-5 shrink-0" />
            Register
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white shadow-md">
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-[100vw]">
        <Link
          to="/"
          className="text-lg sm:text-xl font-bold hover:text-blue-200 transition flex items-center gap-2 min-w-0"
        >
          <HiOutlineHome className="w-5 h-5 shrink-0" />
          <span className="truncate">MyApp</span>
        </Link>

        <nav className="hidden lg:flex gap-6 items-center">{navLinks}</nav>

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/cart"
            className="relative p-2 rounded-lg hover:bg-blue-500 transition"
            aria-label="Cart"
          >
            <HiOutlineShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-0.5 flex items-center justify-center rounded-full bg-white text-blue-600 text-[10px] font-bold">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="p-2 rounded-lg hover:bg-blue-500 transition"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <HiOutlineXMark className="w-6 h-6" />
            ) : (
              <HiOutlineBars3 className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 top-16 z-40 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      )}

      <nav
        className={`fixed top-16 right-0 z-50 h-[calc(100dvh-4rem)] w-full max-w-xs bg-blue-600 border-l border-blue-500 shadow-2xl flex flex-col gap-1 p-4 overflow-y-auto transition-transform duration-300 ease-out lg:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        {navLinks}
      </nav>
    </header>
  );
}

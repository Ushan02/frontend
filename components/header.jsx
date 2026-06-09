import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
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
  HiOutlineInformationCircle,
  HiOutlineClipboardDocumentList,
  HiOutlineUser,
} from "react-icons/hi2";
import { useCart } from "../src/context/CartContext";
import { clearSession, SESSION_UPDATED_EVENT } from "../src/lib/auth";
import Logo from "./Logo";

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw && raw !== "undefined" ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const navLinkClass = ({ isActive }) =>
  `font-medium transition flex items-center gap-2 min-h-11 ${
    isActive
      ? "text-sky border-b-2 border-sky"
      : "text-white hover:text-sky"
  }`;

function NavLinkItem({ to, children, icon: Icon, end, className = "", onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => `${navLinkClass({ isActive })} ${className}`}
    >
      {Icon && <Icon className="w-5 h-5 shrink-0" />}
      {children}
    </NavLink>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getStoredUser);
  const { cartCount, reloadCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());
    window.addEventListener(SESSION_UPDATED_EVENT, syncUser);
    return () => window.removeEventListener(SESSION_UPDATED_EVENT, syncUser);
  }, []);

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
    clearSession();
    reloadCart();
    closeMenu();
    navigate("/", { replace: true });
  };

  const navLinks = (
    <>
      <NavLinkItem to="/" icon={HiOutlineHome} end onClick={closeMenu}>
        Home
      </NavLinkItem>
      <NavLinkItem to="/products" icon={HiOutlineShoppingBag} onClick={closeMenu}>
        Products
      </NavLinkItem>
      <NavLinkItem to="/about" icon={HiOutlineInformationCircle} onClick={closeMenu}>
        About
      </NavLinkItem>
      <NavLink
        to="/cart"
        onClick={closeMenu}
        className={({ isActive }) =>
          `relative ${navLinkClass({ isActive })}`
        }
      >
        <HiOutlineShoppingCart className="w-5 h-5 shrink-0" />
        Cart
        {cartCount > 0 && (
          <span className="min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full bg-white text-ocean text-xs font-bold">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </NavLink>
      {user ? (
        <>
          <NavLinkItem to="/profile" icon={HiOutlineUser} onClick={closeMenu}>
            My Profile
          </NavLinkItem>
          {user.role !== "admin" && (
            <NavLinkItem to="/my-orders" icon={HiOutlineClipboardDocumentList} onClick={closeMenu}>
              My Orders
            </NavLinkItem>
          )}
          {user.role === "admin" && (
            <NavLinkItem to="/admin" icon={HiOutlineCog6Tooth} onClick={closeMenu}>
              Admin
            </NavLinkItem>
          )}
          <span className="text-sky/90 text-sm py-2 lg:py-0 hidden xl:inline">
            Hi, {user.firstName}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="bg-white text-ocean px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-mist transition flex items-center gap-2 min-h-11 w-full lg:w-auto justify-center lg:justify-start"
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
            className="bg-white text-ocean px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-mist transition flex items-center gap-2 min-h-11 w-full lg:w-auto justify-center lg:justify-start"
          >
            <HiOutlineUserPlus className="w-5 h-5 shrink-0" />
            Register
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-navy text-white shadow-md">
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-[100vw]">
        <Link to="/" className="hover:opacity-90 transition flex items-center min-w-0">
          <Logo />
        </Link>

        <nav className="hidden lg:flex gap-6 items-center">{navLinks}</nav>

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/cart"
            className="relative p-2 rounded-lg hover:bg-ocean transition"
            aria-label="Cart"
          >
            <HiOutlineShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-0.5 flex items-center justify-center rounded-full bg-white text-ocean text-xs font-bold">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="p-2 rounded-lg hover:bg-ocean transition"
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
        className={`fixed top-16 right-0 z-50 h-[calc(100dvh-4rem)] w-full max-w-xs bg-navy border-l border-ocean shadow-2xl flex flex-col gap-1 p-4 overflow-y-auto transition-transform duration-300 ease-out lg:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        {navLinks}
      </nav>
    </header>
  );
}

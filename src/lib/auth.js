export function saveSessionAndRedirect({ token, user, navigate, location, reloadCart }) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  reloadCart();

  const redirectTo = location.state?.from;
  if (redirectTo) {
    navigate(redirectTo);
  } else if (user.role === "admin") {
    navigate("/admin");
  } else {
    navigate("/");
  }
}

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

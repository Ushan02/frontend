export default function Logo({ variant = "full", className = "" }) {
  if (variant === "icon") {
    return (
      <img
        src="/techcart-icon.svg"
        alt="TechCart"
        width={36}
        height={36}
        className={`shrink-0 ${className}`}
      />
    );
  }

  return (
    <img
      src="/techcart-logo.svg"
      alt="TechCart"
      height={36}
      className={`h-8 sm:h-9 w-auto max-w-[180px] sm:max-w-[200px] shrink-0 ${className}`}
    />
  );
}

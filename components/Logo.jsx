export default function Logo({ variant = "full", className = "" }) {
  if (variant === "icon") {
    return (
      <img
        src="/techzone-icon.svg"
        alt="TechZone"
        width={36}
        height={36}
        className={`shrink-0 ${className}`}
      />
    );
  }

  return (
    <img
      src="/techzone-logo.svg"
      alt="TechZone"
      height={36}
      className={`h-8 sm:h-9 w-auto max-w-[180px] sm:max-w-[200px] shrink-0 ${className}`}
    />
  );
}

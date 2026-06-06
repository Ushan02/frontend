import { HiOutlineTag } from "react-icons/hi2";

const sizeMap = {
  sm: { badge: "discount-badge-sm", icon: "w-2.5 h-2.5" },
  md: { badge: "discount-badge-md", icon: "w-3.5 h-3.5" },
  lg: { badge: "discount-badge-lg", icon: "w-4 h-4" },
};

export default function DiscountBadge({ percent, size = "md", className = "", label }) {
  if (!percent || percent <= 0) return null;

  const { badge, icon } = sizeMap[size] || sizeMap.md;
  const text = label ?? `${percent}% OFF`;

  return (
    <span className={`discount-badge ${badge} ${className}`}>
      <HiOutlineTag className={`${icon} shrink-0`} />
      {text}
    </span>
  );
}

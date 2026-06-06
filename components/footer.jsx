import { Link } from "react-router-dom";
import Logo from "./Logo";
import {
  HiOutlineShoppingBag,
  HiOutlineInformationCircle,
  HiOutlineCpuChip,
  HiOutlineBriefcase,
  HiOutlineDeviceTablet,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
} from "react-icons/hi2";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa6";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_ADDRESS,
  SOCIAL_LINKS,
} from "../src/lib/contactInfo";

const shopLinks = [
  { to: "/products", label: "All products", icon: HiOutlineShoppingBag },
  { to: "/products?section=gaming", label: "Gaming laptops", icon: HiOutlineCpuChip },
  {
    to: "/products?section=business_and_student",
    label: "Business & student",
    icon: HiOutlineBriefcase,
  },
  { to: "/products?section=accessories", label: "Accessories", icon: HiOutlineDeviceTablet },
];

const companyLinks = [
  { to: "/about", label: "About us", icon: HiOutlineInformationCircle },
  { to: "/about#contact-us", label: "Contact us", icon: HiOutlineEnvelope },
];

const socialIcons = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  twitter: FaXTwitter,
  youtube: FaYoutube,
  whatsapp: FaWhatsapp,
};

function FooterLink({ to, label, icon: Icon }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 text-sm text-sky hover:text-white transition py-1.5"
    >
      <Icon className="w-4 h-4 shrink-0 text-cyan" />
      {label}
    </Link>
  );
}

function ContactItem({ icon: Icon, href, children }) {
  const className =
    "flex items-start gap-2.5 text-sm text-sky hover:text-white transition py-1.5";

  if (href) {
    return (
      <a href={href} className={className}>
        <Icon className="w-4 h-4 shrink-0 text-cyan mt-0.5" />
        <span className="break-all">{children}</span>
      </a>
    );
  }

  return (
    <p className="flex items-start gap-2.5 text-sm text-sky py-1.5">
      <Icon className="w-4 h-4 shrink-0 text-cyan mt-0.5" />
      <span>{children}</span>
    </p>
  );
}

export default function Footer() {
  return (
    <footer className="bg-navy text-sky border-t border-white/10 mt-auto">
      <div className="page-container py-12 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand + social */}
          <div>
            <Link to="/" className="inline-flex items-center mb-3 hover:opacity-90 transition">
              <Logo />
            </Link>
            <p className="text-sm text-sky/80 leading-relaxed mb-5">
              Sri Lanka&apos;s laptop & tech store — gaming rigs, business notebooks, and
              accessories with prices in RS.
            </p>
            <div className="flex items-center gap-2.5">
              {SOCIAL_LINKS.map((social) => {
                const Icon = socialIcons[social.icon];
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-cyan text-sky hover:text-white flex items-center justify-center transition hover:-translate-y-0.5"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Shop
            </h3>
            <nav className="flex flex-col">
              {shopLinks.map((link) => (
                <FooterLink key={link.to} {...link} />
              ))}
            </nav>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Company
            </h3>
            <nav className="flex flex-col">
              {companyLinks.map((link) => (
                <FooterLink key={link.to} {...link} />
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Contact
            </h3>
            <div className="flex flex-col">
              <ContactItem
                icon={HiOutlinePhone}
                href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
              >
                {CONTACT_PHONE}
              </ContactItem>
              <ContactItem icon={HiOutlineEnvelope} href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </ContactItem>
              <ContactItem icon={HiOutlineMapPin}>{CONTACT_ADDRESS}</ContactItem>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

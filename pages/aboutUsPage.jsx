import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineBuildingOffice2,
  HiOutlineCpuChip,
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiOutlineHeart,
  HiOutlineUsers,
  HiOutlineSparkles,
  HiOutlineShoppingBag,
  HiOutlineArrowRight,
  HiOutlineMapPin,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineChatBubbleLeftRight,
  HiOutlinePaperAirplane,
} from "react-icons/hi2";

import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_ADDRESS,
} from "../src/lib/contactInfo";

const CONTACT_API = import.meta.env.VITE_BACKEND_URL + "/api/contact";

const contactDetails = [
  {
    icon: HiOutlineMapPin,
    title: "Visit us",
    lines: [CONTACT_ADDRESS],
  },
  {
    icon: HiOutlineEnvelope,
    title: "Email us",
    lines: [CONTACT_EMAIL],
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    icon: HiOutlinePhone,
    title: "Call us",
    lines: [CONTACT_PHONE],
    href: `tel:${CONTACT_PHONE.replace(/\s/g, "")}`,
  },
  {
    icon: HiOutlineClock,
    title: "Business hours",
    lines: ["Mon – Fri: 9:00 AM – 6:00 PM", "Sat – Sun: 9:00 AM – 8:00 PM"],
  },
];

const values = [
  {
    icon: HiOutlineShieldCheck,
    title: "Genuine products",
    desc: "We source laptops and accessories from trusted brands so you get real hardware with full confidence.",
  },
  {
    icon: HiOutlineCpuChip,
    title: "Expert curation",
    desc: "From gaming rigs to student notebooks, every listing is organized with clear specs and smart filters.",
  },
  {
    icon: HiOutlineTruck,
    title: "Island-wide delivery",
    desc: "Fast, reliable shipping across Sri Lanka — your next laptop arrives safely at your door.",
  },
  {
    icon: HiOutlineHeart,
    title: "Customer-first",
    desc: "Transparent RS pricing, easy browsing, and support that puts your needs before everything else.",
  },
];

const milestones = [
  { value: "100+", label: "Products listed" },
  { value: "15+", label: "Top brands" },
  { value: "24/7", label: "Online shopping" },
  { value: "RS", label: "Local pricing" },
];

function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(CONTACT_API, {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-3xl card-bg border border-base-300/60 p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[320px]">
        <div className="w-14 h-14 rounded-2xl bg-success/10 text-success flex items-center justify-center mb-4">
          <HiOutlinePaperAirplane className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-base-content mb-2">Message sent successfully</h3>
        <p className="text-sm text-base-content/60 mb-6 max-w-sm">
          Thank you for reaching out. Our team will review your message and get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="btn btn-primary btn-sm rounded-xl"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl card-bg border border-base-300/60 p-6 sm:p-8 shadow-[0_10px_36px_rgba(3,4,94,0.13)]"
    >
      <h3 className="text-lg font-bold text-base-content mb-1">Send us a message</h3>
      <p className="text-sm text-base-content/55 mb-6">
        Questions about orders, products, or warranties? We&apos;ll get back to you as soon as we can.
      </p>

      {error && (
        <div className="alert alert-error text-sm py-2 mb-4 rounded-xl">
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <label className="form-control w-full">
          <span className="label-text text-sm font-medium mb-1">Full name</span>
          <input
            type="text"
            value={form.name}
            onChange={set("name")}
            placeholder="Your name"
            className="input-field"
          />
        </label>
        <label className="form-control w-full">
          <span className="label-text text-sm font-medium mb-1">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@example.com"
            className="input-field"
          />
        </label>
      </div>

      <label className="form-control w-full mb-4">
        <span className="label-text text-sm font-medium mb-1">Subject</span>
        <input
          type="text"
          value={form.subject}
          onChange={set("subject")}
          placeholder="Order inquiry, product question…"
          className="input input-bordered rounded-xl w-full"
        />
      </label>

      <label className="form-control w-full mb-6">
        <span className="label-text text-sm font-medium mb-1">Message</span>
        <textarea
          value={form.message}
          onChange={set("message")}
          placeholder="How can we help you?"
          rows={5}
          className="input-field resize-none min-h-[8rem]"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="btn-brand w-full sm:w-auto"
      >
        {loading ? (
          <span className="loading loading-spinner loading-sm" />
        ) : (
          <HiOutlinePaperAirplane className="w-5 h-5" />
        )}
        {loading ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

export default function AboutUsPage() {
  return (
    <div className="page-shell flex-1 min-w-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-ocean to-cyan text-primary-content">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-sm font-medium border border-white/20 mb-6">
            <HiOutlineSparkles className="w-4 h-4" />
            About TechCart
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4 flex items-center justify-center gap-3 flex-wrap">
            <HiOutlineBuildingOffice2 className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" />
            Sri Lanka&apos;s trusted laptop & tech store
          </h1>
          <p className="text-sm sm:text-lg text-primary-content/85 max-w-2xl mx-auto leading-relaxed">
            We help students, professionals, and gamers find the right laptop — with honest
            pricing in Rupees, detailed specs, and a shopping experience built for modern life.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <h2 className="section-title mb-4">Our story</h2>
            <p className="text-base-content/70 leading-relaxed mb-4">
              TechCart started with a simple idea: buying a laptop in Sri Lanka should feel clear,
              not confusing. Too many stores hide specs, mix up pricing, or make it hard to compare
              gaming machines with everyday work notebooks.
            </p>
            <p className="text-base-content/70 leading-relaxed mb-4">
              We built an online shop that puts the details upfront — processor, RAM, storage, GPU,
              and price in RS — so you can choose with confidence whether you need a powerhouse for
              gaming or a lightweight machine for classes and office work.
            </p>
            <p className="text-base-content/70 leading-relaxed">
              Today we carry gaming laptops, business & student notebooks, and a growing range of
              accessories, all in one place with filters that actually help you find what you need.
            </p>
          </div>

          <div className="rounded-3xl card-bg border border-base-300/60 p-6 sm:p-8 shadow-[0_10px_36px_rgba(3,4,94,0.13)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <HiOutlineUsers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-base-content">Who we serve</h3>
                <p className="text-sm text-base-content/55">Everyone who needs reliable tech</p>
              </div>
            </div>
            <ul className="space-y-4">
              {[
                "Students looking for affordable, dependable laptops",
                "Professionals who need business-grade performance",
                "Gamers chasing high refresh rates and powerful GPUs",
                "Anyone upgrading mice, keyboards, bags, and accessories",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-base-content/70">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-mist/30 border-y border-sky/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {milestones.map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-primary">{item.value}</p>
                <p className="text-xs sm:text-sm text-base-content/55 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="section-title mb-3">What we stand for</h2>
          <p className="section-subtitle max-w-lg mx-auto">
            Four principles guide every product we list and every order we fulfill.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {values.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl card-bg border border-base-300/50 p-5 sm:p-6 hover:border-primary/30 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base-content mb-1.5">{item.title}</h3>
              <p className="text-sm text-base-content/55 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Us */}
      <section id="contact-us" className="bg-mist/30 border-t border-sky/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-10 sm:mb-12">
            <span className="section-eyebrow mb-4">
              <HiOutlineChatBubbleLeftRight className="w-4 h-4" />
              We&apos;re here to help
            </span>
            <h2 className="section-title mb-3">Contact Us</h2>
            <p className="section-subtitle max-w-lg mx-auto">
              Reach out for product advice, order support, or partnership inquiries. Our team
              typically responds within one business day.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {contactDetails.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl card-bg border border-base-300/50 p-5 flex gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base-content text-sm mb-1">{item.title}</h3>
                    {item.lines.map((line) =>
                      item.href ? (
                        <a
                          key={line}
                          href={item.href}
                          className="block text-sm text-base-content/65 hover:text-primary transition-colors"
                        >
                          {line}
                        </a>
                      ) : (
                        <p key={line} className="text-sm text-base-content/65">
                          {line}
                        </p>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy via-ocean to-cyan text-white px-6 sm:px-12 py-10 sm:py-14 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent" />
          <div className="relative max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-3">Ready to explore?</h2>
            <p className="text-white/75 mb-6 text-sm sm:text-base">
              Browse gaming laptops, business notebooks, and accessories — filter by brand,
              specs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 bg-white text-ocean font-semibold px-6 py-3 rounded-2xl transition-all hover:bg-mist hover:-translate-y-0.5 shadow-lg min-h-11"
              >
                <HiOutlineShoppingBag className="w-5 h-5" />
                Shop products
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 font-semibold px-6 py-3 rounded-2xl transition-all min-h-11"
              >
                Back to home
                <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineShoppingBag,
  HiOutlineCpuChip,
  HiOutlineBriefcase,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiOutlineCreditCard,
  HiOutlineArrowRight,
  HiOutlineBolt,
  HiOutlineDeviceTablet,
} from "react-icons/hi2";
import { ProductCard } from "../components/ProductList";

const PRODUCTS_API = import.meta.env.VITE_BACKEND_URL + "/api/products";
const LAPTOP_FEATURED_LIMIT = 4;
const ACCESSORY_FEATURED_LIMIT = 4;

const categories = [
  {
    key: "gaming",
    title: "Gaming Laptops",
    desc: "High-performance rigs with RTX graphics and fast refresh displays.",
    icon: HiOutlineCpuChip,
    gradient: "from-navy to-ocean",
    link: "/products?section=gaming",
  },
  {
    key: "business",
    title: "Business & Student",
    desc: "Lightweight, reliable laptops for work, study, and everyday use.",
    icon: HiOutlineBriefcase,
    gradient: "from-ocean to-cyan",
    link: "/products?section=business_and_student",
  },
  {
    key: "accessories",
    title: "Accessories",
    desc: "Mice, keyboards, bags, chargers, and everything in between.",
    icon: HiOutlineDeviceTablet,
    gradient: "from-cyan to-sky",
    link: "/products?section=accessories",
  },
];

const highlights = [
  {
    icon: HiOutlineBolt,
    title: "Latest hardware",
    desc: "Intel Core, Core Ultra, and AMD Ryzen laptops.",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "Trusted quality",
    desc: "Genuine products from top brands you know.",
  },
  {
    icon: HiOutlineTruck,
    desc: "Fast island-wide delivery across Sri Lanka.",
    title: "Quick delivery",
  },
  {
    icon: HiOutlineCreditCard,
    title: "Fair pricing",
    desc: "Transparent prices in Sri Lankan Rupees (RS).",
  },
];

const stats = [
  { value: "100+", label: "Products" },
  { value: "15+", label: "Brands" },
  { value: "24/7", label: "Online shop" },
];

const heroLaptops = [
  {
    src: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80",
    alt: "Gaming laptop",
    label: "Gaming",
    className: "top-0 right-0 w-[88%] z-20",
  },
  {
    src: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&q=80",
    alt: "Business laptop",
    label: "Business",
    className: "bottom-4 left-0 w-[72%] z-10",
  },
];

function ProductCardSkeleton({ count }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl card-bg p-2 sm:p-2.5 shadow-[0_8px_28px_rgba(3,4,94,0.11)] animate-pulse"
        >
          <div className="aspect-[4/3] rounded-lg bg-base-300 mb-2" />
          <div className="h-2 w-12 bg-base-300 rounded mb-1" />
          <div className="h-3 w-full bg-base-300 rounded mb-1" />
          <div className="h-2.5 w-2/3 bg-base-300 rounded mb-1.5" />
          <div className="h-6 w-full bg-base-300 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function FeaturedProductGroup({ title, icon: Icon, products, viewAllLink }) {
  if (products.length === 0) return null;

  return (
    <div className="mb-10 sm:mb-12 last:mb-0">
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
        <h3 className="text-base sm:text-lg font-bold text-base-content flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-primary shrink-0" />}
          {title}
        </h3>
        <Link
          to={viewAllLink}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:gap-2 transition-all shrink-0"
        >
          View all
          <HiOutlineArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            variant={product.subCategory || "all"}
          />
        ))}
      </div>
    </div>
  );
}

function FeaturedProductsSection() {
  const [laptops, setLaptops] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFeatured() {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [laptopsRes, accessoriesRes] = await Promise.all([
          axios.get(PRODUCTS_API, {
            headers,
            params: { page: 1, limit: LAPTOP_FEATURED_LIMIT, category: "laptop" },
          }),
          axios.get(PRODUCTS_API, {
            headers,
            params: { page: 1, limit: ACCESSORY_FEATURED_LIMIT, category: "accessories" },
          }),
        ]);
        if (!cancelled) {
          setLaptops(laptopsRes.data.products || []);
          setAccessories(accessoriesRes.data.products || []);
        }
      } catch {
        if (!cancelled) {
          setLaptops([]);
          setAccessories([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFeatured();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasProducts = laptops.length > 0 || accessories.length > 0;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <span className="section-eyebrow mb-3">
            <HiOutlineSparkles className="w-3.5 h-3.5" />
            Hand-picked for you
          </span>
          <h2 className="section-title mb-2">
            Featured products
          </h2>
          <p className="section-subtitle max-w-xl">
            Explore our latest laptops and accessories — gaming rigs, business notebooks, and everyday tech.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all shrink-0"
        >
          View all products
          <HiOutlineArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-10">
          <ProductCardSkeleton count={LAPTOP_FEATURED_LIMIT} />
          <ProductCardSkeleton count={ACCESSORY_FEATURED_LIMIT} />
        </div>
      ) : !hasProducts ? (
        <div className="text-center py-12 rounded-3xl card-bg border border-base-300/50">
          <HiOutlineShoppingBag className="w-12 h-12 mx-auto text-base-content/20 mb-3" />
          <p className="text-base-content/60 text-sm">No products yet. Check back soon!</p>
          <Link to="/products" className="btn btn-primary btn-sm rounded-xl mt-4">
            Browse shop
          </Link>
        </div>
      ) : (
        <>
          <FeaturedProductGroup
            title="Laptops"
            icon={HiOutlineCpuChip}
            products={laptops}
            viewAllLink="/products"
          />
          <FeaturedProductGroup
            title="Accessories"
            icon={HiOutlineDeviceTablet}
            products={accessories}
            viewAllLink="/products?section=accessories"
          />
        </>
      )}
    </section>
  );
}

function HeroLaptopShowcase() {
  return (
    <div className="relative hidden lg:block h-[440px] w-full">
      {/* Ambient glow behind laptops */}
      <div className="absolute inset-4 rounded-[2.5rem] bg-gradient-to-br from-ocean/30 via-cyan/20 to-sky/25 blur-2xl" />

      {heroLaptops.map((laptop, index) => (
        <div
          key={laptop.alt}
          className={`absolute ${laptop.className} group`}
          style={{ animationDelay: `${index * 120}ms` }}
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-navy/40 border border-white/20 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-navy via-ocean to-cyan z-0" />
            <img
              src={laptop.src}
              alt={laptop.alt}
              className="relative z-10 w-full aspect-[4/3] object-cover object-center mix-blend-luminosity opacity-90 group-hover:opacity-100 group-hover:mix-blend-normal transition-all duration-500"
            />
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-navy/80 via-ocean/35 to-transparent pointer-events-none" />
            <div className="absolute inset-0 z-20 bg-gradient-to-br from-cyan/40 via-transparent to-navy/30 pointer-events-none mix-blend-multiply" />
            <span className="absolute bottom-4 left-4 z-30 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/25 text-white">
              {laptop.label}
            </span>
          </div>
        </div>
      ))}

      {/* Decorative ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] rounded-full border border-white/10 pointer-events-none" />
    </div>
  );
}

export default function HomePage() {
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
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-cyan/20 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-base sm:text-sm font-medium border border-white/20 mb-6">
                <HiOutlineSparkles className="w-4 h-4" />
                Sri Lanka&apos;s laptop & tech store
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
                Power your work,
                <span className="block text-sky">play & productivity.</span>
              </h1>

              <p className="text-base sm:text-lg text-primary-content/85 max-w-xl mb-8 leading-relaxed">
                Discover gaming laptops, business notebooks, and premium accessories —
                all in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 bg-white text-ocean font-semibold px-7 py-3.5 rounded-2xl hover:bg-mist shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 min-h-12"
                >
                  <HiOutlineShoppingBag className="w-5 h-5" />
                  Shop all products
                </Link>
                <Link
                  to="/products?section=gaming"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold px-7 py-3.5 rounded-2xl border border-white/25 hover:bg-white/20 transition-all min-h-12"
                >
                  Explore gaming
                  <HiOutlineArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="mt-10 sm:mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg">
                {stats.map((item) => (
                  <div key={item.label} className="text-center sm:text-left">
                    <p className="text-2xl sm:text-3xl font-bold">{item.value}</p>
                    <p className="text-xs sm:text-sm text-primary-content/70 mt-0.5">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <HeroLaptopShowcase />
          </div>

          {/* Mobile / tablet laptop strip */}
          <div className="lg:hidden mt-10 grid grid-cols-2 gap-4">
            {heroLaptops.map((laptop) => (
              <div
                key={laptop.alt}
                className="relative rounded-2xl overflow-hidden border border-white/20 shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-navy to-ocean" />
                <img
                  src={laptop.src}
                  alt={laptop.alt}
                  className="relative w-full aspect-[4/3] object-cover mix-blend-luminosity opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-cyan/30 mix-blend-multiply" />
                <span className="absolute bottom-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20">
                  {laptop.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-10 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              to={cat.link}
              className="group relative overflow-hidden rounded-3xl card-bg p-6 sm:p-8 shadow-[0_10px_36px_rgba(3,4,94,0.13)] border border-base-300/60 hover:shadow-[0_18px_52px_rgba(3,4,94,0.2)] hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${cat.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}
              />
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.gradient} text-white shadow-lg mb-5`}
              >
                <cat.icon className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-base-content mb-2 group-hover:text-primary transition-colors">
                {cat.title}
              </h2>
              <p className="text-base sm:text-sm text-base-content/60 leading-relaxed mb-4">
                {cat.desc}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Browse collection
                <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <FeaturedProductsSection />

      {/* Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="section-title mb-3">
            Why shop with TechCart
          </h2>
          <p className="section-subtitle max-w-lg mx-auto">
            A modern shopping experience built for laptops, gear, and everyday tech.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {highlights.map((item) => (
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

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 sm:pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy via-ocean to-cyan text-white px-6 sm:px-12 py-12 sm:py-16 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent" />
          <div className="relative max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
              Ready to find your next laptop?
            </h2>
            <p className="text-white/75 mb-8 text-sm sm:text-base">
              Filter by brand, processor, GPU, and price — only 9 products per page for easy browsing.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white text-ocean font-semibold px-8 py-3.5 rounded-2xl transition-all hover:bg-mist hover:-translate-y-0.5 shadow-lg min-h-12"
            >
              <HiOutlineShoppingBag className="w-5 h-5" />
              Start shopping
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

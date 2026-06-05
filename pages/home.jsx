import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="flex-1 bg-base-200 min-w-0">

      {/* Hero Section */}
      <section className="flex flex-col justify-center items-center text-center py-14 sm:py-20 px-4 sm:px-6 bg-blue-600 text-white">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Welcome to MyApp</h1>
        <p className="text-base sm:text-lg mb-6 sm:mb-8 text-blue-100 max-w-lg">
          Your one-stop solution for everything.
        </p>
        <Link
          to="/products"
          className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition min-h-11 inline-flex items-center"
        >
          Shop Products
        </Link>
      </section>

      {/* Features Section */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
        {[
          { title: "Fast", desc: "Blazing fast performance out of the box." },
          { title: "Secure", desc: "Your data is safe and encrypted." },
          { title: "Reliable", desc: "99.9% uptime, always available." },
        ].map((feature) => (
          <div key={feature.title} className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-bold mb-2">{feature.title}</h2>
            <p className="text-gray-500">{feature.desc}</p>
          </div>
        ))}
      </section>

    </div>
  )
}
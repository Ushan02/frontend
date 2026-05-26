export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Hero Section */}
      <section className="flex flex-col justify-center items-center text-center py-20 bg-blue-600 text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to MyApp</h1>
        <p className="text-lg mb-8 text-blue-100">Your one-stop solution for everything.</p>
        <button className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition">
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section className="py-16 px-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
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
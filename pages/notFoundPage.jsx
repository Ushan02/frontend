import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col justify-center items-center bg-base-200 text-center px-4 py-12 min-w-0">
      
      <h1 className="text-7xl sm:text-8xl md:text-9xl font-extrabold text-blue-600">404</h1>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-4">Page Not Found</h2>
      <p className="text-sm sm:text-base text-gray-500 mt-2 mb-8 max-w-md">
        Oops! The page you're looking for doesn't exist.
      </p>

      <Link
        to="/"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
      >
        Go Back Home
      </Link>

    </div>
  );
}
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center text-center px-4">
      
      <h1 className="text-9xl font-extrabold text-blue-600">404</h1>
      <h2 className="text-3xl font-bold text-gray-800 mt-4">Page Not Found</h2>
      <p className="text-gray-500 mt-2 mb-8">
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
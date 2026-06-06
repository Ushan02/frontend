import { Link } from "react-router-dom";
import { HiOutlineHome, HiOutlineExclamationTriangle } from "react-icons/hi2";

export default function NotFoundPage() {
  return (
    <div className="page-shell flex flex-1 flex-col justify-center items-center text-center px-4 py-16 min-w-0">
      <div className="card-bg p-10 sm:p-14 max-w-lg w-full">
        <HiOutlineExclamationTriangle className="w-12 h-12 mx-auto text-cyan mb-4" />
        <h1 className="text-7xl sm:text-8xl font-extrabold bg-gradient-to-br from-ocean to-cyan bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="section-title mt-4">Page Not Found</h2>
        <p className="section-subtitle mt-2 mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/" className="btn-brand inline-flex">
          <HiOutlineHome className="w-5 h-5" />
          Go Back Home
        </Link>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import axios from "axios";
import { HiOutlineStar, HiOutlineTrash } from "react-icons/hi2";
import { API_BASE, getAuthHeaders } from "../../src/lib/adminApi";

const API = API_BASE + "/api/review";

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <HiOutlineStar
          key={n}
          className={`w-4 h-4 ${n <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
        />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(API, { headers: getAuthHeaders() });
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await axios.delete(`${API}/${id}`, { headers: getAuthHeaders() });
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete review.");
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString();
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Reviews</h1>
        <p className="text-slate-500 text-sm mt-1">Customer ratings and feedback</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex justify-between">
          <span>{error}</span>
          <button onClick={fetchReviews} className="underline">Retry</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading reviews…</div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No reviews yet.</div>
        ) : (
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Email</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Rating</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Comment</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Date</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.map((review) => (
                <tr key={review._id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 text-sm text-slate-600">{review.email}</td>
                  <td className="px-5 py-3.5">
                    <StarRating rating={review.rating} />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-800 max-w-md">
                    {review.comment}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 whitespace-nowrap">
                    {formatDate(review.createdAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && reviews.length > 0 && (
        <p className="text-sm text-slate-400 mt-4">{reviews.length} reviews</p>
      )}
    </div>
  );
}

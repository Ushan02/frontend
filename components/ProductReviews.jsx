import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { HiOutlineStar, HiOutlineUser, HiOutlineTrash } from "react-icons/hi2";

const API = import.meta.env.VITE_BACKEND_URL + "/api/review";

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw && raw !== "undefined" ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function StarDisplay({ rating, size = "w-4 h-4" }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <HiOutlineStar
          key={n}
          className={`${size} ${
            n <= rating ? "text-amber-400 fill-amber-400" : "text-base-content/25"
          }`}
        />
      ))}
    </div>
  );
}

function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5 transition-transform hover:scale-110"
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <HiOutlineStar
            className={`w-7 h-7 ${
              n <= (hover || value)
                ? "text-amber-400 fill-amber-400"
                : "text-base-content/25"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({ productId, productName }) {
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const user = getStoredUser();
  const token = localStorage.getItem("token");
  const isAdmin = user?.role === "admin";

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(API, { params: { productId } });
      setReviews(res.data.reviews || []);
      setAverage(res.data.average ?? 0);
      setTotal(res.data.total ?? 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reviews.");
      setReviews([]);
      setAverage(0);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId, fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!token || !user) {
      setFormError("Please log in to leave a review.");
      return;
    }
    if (rating < 1) {
      setFormError("Please select a star rating.");
      return;
    }
    if (!comment.trim()) {
      setFormError("Please write your review.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        API,
        { productId, rating, comment: comment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormSuccess("Thank you! Your review was posted.");
      setRating(0);
      setComment("");
      fetchReviews();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const userAlreadyReviewed =
    user && reviews.some((r) => r.email === user.email?.toLowerCase());

  const handleDeleteReview = async (reviewId) => {
    if (!isAdmin || !token) return;
    if (!window.confirm("Delete this review?")) return;

    setDeletingId(reviewId);
    try {
      await axios.delete(`${API}/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete review.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="mt-10 sm:mt-14 pt-8 border-t border-base-300">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-base-content">Customer reviews</h2>
          <p className="text-sm text-base-content/55 mt-1">
            Ratings and feedback for {productName}
          </p>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-3 bg-base-100 rounded-2xl border border-base-300/60 px-4 py-3">
            <span className="text-2xl font-extrabold text-base-content">{average}</span>
            <div>
              <StarDisplay rating={Math.round(average)} />
              <p className="text-xs text-base-content/50 mt-0.5">
                {total} review{total !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Review form */}
      <div className="rounded-2xl bg-base-100 border border-base-300/60 p-5 sm:p-6 mb-6">
        <h3 className="font-bold text-base-content mb-1">Write a review</h3>
        {!token || !user ? (
          <p className="text-sm text-base-content/60">
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>{" "}
            to rate this product and share your experience.
          </p>
        ) : userAlreadyReviewed ? (
          <p className="text-sm text-base-content/60">
            You already reviewed this product. Thank you for your feedback!
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-3 space-y-4">
            <div>
              <span className="text-sm font-medium text-base-content/70 block mb-2">
                Your rating
              </span>
              <StarInput value={rating} onChange={setRating} />
            </div>
            <label className="form-control w-full">
              <span className="text-sm font-medium text-base-content/70 mb-1">Your review</span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this product…"
                rows={4}
                className="textarea textarea-bordered rounded-xl w-full resize-none"
              />
            </label>
            {formError && (
              <div className="alert alert-error text-sm py-2 rounded-xl">
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="alert alert-success text-sm py-2 rounded-xl">
                <span>{formSuccess}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-sm rounded-xl min-h-10"
            >
              {submitting ? "Posting…" : "Post review"}
            </button>
          </form>
        )}
      </div>

      {/* Review list */}
      {loading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-md text-primary" />
        </div>
      ) : error ? (
        <div className="alert alert-error text-sm rounded-xl">
          <span>{error}</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 rounded-2xl bg-base-100 border border-base-300/50">
          <HiOutlineStar className="w-10 h-10 mx-auto text-base-content/20 mb-2" />
          <p className="text-sm text-base-content/55">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li
              key={review._id}
              className="rounded-2xl bg-base-100 border border-base-300/60 p-5 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <HiOutlineUser className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-base-content truncate">
                      {review.email}
                    </p>
                    <p className="text-xs text-base-content/45">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StarDisplay rating={review.rating} size="w-5 h-5" />
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(review._id)}
                      disabled={deletingId === review._id}
                      className="btn btn-error btn-xs gap-1 rounded-lg"
                      title="Delete review (admin)"
                    >
                      {deletingId === review._id ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <HiOutlineTrash className="w-3.5 h-3.5" />
                      )}
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-base-content/80 leading-relaxed whitespace-pre-wrap">
                {review.comment}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

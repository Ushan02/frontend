import { useEffect, useState } from "react";
import axios from "axios";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineTrash,
  HiOutlineEnvelope,
  HiOutlineCheck,
} from "react-icons/hi2";
import { API_BASE, getAuthHeaders } from "../../src/lib/adminApi";

const API = API_BASE + "/api/contact";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(API, { headers: getAuthHeaders() });
      const list = Array.isArray(res.data) ? res.data : [];
      setMessages(list);
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const selected = messages.find((m) => m._id === selectedId) || null;
  const unreadCount = messages.filter((m) => !m.isRead).length;

  const handleMarkRead = async (id) => {
    try {
      await axios.patch(`${API}/${id}/read`, {}, { headers: getAuthHeaders() });
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, isRead: true } : m))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark as read.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await axios.delete(`${API}/${id}`, { headers: getAuthHeaders() });
      const next = messages.filter((m) => m._id !== id);
      setMessages(next);
      if (selectedId === id) {
        setSelectedId(next[0]?._id || null);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete message.");
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <HiOutlineChatBubbleLeftRight className="w-7 h-7 text-blue-600" />
            Contact Messages
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Messages sent from the About page contact form
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={fetchMessages}
          className="btn btn-sm btn-outline rounded-lg self-start sm:self-auto"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex justify-between">
          <span>{error}</span>
          <button type="button" onClick={fetchMessages} className="underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Loading messages…</div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 py-16 text-center">
          <HiOutlineEnvelope className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">No contact messages yet.</p>
          <p className="text-slate-400 text-xs mt-1">
            Messages appear here when customers submit the form on the About page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 min-h-[420px]">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col max-h-[70vh] lg:max-h-none">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              Inbox ({messages.length})
            </div>
            <ul className="divide-y divide-slate-100 overflow-y-auto flex-1">
              {messages.map((msg) => (
                <li key={msg._id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(msg._id);
                      if (!msg.isRead) handleMarkRead(msg._id);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition ${
                      selectedId === msg._id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm truncate ${msg.isRead ? "font-medium text-slate-700" : "font-bold text-slate-900"}`}>
                        {msg.name}
                      </p>
                      {!msg.isRead && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{msg.subject}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{formatDate(msg.createdAt)}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6 flex flex-col min-h-[280px]">
            {selected ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-slate-800 break-words">{selected.subject}</h2>
                    <p className="text-sm text-slate-600 mt-1">
                      From <span className="font-medium">{selected.name}</span>
                    </p>
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {selected.email}
                    </a>
                    <p className="text-xs text-slate-400 mt-2">{formatDate(selected.createdAt)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!selected.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(selected._id)}
                        className="btn btn-sm btn-outline gap-1 rounded-lg"
                      >
                        <HiOutlineCheck className="w-4 h-4" />
                        Mark read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(selected._id)}
                      className="btn btn-sm btn-outline btn-error gap-1 rounded-lg"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase text-slate-400 mb-2">Message</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                    {selected.message}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
                    className="btn btn-primary btn-sm rounded-lg gap-2"
                  >
                    <HiOutlineEnvelope className="w-4 h-4" />
                    Reply by email
                  </a>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                Select a message to read
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

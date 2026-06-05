import { useEffect, useState } from "react";
import axios from "axios";
import { HiOutlineNoSymbol, HiOutlineCheck } from "react-icons/hi2";
import { API_BASE, getAuthHeaders } from "../../src/lib/adminApi";

const API = API_BASE + "/api/users";

function RoleBadge({ role }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        role === "admin" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-700"
      }`}
    >
      {role}
    </span>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(API, { headers: getAuthHeaders() });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBlock = async (id) => {
    try {
      const res = await axios.patch(`${API}/${id}/block`, {}, { headers: getAuthHeaders() });
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isBlock: res.data.user.isBlock } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user.");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Users</h1>
        <p className="text-slate-500 text-sm mt-1">Manage customer and admin accounts</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex justify-between">
          <span>{error}</span>
          <button onClick={fetchUsers} className="underline">Retry</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No users found.</div>
        ) : (
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Name</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Email</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Role</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-800">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.isBlock
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.isBlock ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {user.role !== "admin" ? (
                      <button
                        onClick={() => toggleBlock(user._id)}
                        className={`text-sm font-medium flex items-center gap-1 ${
                          user.isBlock
                            ? "text-green-600 hover:text-green-800"
                            : "text-red-600 hover:text-red-800"
                        }`}
                      >
                        {user.isBlock ? (
                          <>
                            <HiOutlineCheck className="w-4 h-4" />
                            Unblock
                          </>
                        ) : (
                          <>
                            <HiOutlineNoSymbol className="w-4 h-4" />
                            Block
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && users.length > 0 && (
        <p className="text-sm text-slate-400 mt-4">{users.length} users</p>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import axios from "axios";
import {
  HiOutlineNoSymbol,
  HiOutlineCheck,
  HiOutlineUserPlus,
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import { API_BASE, getAuthHeaders } from "../../src/lib/adminApi";
import UserDetailModal from "../../components/UserDetailModal";
import {
  CUSTOMER_ID_HINT,
  formatCustomerIdInput,
  isValidCustomerId,
} from "../../src/lib/customerId";

const API = API_BASE + "/api/users";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  customerId: "",
  password: "",
  role: "customer",
};

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

function getCurrentUserId() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw)?._id : null;
  } catch {
    return null;
  }
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const currentUserId = getCurrentUserId();

  const handleUserUpdated = (updated) => {
    setUsers((prev) => prev.map((u) => (u._id === updated._id ? { ...u, ...updated } : u)));
    setSelectedUser((prev) => (prev?._id === updated._id ? { ...prev, ...updated } : prev));
    setSuccess("User updated.");
  };

  const handleUserDeleted = (userId) => {
    setUsers((prev) => prev.filter((u) => u._id !== userId));
    setSelectedUser(null);
    setSuccess("User deleted successfully.");
  };

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
      setSuccess(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user.");
    }
  };

  const promoteToAdmin = async (id) => {
    if (!window.confirm("Promote this user to admin? They will have full admin access.")) {
      return;
    }
    try {
      const res = await axios.patch(
        `${API}/${id}/role`,
        { role: "admin" },
        { headers: getAuthHeaders() }
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: res.data.user.role } : u))
      );
      setSuccess(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to promote user.");
    }
  };

  const demoteToCustomer = async (id) => {
    if (!window.confirm("Remove admin access from this user?")) {
      return;
    }
    try {
      const res = await axios.patch(
        `${API}/${id}/role`,
        { role: "customer" },
        { headers: getAuthHeaders() }
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: res.data.user.role } : u))
      );
      setSuccess(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role.");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccess("");

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setFormError("All fields are required.");
      return;
    }
    if (form.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    if (form.role === "customer" && !isValidCustomerId(form.customerId)) {
      setFormError(CUSTOMER_ID_HINT);
      return;
    }

    setFormLoading(true);
    try {
      const res = await axios.post(
        API,
        {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          ...(form.role === "customer" ? { customerId: form.customerId } : {}),
        },
        { headers: getAuthHeaders() }
      );
      setForm(EMPTY_FORM);
      setShowForm(false);
      setSuccess(res.data.message);
      await fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create user.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Users</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage customer and admin accounts — click a row to view and edit details
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm((v) => !v);
            setFormError("");
          }}
          className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
        >
          <HiOutlineUserPlus className="w-5 h-5" />
          {showForm ? "Cancel" : "Add User"}
        </button>
      </div>

      {success && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreateUser}
          className="mb-6 bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Add new user</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">First name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Last name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {form.role === "customer" && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Customer ID *</label>
                <input
                  type="text"
                  value={form.customerId}
                  onChange={(e) =>
                    setForm({ ...form, customerId: formatCustomerIdInput(e.target.value) })
                  }
                  placeholder="1999236512V"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <p className="text-xs text-slate-400 mt-1">{CUSTOMER_ID_HINT}</p>
              </div>
            )}
          </div>

          {formError && (
            <p className="mt-4 text-sm text-red-600">{formError}</p>
          )}

          <button
            type="submit"
            disabled={formLoading}
            className="mt-5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
          >
            {formLoading ? "Creating…" : "Create User"}
          </button>
        </form>
      )}

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
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Name</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Customer ID</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Email</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Role</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-800">
                    {user.firstName} {user.lastName}
                    {user._id === currentUserId && (
                      <span className="ml-2 text-xs text-slate-400">(you)</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-mono text-slate-600">
                    {user.customerId || "—"}
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
                  <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-wrap items-center gap-3">
                      {user.role !== "admin" ? (
                        <>
                          <button
                            onClick={() => promoteToAdmin(user._id)}
                            className="text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center gap-1"
                          >
                            <HiOutlineShieldCheck className="w-4 h-4" />
                            Make admin
                          </button>
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
                        </>
                      ) : user._id !== currentUserId ? (
                        <button
                          onClick={() => demoteToCustomer(user._id)}
                          className="text-sm font-medium text-slate-600 hover:text-slate-800"
                        >
                          Remove admin
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </div>
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

      <UserDetailModal
        user={selectedUser}
        currentUserId={currentUserId}
        onClose={() => setSelectedUser(null)}
        onUserUpdated={handleUserUpdated}
        onUserDeleted={handleUserDeleted}
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import axios from "axios";
import { HiOutlinePlus, HiOutlineWrenchScrewdriver } from "react-icons/hi2";
import AdminAddRepairModal from "../../components/AdminAddRepairModal";
import { API_BASE, getAuthHeaders } from "../../src/lib/adminApi";

const REPAIR_API = API_BASE + "/api/repairs";

const REPAIR_STATUSES = [
  { value: "processing", label: "Processing", selectClass: "bg-blue-50 text-blue-900 border-blue-200" },
  { value: "done", label: "Done", selectClass: "bg-green-100 text-green-900 border-green-300" },
  { value: "cancelled", label: "Cancelled", selectClass: "bg-red-50 text-red-900 border-red-200" },
];

function StatusBadge({ status }) {
  const colors = {
    processing: "bg-blue-100 text-blue-800",
    done: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  const labels = {
    processing: "Processing",
    done: "Done",
    cancelled: "Cancelled",
  };
  const key = status || "processing";
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[key] || "bg-slate-100"}`}>
      {labels[key] || key}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminRepairs() {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [savingId, setSavingId] = useState("");

  const fetchRepairs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(REPAIR_API, { headers: getAuthHeaders() });
      setRepairs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load repairs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const updateRepair = async (repairId, payload) => {
    setSavingId(repairId);
    try {
      const res = await axios.patch(`${REPAIR_API}/${repairId}`, payload, {
        headers: getAuthHeaders(),
      });
      setRepairs((prev) =>
        prev.map((item) => (item.repairId === repairId ? res.data.repair : item))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update repair.");
    } finally {
      setSavingId("");
    }
  };

  const handleReceiveDateChange = (repair, value) => {
    updateRepair(repair.repairId, { receiveDate: value || null });
  };

  const handleStatusChange = (repair, status) => {
    updateRepair(repair.repairId, { status });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <HiOutlineWrenchScrewdriver className="w-7 h-7 text-[#0077b6]" />
            Repairs
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track products received for repair and when they are returned to customers
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0077b6] hover:bg-[#03045e] text-white text-sm font-semibold"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Repair
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex justify-between">
          <span>{error}</span>
          <button onClick={fetchRepairs} className="underline">
            Retry
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading repairs…</div>
        ) : repairs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm px-4">
            No repair records yet. Add one using a customer ID to select their purchased products.
          </div>
        ) : (
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Repair ID</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Order ID</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Customer ID</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Product ID</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Get date</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Receive date</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {repairs.map((repair) => (
                <tr key={repair.repairId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-mono font-semibold text-[#0077b6]">
                    {repair.repairId}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-mono text-slate-600">{repair.orderId}</td>
                  <td className="px-5 py-3.5 text-sm font-mono text-slate-700">{repair.customerId}</td>
                  <td className="px-5 py-3.5 text-sm font-mono text-slate-600">{repair.productId}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-700 whitespace-nowrap">
                    {formatDate(repair.getDate)}
                  </td>
                  <td className="px-5 py-3.5">
                    <input
                      type="date"
                      value={repair.receiveDate ? new Date(repair.receiveDate).toISOString().slice(0, 10) : ""}
                      onChange={(e) => handleReceiveDateChange(repair, e.target.value)}
                      disabled={savingId === repair.repairId}
                      className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={repair.status} />
                  </td>
                  <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={repair.status || "processing"}
                      onChange={(e) => handleStatusChange(repair, e.target.value)}
                      disabled={savingId === repair.repairId}
                      className={`text-sm border rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60 ${
                        REPAIR_STATUSES.find((s) => s.value === (repair.status || "processing"))
                          ?.selectClass || "bg-white border-slate-200"
                      }`}
                    >
                      {REPAIR_STATUSES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AdminAddRepairModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={(repair) => setRepairs((prev) => [repair, ...prev])}
      />
    </div>
  );
}

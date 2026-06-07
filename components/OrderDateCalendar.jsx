import { useEffect, useMemo, useRef, useState } from "react";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCalendarDays,
  HiOutlineChevronDown,
} from "react-icons/hi2";
import {
  formatDateKeyLabel,
  getMonthGrid,
  parseDateKey,
  todayDateKey,
} from "../src/lib/orderDates";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function OrderDateCalendar({ selectedDate, onSelectDate, orderCountByDate = {} }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = parseDateKey(selectedDate);
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  const todayKey = todayDateKey();
  const grid = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    if (!open) return;
    const onOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  useEffect(() => {
    const d = parseDateKey(selectedDate);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [selectedDate]);

  const goMonth = (delta) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const handleSelect = (key) => {
    onSelectDate(key);
    const d = parseDateKey(key);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-800 min-w-[200px] justify-between"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="flex items-center gap-2 min-w-0">
          <HiOutlineCalendarDays className="w-5 h-5 text-[#0077b6] shrink-0" />
          <span className="truncate">
            {formatDateKeyLabel(selectedDate, { weekday: "short" })}
          </span>
        </span>
        <HiOutlineChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 sm:left-auto sm:right-0 z-50 mt-2 w-[min(100vw-2rem,320px)] rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => goMonth(-1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
              aria-label="Previous month"
            >
              <HiOutlineChevronLeft className="w-5 h-5" />
            </button>
            <p className="text-sm font-semibold text-slate-800">{monthLabel}</p>
            <button
              type="button"
              onClick={() => goMonth(1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
              aria-label="Next month"
            >
              <HiOutlineChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-[10px] font-semibold text-slate-400 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {grid.map((key, i) => {
              if (!key) return <div key={`empty-${i}`} />;
              const isSelected = key === selectedDate;
              const isToday = key === todayKey;
              const count = orderCountByDate[key] || 0;
              const dayNum = parseDateKey(key).getDate();

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelect(key)}
                  className={`relative aspect-square rounded-lg text-sm font-medium transition-colors ${
                    isSelected
                      ? "bg-[#0077b6] text-white shadow-sm"
                      : isToday
                        ? "bg-sky-50 text-[#0077b6] ring-2 ring-[#0077b6]/30"
                        : count > 0
                          ? "bg-slate-50 text-slate-800 hover:bg-slate-100"
                          : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {dayNum}
                  {count > 0 && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleSelect(todayKey)}
            className={`mt-3 w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
              selectedDate === todayKey
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, CheckSquare, Target, X } from "lucide-react";
import { api } from "../lib/api";
import { Goal, Task } from "../types";
import { motion, AnimatePresence } from "motion/react";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: "Task" | "Goal";
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const { year, month, daysInMonth, startDay, cells } = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const dim = new Date(y, m + 1, 0).getDate();
    const sd = new Date(y, m, 1).getDay();
    const list = Array.from({ length: sd + dim }, (_, i) => i - sd + 1);
    return { year: y, month: m, daysInMonth: dim, startDay: sd, cells: list };
  }, [currentDate]);

  const today = new Date();
  const isSameDay = (a: Date, b: Date) => (
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
  );

  const formatDateKey = (date: Date) => date.toISOString().split("T")[0];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const [tasks, goals] = await Promise.all([
          api.tasks.getAll(),
          api.goals.getAll()
        ]);

        const taskEvents = (tasks as Task[]).map((t) => ({
          id: `task-${t.id}`,
          title: t.title,
          date: t.due_date,
          type: "Task" as const
        }));

        const goalEvents = (goals as Goal[]).map((g) => ({
          id: `goal-${g.id}`,
          title: g.title,
          date: g.deadline,
          type: "Goal" as const
        }));

        setEvents([...taskEvents, ...goalEvents]);
      } catch (err) {
        console.error("Failed to load calendar events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [events]);

  const selectedKey = formatDateKey(selectedDate);
  const selectedEvents = eventsByDate[selectedKey] || [];

  const goPrevMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">Calendar</h1>
          <p className="text-slate-500 mt-2 font-medium">Plan your month and track important dates.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={goPrevMonth}
            className="p-3 bg-white border border-indigo-100 rounded-lg shadow-sm hover:shadow-md transition-all"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-indigo-500" />
          </button>
          <div className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-black shadow-lg shadow-indigo-300/50">
            {currentDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
          </div>
          <button
            onClick={goNextMonth}
            className="p-3 bg-white border border-indigo-100 rounded-lg shadow-sm hover:shadow-md transition-all"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-indigo-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">
        <div className="bg-white rounded-xl border border-indigo-100/60 shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white shadow-lg">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Month View</p>
              <p className="text-lg font-black text-slate-900">{currentDate.toLocaleString("en-US", { month: "long" })} {year}</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
              <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {cells.map((day, i) => {
              if (day <= 0 || day > daysInMonth) {
                return <div key={`empty-${i}`} className="h-12" />;
              }
              const dateValue = new Date(year, month, day);
              const dateKey = formatDateKey(dateValue);
              const isToday = isSameDay(dateValue, today);
              const isSelected = selectedDate ? isSameDay(dateValue, selectedDate) : false;
              const hasEvents = Boolean(eventsByDate[dateKey]?.length);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(dateValue)}
                  className={
                    "h-12 rounded-lg font-bold transition-all flex items-center justify-center relative " +
                    (isSelected
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200"
                      : isToday
                        ? "bg-indigo-50 text-indigo-600"
                        : "hover:bg-slate-50 text-slate-600")
                  }
                >
                  {day}
                  {hasEvents && !isSelected && (
                    <span className="absolute bottom-2 h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-indigo-100/60 shadow-lg p-8 relative overflow-hidden">
          {/* Decorative Background Gradient */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-100/50 to-teal-100/30 rounded-full -mr-20 -mt-20 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-100/30 to-purple-100/20 rounded-full -ml-16 -mb-16 blur-2xl" />

          <div className="flex items-center gap-3 mb-8 relative z-10">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg"
            >
              <Clock className="w-6 h-6" />
            </motion.div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Selected Date</p>
              <p className="text-lg font-black text-slate-900">
                {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-3">
            {loading ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-slate-50/30 p-8 text-center">
                <p className="text-slate-500 font-medium">Loading events...</p>
              </div>
            ) : selectedEvents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-slate-50/30 p-8 text-center">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-slate-600 font-semibold">No events scheduled</p>
                <p className="text-xs text-slate-400 mt-2">Select a different date or create new events.</p>
              </div>
            ) : (
              selectedEvents.map((ev) => (
                <motion.button
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-left rounded-lg border-2 bg-gradient-to-br transition-all duration-300 hover:shadow-lg overflow-hidden group"
                  style={{
                    borderColor: ev.type === "Task" ? "#d1fae5" : "#fef3c7",
                    background: ev.type === "Task" 
                      ? "linear-gradient(135deg, #f0fdf4 0%, #f0fdfa 100%)"
                      : "linear-gradient(135deg, #fffbf0 0%, #fefce8 100%)"
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg shadow-md ${
                          ev.type === "Task"
                            ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                            : "bg-gradient-to-br from-amber-500 to-orange-500"
                        }`}>
                          {ev.type === "Task" ? (
                            <CheckSquare className="w-4 h-4 text-white" />
                          ) : (
                            <Target className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {ev.title}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                            {ev.type}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border whitespace-nowrap ml-2 ${
                        ev.type === "Task"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-amber-100 text-amber-700 border-amber-200"
                      }`}>
                        {ev.type}
                      </span>
                    </div>
                  </div>
                  <div className={`h-1 w-full transition-all ${
                    ev.type === "Task"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                      : "bg-gradient-to-r from-amber-500 to-orange-500"
                  }`} />
                </motion.button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: 'spring', damping: 15, stiffness: 100 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:max-w-xl z-50 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
            >
              {/* Decorative Background Orbs */}
              <div className={`absolute top-0 right-0 w-40 h-40 ${
                selectedEvent.type === "Task"
                  ? "bg-gradient-to-br from-emerald-100/40 to-teal-100/30"
                  : "bg-gradient-to-br from-amber-100/40 to-orange-100/30"
              } rounded-full -mr-20 -mt-20 blur-3xl`} />
              <div className={`absolute bottom-0 left-0 w-32 h-32 ${
                selectedEvent.type === "Task"
                  ? "bg-gradient-to-tr from-emerald-50/30 to-teal-50/20"
                  : "bg-gradient-to-tr from-amber-50/30 to-orange-50/20"
              } rounded-full -ml-16 -mb-16 blur-3xl`} />

              {/* Header */}
              <div className={`relative p-8 ${
                selectedEvent.type === "Task"
                  ? "bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500"
                  : "bg-linear-to-r from-amber-500 via-orange-500 to-red-500"
              } text-white shadow-lg`}>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-start gap-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-14 h-14 ${
                      selectedEvent.type === "Task"
                        ? "bg-white/30"
                        : "bg-white/30"
                    } backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0`}
                  >
                    {selectedEvent.type === "Task" ? (
                      <CheckSquare className="w-7 h-7" />
                    ) : (
                      <Target className="w-7 h-7" />
                    )}
                  </motion.div>
                  <div className="flex-1 pt-1">
                    <p className="text-xs font-black uppercase tracking-[0.15em] opacity-95 mb-2">
                      {selectedEvent.type === "Task" ? "📋 Task" : "🎯 Goal"}
                    </p>
                    <h2 className="text-3xl font-black leading-tight">{selectedEvent.title}</h2>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6 relative z-10">
                {/* Date Info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`rounded-xl p-6 border-2 backdrop-blur-sm ${
                    selectedEvent.type === "Task"
                      ? "bg-emerald-50/80 border-emerald-200"
                      : "bg-amber-50/80 border-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`text-2xl ${selectedEvent.type === "Task" ? "🗓️" : "📅"}`} />
                    <p className={`text-xs font-black uppercase tracking-widest ${
                      selectedEvent.type === "Task"
                        ? "text-emerald-700"
                        : "text-amber-700"
                    }`}>
                      Scheduled For
                    </p>
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    {new Date(selectedEvent.date).toLocaleDateString("en-US", { 
                      weekday: "long"
                    })}
                  </p>
                  <p className="text-lg font-bold text-slate-700 mt-2">
                    {new Date(selectedEvent.date).toLocaleDateString("en-US", { 
                      month: "long", 
                      day: "numeric",
                      year: "numeric"
                    })}
                  </p>
                </motion.div>

                {/* Type Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-3 items-center"
                >
                  <span className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg ${
                    selectedEvent.type === "Task"
                      ? "bg-emerald-200 text-emerald-800 border border-emerald-300"
                      : "bg-amber-200 text-amber-800 border border-amber-300"
                  }`}>
                    <span className="text-lg">
                      {selectedEvent.type === "Task" ? "✓" : "⭐"}
                    </span>
                    {selectedEvent.type}
                  </span>
                  <span className={`text-xs font-black uppercase tracking-widest px-3 py-2 rounded-lg ${
                    selectedEvent.type === "Task"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    ID: {selectedEvent.id}
                  </span>
                </motion.div>

                {/* Quick Info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`rounded-lg p-4 ${
                    selectedEvent.type === "Task"
                      ? "bg-emerald-100/50"
                      : "bg-amber-100/50"
                  }`}
                >
                  <p className={`text-xs font-black uppercase tracking-widest mb-2 ${
                    selectedEvent.type === "Task"
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }`}>
                    Details
                  </p>
                  <ul className="text-sm font-semibold text-slate-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="text-lg">{selectedEvent.type === "Task" ? "📌" : "🎖️"}</span>
                      <span>Status: {selectedEvent.type}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-lg">📍</span>
                      <span>Type: {selectedEvent.type === "Task" ? "To-Do Item" : "Objective"}</span>
                    </li>
                  </ul>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedEvent(null)}
                  className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-md ${
                    selectedEvent.type === "Task"
                      ? "bg-linear-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-300"
                      : "bg-linear-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-300"
                  }`}
                >
                  Got It
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

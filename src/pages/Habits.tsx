import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Check, 
  CheckCircle2,
  Activity, 
  Calendar, 
  Flame, 
  TrendingUp,
  Eye,
  Pencil,
  Trash2,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { api } from "../lib/api";
import { Habit, HabitLog } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeHabit, setActiveHabit] = useState<Habit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [submitting, setSubmitting] = useState(false);
  const [editName, setEditName] = useState("");
  const [editFrequency, setEditFrequency] = useState("Daily");
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, 1 = next week, etc.

  // For the heatmap/calendar view
  const today = new Date();
  
  // Get week dates based on offset
  const getWeekDates = (offset: number = 0) => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + (offset * 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
  };

  const last7Days = getWeekDates(weekOffset);

  useEffect(() => {
    fetchHabits();
  }, []);

  useEffect(() => {
    // Auto-advance to next week when current week is fully completed
    if (weekOffset === 0 && habits.length > 0) {
      const currentWeekDates = getWeekDates(0);
      const allHabitsCompleted = habits.every(habit =>
        currentWeekDates.every(date =>
          habit.logs.find(l => l.date === date)?.completed === 1
        )
      );

      if (allHabitsCompleted && habits.length > 0) {
        // Give a moment for celebration animation
        const timer = setTimeout(() => {
          setWeekOffset(1);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [habits, weekOffset]);

  const fetchHabits = async () => {
    try {
      const data = await api.habits.getAll();
      setHabits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.habits.create({ name, frequency });
      setIsModalOpen(false);
      setName("");
      setFrequency("Daily");
      fetchHabits();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHabit) return;
    setUpdating(true);
    try {
      await api.habits.update(activeHabit.id, { name: editName, frequency: editFrequency });
      setIsEditOpen(false);
      setActiveHabit(null);
      fetchHabits();
      toast.success("Habit updated");
    } catch (err) {
      toast.error("Failed to update habit");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.habits.delete(id);
      fetchHabits();
      toast.success("Habit deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete habit");
    }
  };

  const openDelete = (habit: Habit) => {
    setDeleteTarget(habit);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await handleDelete(deleteTarget.id);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const openView = (habit: Habit) => {
    setActiveHabit(habit);
    setIsViewOpen(true);
  };

  const openEdit = (habit: Habit) => {
    setActiveHabit(habit);
    setEditName(habit.name);
    setEditFrequency(habit.frequency);
    setIsEditOpen(true);
  };

  const toggleHabit = async (habitId: number, date: string, currentStatus: boolean) => {
    try {
      await api.habits.log(habitId, { date, completed: !currentStatus });
      fetchHabits();
    } catch (err) {
      console.error(err);
    }
  };

  const calculateStreak = (logs: HabitLog[]) => {
    let streak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const completedDates = new Set(logs.filter(l => l.completed).map(l => l.date));

    if (!completedDates.has(todayStr) && !completedDates.has(yesterdayStr)) return 0;
    
    let checkDate = completedDates.has(todayStr) ? todayStr : yesterdayStr;

    while (completedDates.has(checkDate)) {
      streak++;
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split('T')[0];
    }
    return streak;
  };

  const getWeekRangeDisplay = () => {
    const dates = getWeekDates(weekOffset);
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[6]);
    const format = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    return `${format.format(startDate)} - ${format.format(endDate)}`;
  };

  const isCurrentWeek = () => weekOffset === 0;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent tracking-tight">Habit Tracker</h1>
          <p className="text-slate-500 mt-2 font-medium">Build consistency with daily tracking.</p>
          
          {/* Week Navigation */}
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                console.log('Previous clicked, weekOffset:', weekOffset);
                setWeekOffset(weekOffset - 1);
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
              title="View previous week"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            
            <motion.div 
              layout
              className="text-center px-4 py-2 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border border-rose-100 min-w-max"
            >
              <p className="text-xs font-black uppercase tracking-widest text-slate-600">Week of</p>
              <p className="text-sm font-black text-slate-900">{getWeekRangeDisplay()}</p>
              <p className="text-[9px] font-mono bg-slate-100 text-slate-600 rounded px-2 py-0.5 mt-1">Offset: {weekOffset}</p>
              {isCurrentWeek() && <p className="text-[10px] font-black text-rose-600 mt-0.5">📅 CURRENT WEEK</p>}
              {!isCurrentWeek() && weekOffset < 0 && <p className="text-[10px] font-black text-slate-500 mt-0.5">📆 PAST WEEK</p>}
              {!isCurrentWeek() && weekOffset > 0 && <p className="text-[10px] font-black text-slate-500 mt-0.5">📅 UPCOMING WEEK</p>}
            </motion.div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                console.log('Next clicked, weekOffset:', weekOffset);
                setWeekOffset(weekOffset + 1);
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
              title="View next week"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>

            {!isCurrentWeek() && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setWeekOffset(0)}
                className="ml-2 px-3 py-1.5 text-xs font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                title="Back to current week"
              >
                ← Current Week
              </motion.button>
            )}
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-8 py-3.5 rounded-lg font-bold hover:from-rose-700 hover:to-pink-700 transition-all shadow-lg shadow-rose-300/50 flex items-center gap-2 group hover:scale-105"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          New Habit
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Week Status Message */}
        {!isCurrentWeek() && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-5 border-2 ${
              weekOffset < 0
                ? "bg-blue-50 border-blue-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            <p className={`text-sm font-black ${
              weekOffset < 0
                ? "text-blue-800"
                : "text-amber-800"
            }`}>
              {weekOffset < 0 
                ? `📅 Viewing Past Week • All habit logs and completion status shown for ${getWeekRangeDisplay()}`
                : `📅 Viewing Upcoming Week • Prepare your habits for ${getWeekRangeDisplay()}`
              }
            </p>
          </motion.div>
        )}

        {/* Celebration Overlay - Shows when all habits completed and transitioning to next week */}
        <AnimatePresence>
          {weekOffset === 0 && habits.length > 0 && habits.every(habit =>
            getWeekDates(0).every(date =>
              habit.logs.find(l => l.date === date)?.completed === 1
            )
          ) && (
            <>
              {/* Blurred Background */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-40"
              />

              {/* Main Celebration Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', damping: 12, stiffness: 100 }}
                className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
              >
                {/* Animated Background Orbs */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-96 h-96 bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-transparent rounded-full blur-3xl -top-48 -right-48"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [360, 180, 0]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-96 h-96 bg-gradient-to-tl from-cyan-400/20 via-blue-400/10 to-transparent rounded-full blur-3xl -bottom-48 -left-48"
                />

                {/* Floating Particles Animation */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={`particle-${i}`}
                    animate={{
                      y: [0, -300, -400],
                      x: [0, Math.cos(i * Math.PI / 4) * 100, Math.cos(i * Math.PI / 4) * 150],
                      opacity: [1, 0.5, 0]
                    }}
                    transition={{
                      duration: 2 + i * 0.2,
                      repeat: Infinity,
                      ease: 'easeOut'
                    }}
                    className="absolute pointer-events-none"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `rotate(${i * 45}deg)`
                    }}
                  >
                    <div className="text-3xl">✨</div>
                  </motion.div>
                ))}

                {/* Main Content */}
                <motion.div
                  animate={{
                    y: [0, -15, 0]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="text-center relative z-10"
                >
                  {/* Rotating Badge */}
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                      scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                    }}
                    className="inline-flex items-center justify-center w-28 h-28 mb-8"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-full blur-xl opacity-75 animate-pulse" />
                    <div className="relative w-28 h-28 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl">
                      <CheckCircle2 className="w-14 h-14 text-white drop-shadow-lg" />
                    </div>
                  </motion.div>

                  {/* Stars Around */}
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={`star-${i}`}
                      animate={{
                        scale: [1, 1.5, 1],
                        rotate: [0, 360]
                      }}
                      transition={{
                        duration: 1.5 + i * 0.3,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                      className="absolute text-4xl"
                      style={{
                        left: `${50 + 40 * Math.cos(i * Math.PI / 2)}%`,
                        top: `${40 + 40 * Math.sin(i * Math.PI / 2)}%`,
                        transform: `translate(-50%, -50%)`
                      }}
                    >
                      ⭐
                    </motion.div>
                  ))}

                  {/* Main Text */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4 drop-shadow-lg">
                      Week Complete!
                    </h2>
                  </motion.div>

                  {/* Subtitle */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-2xl font-black text-slate-800 mb-8">
                      🔥 Amazing Work! 🔥
                    </p>
                  </motion.div>

                  {/* Details */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3"
                  >
                    <p className="text-lg text-slate-700 font-semibold">
                      You've completed all your habits this week! 🎉
                    </p>
                    <p className="text-md text-slate-600 font-medium">
                      Getting ready for next week's challenges...
                    </p>
                  </motion.div>

                  {/* Progress Indicator */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 flex items-center justify-center gap-2"
                  >
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={`dot-${i}`}
                        animate={{
                          scale: [1, 1.5, 1],
                          backgroundColor: ['#10b981', '#14b8a6', '#06b6d4']
                        }}
                        transition={{
                          duration: 1.2,
                          delay: i * 0.3,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg"
                      />
                    ))}
                  </motion.div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {habits.map((habit) => {
          const streak = calculateStreak(habit.logs);
          const completionRate = habit.logs.length > 0 
            ? Math.round((habit.logs.filter(l => l.completed).length / 30) * 100) 
            : 0;
          
          // Check if current week is fully completed
          const weekCompleted = last7Days.every(date => 
            habit.logs.find(l => l.date === date)?.completed === 1
          );

          return (
            <motion.div 
              layout
              key={habit.id}
              className={cn(
                "bg-white p-8 rounded-xl border shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group",
                weekCompleted ? "border-emerald-200/60 bg-gradient-to-br from-emerald-50/30 to-teal-50/30" : "border-rose-100/60"
              )}
            >
              {/* Celebration Decoration for Completed Week */}
              {weekCompleted && (
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full -mr-32 -mt-32 blur-3xl opacity-40 animate-pulse" />
              )}
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg transition-all",
                    weekCompleted 
                      ? "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-200" 
                      : "bg-gradient-to-br from-rose-500 to-pink-500 shadow-rose-200"
                  )}>
                    {weekCompleted ? (
                      <CheckCircle2 className="w-8 h-8" />
                    ) : (
                      <Activity className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{habit.name}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{habit.frequency}</span>
                      <div className={cn(
                        "flex items-center gap-1.5 font-black text-sm px-3 py-1 rounded-xl border",
                        weekCompleted
                          ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-600 border-emerald-100"
                          : "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 border-amber-100"
                      )}>
                        <Flame className="w-4 h-4" />
                        {streak} Day Streak
                      </div>
                      {weekCompleted && (
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs px-3 py-1 rounded-xl shadow-md shadow-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Week Complete!
                        </div>
                      )}
                    </div>
                    {weekCompleted && isCurrentWeek() && (
                      <p className="text-xs font-semibold text-emerald-600 mt-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Great work! Use navigation to review past weeks or prepare for next week
                      </p>
                    )}
                    {weekCompleted && !isCurrentWeek() && weekOffset < 0 && (
                      <p className="text-xs font-semibold text-slate-500 mt-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Past week completed ✓
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => openView(habit)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-rose-500 to-pink-500 shadow-md shadow-rose-200/60 hover:from-rose-600 hover:to-pink-600 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => openEdit(habit)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200/60 hover:from-amber-600 hover:to-orange-600 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => openDelete(habit)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-rose-500 to-fuchsia-500 shadow-md shadow-rose-200/60 hover:from-rose-600 hover:to-fuchsia-600 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
                  {last7Days.map((date) => {
                    const log = habit.logs.find(l => l.date === date);
                    const isCompleted = log?.completed === 1;
                    const isToday = date === today.toISOString().split('T')[0];
                    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });

                    return (
                      <div key={date} className="flex flex-col items-center gap-2.5 min-w-[56px]">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          isToday ? "text-indigo-600" : "text-slate-400"
                        )}>
                          {dayName}
                        </span>
                        <button
                          onClick={() => toggleHabit(habit.id, date, isCompleted)}
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 border-2 shadow-md",
                            isCompleted 
                              ? weekCompleted
                                ? "bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-500 text-white shadow-emerald-200/50" 
                                : "bg-gradient-to-br from-rose-500 to-pink-500 border-rose-500 text-white shadow-rose-200/50"
                              : "bg-white border-slate-200 text-slate-300 hover:border-rose-300 hover:text-rose-400 hover:shadow-lg hover:scale-105"
                          )}
                        >
                          <Check className={cn("w-5 h-5 transition-transform duration-300 font-bold stroke-[3]", isCompleted ? "scale-100 rotate-0" : "scale-0 rotate-45")} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progress Section */}
              <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Monthly Consistency</span>
                    <span className={cn(
                      "text-sm font-black bg-gradient-to-r bg-clip-text text-transparent",
                      weekCompleted
                        ? "from-emerald-600 to-teal-600"
                        : "from-rose-600 to-pink-600"
                    )}>{completionRate}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(completionRate, 100)}%` }}
                      className={cn(
                        "h-full rounded-full shadow-lg transition-all",
                        weekCompleted
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-300/30"
                          : "bg-gradient-to-r from-rose-500 to-pink-500 shadow-rose-300/30"
                      )}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <div className="text-center px-4 border-r border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">Best Streak</p>
                    <p className="text-lg font-black text-slate-900">12</p>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">Total Days</p>
                    <p className="text-lg font-black text-slate-900">{habit.logs.filter(l => l.completed).length}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {!loading && habits.length === 0 && (
          <div className="text-center py-24 bg-gradient-to-br from-rose-50/50 to-pink-50/50 rounded-xl border border-dashed border-rose-200">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 rounded-lg mb-6 shadow-lg">
              <Activity className="w-10 h-10 text-rose-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900">No habits tracked</h3>
            <p className="text-slate-400 font-medium mt-2">Start building better habits today.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:max-w-md bg-white rounded-xl shadow-2xl z-[110] p-10 border border-slate-100 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">New Habit</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Habit Name</label>
                  <input 
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-rose-500/5 outline-none font-bold text-slate-900 transition-all"
                    placeholder="e.g., Morning Meditation"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequency</label>
                  <select 
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-rose-500/5 outline-none font-bold text-slate-700 transition-all appearance-none"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Weekdays">Weekdays</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-5 rounded-xl font-black text-lg hover:from-rose-700 hover:to-pink-700 transition-all shadow-lg shadow-rose-300/50 flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
                >
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Start Tracking"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {isViewOpen && activeHabit && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsViewOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:max-w-lg bg-white rounded-xl shadow-2xl z-[110] overflow-hidden border border-rose-100"
            >
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full -mr-36 -mt-36 blur-3xl opacity-60" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-rose-50 to-pink-50 rounded-full -ml-28 -mb-28 blur-2xl opacity-50" />
              
              {/* Header */}
              <div className="relative bg-gradient-to-r from-rose-500 to-pink-500 p-8 pb-20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Habit Details</h2>
                  </div>
                  <button onClick={() => setIsViewOpen(false)} className="p-2.5 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="relative -mt-12 px-8 pb-8 space-y-6">
                {/* Name Card */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-rose-100">
                  <p className="text-xs font-black text-rose-600 uppercase tracking-widest mb-3">Habit Name</p>
                  <p className="text-xl font-black bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">{activeHabit.name}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Frequency Card */}
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-5 border border-rose-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg mb-3">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs font-black text-rose-600 uppercase tracking-widest mb-2">Frequency</p>
                    <p className="text-lg font-black text-slate-900">{activeHabit.frequency}</p>
                  </div>

                  {/* Streak Card */}
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-5 border border-rose-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg mb-3">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs font-black text-rose-600 uppercase tracking-widest mb-2">Streak</p>
                    <p className="text-lg font-black text-slate-900">{calculateStreak(activeHabit.logs)} <span className="text-sm text-slate-500">days</span></p>
                  </div>
                </div>

                {/* Completion Card */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-rose-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-black text-rose-600 uppercase tracking-widest">30-Day Completion</p>
                    <span className="text-3xl font-black bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                      {activeHabit.logs.length > 0 ? Math.round((activeHabit.logs.filter(l => l.completed).length / 30) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${activeHabit.logs.length > 0 ? Math.round((activeHabit.logs.filter(l => l.completed).length / 30) * 100) : 0}%` }}
                      className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditOpen && activeHabit && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:max-w-md bg-white rounded-xl shadow-2xl z-[110] p-8 border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">Edit Habit</h2>
                <button onClick={() => setIsEditOpen(false)} className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-5">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Habit Name</label>
                  <input
                    required
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-rose-500/5 outline-none font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Frequency</label>
                  <select
                    value={editFrequency}
                    onChange={(e) => setEditFrequency(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-rose-500/5 outline-none font-bold text-slate-700"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Weekdays">Weekdays</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-3.5 rounded-lg font-black hover:from-rose-700 hover:to-pink-700 transition-all shadow-lg shadow-rose-300/50"
                >
                  {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteOpen && deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:max-w-md bg-white rounded-xl shadow-2xl z-[110] p-8 border border-slate-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-slate-900">Delete Habit</h2>
                <button onClick={() => setIsDeleteOpen(false)} className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <p className="text-slate-600 font-medium">
                Are you sure you want to delete <span className="font-black text-slate-900">{deleteTarget.name}</span>?
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="flex-1 py-3 rounded-lg font-black text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-lg font-black text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-200/60"
                >
                  {deleting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Delete"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

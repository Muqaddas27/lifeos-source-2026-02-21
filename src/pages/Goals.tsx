import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Target, 
  Calendar, 
  TrendingUp, 
  X, 
  Loader2,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2
} from "lucide-react";
import { api } from "../lib/api";
import { Goal } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const data = await api.goals.getAll();
      setGoals(data);
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
      await api.goals.create({ title, target_value: parseFloat(targetValue), deadline });
      setIsModalOpen(false);
      setTitle("");
      setTargetValue("");
      setDeadline("");
      fetchGoals();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const updateProgress = async (id: number, currentValue: number, increment: number) => {
    try {
      await api.goals.update(id, { current_value: currentValue + increment });
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.goals.delete(id);
      fetchGoals();
      toast.success("Goal deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete goal");
    }
  };

  const openDelete = (goal: Goal) => {
    setDeleteTarget(goal);
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

  const openEdit = (goal: Goal) => {
    setActiveGoal(goal);
    setEditValue(goal.current_value.toString());
    setIsEditOpen(true);
  };

  const openView = (goal: Goal) => {
    setActiveGoal(goal);
    setIsViewOpen(true);
  };

  const handleUpdateValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoal) return;
    setUpdating(true);
    try {
      await api.goals.update(activeGoal.id, { current_value: parseFloat(editValue) });
      setIsEditOpen(false);
      setActiveGoal(null);
      fetchGoals();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent tracking-tight">Goals</h1>
          <p className="text-slate-500 mt-2 font-medium">Set ambitious goals and track your progress.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-3.5 rounded-lg font-bold hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg shadow-amber-300/50 flex items-center gap-2 group hover:scale-105"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Set New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {goals.map((goal) => {
          const progress = (goal.current_value / goal.target_value) * 100;
          const isCompleted = progress >= 100;

          return (
            <motion.div 
              layout
              key={goal.id}
              className="bg-white p-8 rounded-xl border border-amber-100/60 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
            >
              {isCompleted && (
                <div className="absolute top-6 right-6 text-emerald-500 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent tracking-tight">{goal.title}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 uppercase tracking-widest bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1 rounded-lg border border-amber-100">
                      <Calendar className="w-3 h-3" /> 
                      {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Progress</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">
                      {goal.current_value.toLocaleString()} <span className="text-slate-400 text-base font-bold">/ {goal.target_value.toLocaleString()}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{Math.round(progress)}%</p>
                  </div>
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Remaining: {(goal.target_value - goal.current_value).toLocaleString()}</span>
                  <span className="text-amber-600">Target: {goal.target_value.toLocaleString()}</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button 
                    onClick={() => openView(goal)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-200/60 hover:from-amber-600 hover:to-orange-600 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button 
                    onClick={() => openEdit(goal)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-200/60 hover:from-indigo-600 hover:to-purple-600 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Value
                  </button>
                  <button 
                    onClick={() => openDelete(goal)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-rose-500 to-pink-500 shadow-md shadow-rose-200/60 hover:from-rose-600 hover:to-pink-600 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <button 
                    onClick={() => updateProgress(goal.id, goal.current_value, 1)}
                    className="px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 border border-amber-200 hover:from-amber-100 hover:to-orange-100 transition-all"
                  >
                    +1
                  </button>
                  <button 
                    onClick={() => updateProgress(goal.id, goal.current_value, 10)}
                    className="px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 border border-amber-200 hover:from-amber-100 hover:to-orange-100 transition-all"
                  >
                    +10
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {!loading && goals.length === 0 && (
          <div className="md:col-span-2 text-center py-24 bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl border border-dashed border-amber-200">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg mb-6 shadow-lg">
              <Target className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900">No goals set</h3>
            <p className="text-slate-400 font-medium mt-2">Dream big and start tracking your goals.</p>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      <AnimatePresence>
        {isViewOpen && activeGoal && (
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
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:max-w-lg bg-white rounded-xl shadow-2xl z-[110] overflow-hidden border border-amber-100"
            >
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full -mr-36 -mt-36 blur-3xl opacity-60" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-amber-50 to-orange-50 rounded-full -ml-28 -mb-28 blur-2xl opacity-50" />
              
              {/* Header */}
              <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-8 pb-20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Goal Details</h2>
                  </div>
                  <button onClick={() => setIsViewOpen(false)} className="p-2.5 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="relative -mt-12 px-8 pb-8 space-y-6">
                {/* Title Card */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-amber-100">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs font-black text-amber-600 uppercase tracking-widest">Goal Title</p>
                    {((activeGoal.current_value / activeGoal.target_value) * 100) >= 100 && (
                      <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-black rounded-lg shadow-md">
                        COMPLETED
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{activeGoal.title}</p>
                </div>

                {/* Progress Card */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2">Progress</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900">{activeGoal.current_value.toLocaleString()}</span>
                        <span className="text-lg font-bold text-slate-400">/ {activeGoal.target_value.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        {Math.round((activeGoal.current_value / activeGoal.target_value) * 100)}%
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((activeGoal.current_value / activeGoal.target_value) * 100, 100)}%` }}
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Deadline Card */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-amber-600 uppercase tracking-widest">Deadline</p>
                      <p className="text-lg font-bold text-slate-900">{new Date(activeGoal.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Value Modal */}
      <AnimatePresence>
        {isEditOpen && activeGoal && (
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
                <h2 className="text-2xl font-black text-slate-900">Edit Progress</h2>
                <button onClick={() => setIsEditOpen(false)} className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleUpdateValue} className="space-y-5">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Current Value</label>
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-amber-500/5 outline-none font-bold text-slate-900"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3.5 rounded-lg font-black hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg shadow-amber-300/50"
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
                <h2 className="text-2xl font-black text-slate-900">Delete Goal</h2>
                <button onClick={() => setIsDeleteOpen(false)} className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <p className="text-slate-600 font-medium">
                Are you sure you want to delete <span className="font-black text-slate-900">{deleteTarget.title}</span>?
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
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Set New Goal</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Goal Title</label>
                  <input 
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-amber-500/5 outline-none font-bold text-slate-900 transition-all"
                    placeholder="e.g., Save for a new laptop"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Value</label>
                  <input 
                    required
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-amber-500/5 outline-none font-bold text-slate-900 transition-all"
                    placeholder="e.g., 1500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Deadline</label>
                  <input 
                    required
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-amber-500/5 outline-none font-bold text-slate-700 transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-5 rounded-xl font-black text-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg shadow-amber-300/50 flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
                >
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Set Goal"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

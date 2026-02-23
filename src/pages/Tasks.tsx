import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Eye,
  Pencil,
  Calendar,
  AlertCircle,
  X,
  Loader2
} from "lucide-react";
import { api } from "../lib/api";
import { Task } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import TagInput from "../components/TagInput";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task['priority']>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("Work");
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<Task['priority']>("MEDIUM");
  const [editDueDate, setEditDueDate] = useState("");
  const [editCategory, setEditCategory] = useState("Work");
  const [editStatus, setEditStatus] = useState<Task['status']>("PENDING");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await api.tasks.getAll();
      setTasks(data);
    } catch (err) {
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.tasks.create({ title, description, priority, due_date: dueDate, category });
      setIsModalOpen(false);
      resetForm();
      fetchTasks();
      toast.success("Task created successfully");
    } catch (err) {
      toast.error("Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === 'PENDING' ? 'COMPLETED' : 'PENDING';
    try {
      await api.tasks.update(task.id, { ...task, status: newStatus });
      fetchTasks();
      if (newStatus === 'COMPLETED') {
        toast.success("Task marked as completed!");
      }
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.tasks.delete(id);
      fetchTasks();
      toast.success("Task deleted");
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setDueDate("");
    setCategory("Work");
  };

  const openView = (task: Task) => {
    setActiveTask(task);
    setIsViewOpen(true);
  };

  const openEdit = (task: Task) => {
    setActiveTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditPriority(task.priority);
    setEditDueDate(task.due_date);
    setEditCategory(task.category);
    setEditStatus(task.status);
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask) return;
    setUpdating(true);
    try {
      await api.tasks.update(activeTask.id, {
        ...activeTask,
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        due_date: editDueDate,
        category: editCategory,
        status: editStatus
      });
      setIsEditOpen(false);
      setActiveTask(null);
      fetchTasks();
      toast.success("Task updated");
    } catch (err) {
      toast.error("Failed to update task");
    } finally {
      setUpdating(false);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || t.status === filter;
    return matchesSearch && matchesFilter;
  });

  const isOverdue = (date: string) => {
    return new Date(date) < new Date() && new Date(date).toDateString() !== new Date().toDateString();
  };

  const isDueToday = (date: string) => {
    return new Date(date).toDateString() === new Date().toDateString();
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent tracking-tight">Tasks</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage your daily to-dos and priorities.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3.5 rounded-lg font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-300/50 flex items-center gap-2 group hover:scale-105"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Add New Task
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-400 w-5 h-5 group-focus-within:text-emerald-600 transition-colors" />
          <input 
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl shadow-md focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-200 outline-none transition-all font-medium"
          />
        </div>
        <div className="flex p-1.5 bg-white border border-emerald-100/60 rounded-xl shadow-md">
          {["ALL", "PENDING", "COMPLETED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all",
                filter === f ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg" : "text-slate-400 hover:text-emerald-600"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={task.id}
              className={cn(
                "bg-white p-6 rounded-xl border border-emerald-100/60 shadow-lg flex items-center gap-6 group transition-all hover:shadow-xl",
                task.status === 'COMPLETED' && "opacity-60 grayscale-[0.5]",
                task.status === 'PENDING' && isOverdue(task.due_date) && "border-rose-200 bg-rose-50/20"
              )}
            >
              <button 
                onClick={() => toggleStatus(task)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                  task.status === 'COMPLETED' 
                    ? "bg-gradient-to-br from-emerald-600 to-teal-600 border-emerald-600 text-white" 
                    : "border-slate-200 text-transparent hover:border-emerald-400"
                )}
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className={cn(
                    "font-bold text-slate-900 text-lg truncate",
                    task.status === 'COMPLETED' && "line-through text-slate-400"
                  )}>
                    {task.title}
                  </h3>
                  {task.status === 'PENDING' && isOverdue(task.due_date) && (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Overdue</span>
                  )}
                  {task.status === 'PENDING' && isDueToday(task.due_date) && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Due Today</span>
                  )}
                </div>
                
                {task.description && (
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full border",
                    task.priority === 'HIGH' ? "bg-rose-50 text-rose-600 border-rose-100" : 
                    task.priority === 'MEDIUM' ? "bg-amber-50 text-amber-600 border-amber-100" : 
                    "bg-indigo-50 text-indigo-600 border-indigo-100"
                  )}>
                    {task.priority}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" /> 
                    {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5" /> 
                    {task.category}
                  </div>
                  <div className="h-4 w-[1px] bg-slate-200 mx-1" />
                  <TagInput entityType="TASK" entityId={task.id} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openView(task)}
                  className="p-3 text-white bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-md shadow-emerald-200/60 hover:from-emerald-600 hover:to-teal-600 transition-all"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => openEdit(task)}
                  className="p-3 text-white bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-md shadow-amber-200/60 hover:from-amber-600 hover:to-orange-600 transition-all"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(task.id)}
                  className="p-3 text-white bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl shadow-md shadow-rose-200/60 hover:from-rose-600 hover:to-pink-600 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!loading && filteredTasks.length === 0 && (
          <div className="text-center py-24 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-xl border border-dashed border-emerald-200">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg mb-6 shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900">No tasks found</h3>
            <p className="text-slate-400 font-medium mt-2">Try adding your first task to get started!</p>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      <AnimatePresence>
        {isViewOpen && activeTask && (
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
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:max-w-lg bg-white rounded-xl shadow-2xl z-[110] p-8 border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">Task Details</h2>
                <button onClick={() => setIsViewOpen(false)} className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Title</p>
                  <p className="text-lg font-bold text-slate-900">{activeTask.title}</p>
                </div>
                {activeTask.description && (
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Description</p>
                    <p className="text-slate-600">{activeTask.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Priority</p>
                    <p className="font-bold text-slate-900">{activeTask.priority}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Status</p>
                    <p className="font-bold text-slate-900">{activeTask.status}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Category</p>
                    <p className="font-bold text-slate-900">{activeTask.category}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Due Date</p>
                    <p className="font-bold text-slate-900">{new Date(activeTask.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditOpen && activeTask && (
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
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:max-w-xl bg-white rounded-xl shadow-2xl z-[110] p-10 border border-slate-100 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Edit Task</h2>
                <button onClick={() => setIsEditOpen(false)} className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
                  <input 
                    required
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-slate-900 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none h-28 resize-none font-medium text-slate-600 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                    <select 
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as Task['priority'])}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-slate-700 transition-all appearance-none"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <select 
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as Task['status'])}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-slate-700 transition-all appearance-none"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-slate-700 transition-all appearance-none"
                    >
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Study">Study</option>
                      <option value="Health">Health</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                    <input 
                      required
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-slate-700 transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={updating}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-5 rounded-xl font-black text-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-300/50 flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
                >
                  {updating ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save Changes"}
                </button>
              </form>
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
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:max-w-xl bg-white rounded-xl shadow-2xl z-[110] p-10 border border-slate-100 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">New Task</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
                  <input 
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-slate-900 transition-all"
                    placeholder="What needs to be done?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none h-28 resize-none font-medium text-slate-600 transition-all"
                    placeholder="Add more context..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                    <select 
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-slate-700 transition-all appearance-none"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-slate-700 transition-all appearance-none"
                    >
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Study">Study</option>
                      <option value="Health">Health</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                  <input 
                    required
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-slate-700 transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-5 rounded-xl font-black text-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-300/50 flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
                >
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Create Task"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

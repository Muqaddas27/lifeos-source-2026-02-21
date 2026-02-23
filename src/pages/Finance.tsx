import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Eye,
  Pencil,
  Trash2,
  X,
  Loader2,
  Search,
  DollarSign,
  Calendar,
  Tag
} from "lucide-react";
import { api } from "../lib/api";
import { FinanceEntry } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Finance() {
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeEntry, setActiveEntry] = useState<FinanceEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FinanceEntry | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  
  // Form state
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editType, setEditType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("Food");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState(new Date().toISOString().split('T')[0]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchFinance();
  }, []);

  const fetchFinance = async () => {
    try {
      const data = await api.finance.getAll();
      setEntries(data);
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
      await api.finance.create({ type, amount: parseFloat(amount), category, description, date });
      setIsModalOpen(false);
      resetForm();
      fetchFinance();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setCategory("Food");
    setDescription("");
    setDate(new Date().toISOString().split('T')[0]);
  };

  const openView = (entry: FinanceEntry) => {
    setActiveEntry(entry);
    setIsViewOpen(true);
  };

  const openEdit = (entry: FinanceEntry) => {
    setActiveEntry(entry);
    setEditType(entry.type);
    setEditAmount(entry.amount.toString());
    setEditCategory(entry.category);
    setEditDescription(entry.description);
    setEditDate(entry.date);
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEntry) return;
    setUpdating(true);
    try {
      await api.finance.update(activeEntry.id, {
        type: editType,
        amount: parseFloat(editAmount),
        category: editCategory,
        description: editDescription,
        date: editDate
      });
      setIsEditOpen(false);
      setActiveEntry(null);
      fetchFinance();
      toast.success("Transaction updated");
    } catch (err) {
      toast.error("Failed to update transaction");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.finance.delete(id);
      fetchFinance();
      toast.success("Transaction deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete transaction");
    }
  };

  const openDelete = (entry: FinanceEntry) => {
    setDeleteTarget(entry);
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

  const totalIncome = entries.filter(e => e.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.description.toLowerCase().includes(search.toLowerCase())
      || entry.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === 'ALL' || entry.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">Finance Tracker</h1>
          <p className="text-slate-500 mt-2 font-medium">Monitor your income and expenses.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3.5 rounded-lg font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-300/50 flex items-center gap-2 group hover:scale-105"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-xl border border-blue-100/60 shadow-lg group hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Balance</p>
          <h4 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">${balance.toLocaleString()}</h4>
        </div>
        <div className="bg-white p-8 rounded-xl border border-emerald-100/60 shadow-lg group hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Income</p>
          <h4 className="text-3xl font-black text-emerald-600 mt-1 tracking-tight">+${totalIncome.toLocaleString()}</h4>
        </div>
        <div className="bg-white p-8 rounded-xl border border-rose-100/60 shadow-lg group hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Expenses</p>
          <h4 className="text-3xl font-black text-rose-600 mt-1 tracking-tight">-${totalExpense.toLocaleString()}</h4>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-blue-100/60 shadow-lg overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-cyan-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Transactions</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Showing {filteredEntries.length} of {entries.length}</p>
          </div>
        </div>
        <div className="p-6 border-b border-slate-50 bg-white">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search by description or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-3.5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-lg shadow-md focus:ring-4 focus:ring-blue-500/10 focus:border-blue-200 outline-none transition-all font-medium"
              />
            </div>
            <div className="flex p-1.5 bg-white border border-blue-100 rounded-lg shadow-md">
              {(['ALL', 'INCOME', 'EXPENSE'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={cn(
                    "px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all",
                    filterType === f ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg" : "text-slate-400 hover:text-blue-600"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Description</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5 text-right">Amount</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                        entry.type === 'INCOME' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {entry.type === 'INCOME' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <span className="font-bold text-slate-900 text-base">{entry.description}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border",
                      entry.type === "INCOME"
                        ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-600 border-emerald-100"
                        : "bg-gradient-to-r from-rose-50 to-pink-50 text-rose-600 border-rose-100"
                    )}>
                      {entry.category}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-500">
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className={cn(
                    "px-8 py-6 text-right font-black text-lg tracking-tight",
                    entry.type === 'INCOME' ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {entry.type === 'INCOME' ? '+' : '-'}${entry.amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openView(entry)}
                        className="p-2 text-white bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-md shadow-blue-200/60 hover:from-blue-600 hover:to-cyan-600 transition-all"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openEdit(entry)}
                        className="p-2 text-white bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg shadow-md shadow-amber-200/60 hover:from-amber-600 hover:to-orange-600 transition-all"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openDelete(entry)}
                        className="p-2 text-white bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg shadow-md shadow-rose-200/60 hover:from-rose-600 hover:to-pink-600 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg mb-6 shadow-lg">
                      <DollarSign className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">No transactions found</h3>
                    <p className="text-slate-400 font-medium mt-2">Try adjusting your search or filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Add Transaction</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6 relative z-10">
                <div className="flex p-1.5 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setType('EXPENSE')}
                    className={cn(
                      "flex-1 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all",
                      type === 'EXPENSE' ? "bg-white text-rose-600 shadow-sm" : "text-slate-400"
                    )}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('INCOME')}
                    className={cn(
                      "flex-1 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all",
                      type === 'INCOME' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"
                    )}
                  >
                    Income
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      required
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none font-black text-slate-900 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-slate-700 transition-all appearance-none"
                  >
                    {type === 'EXPENSE' ? (
                      <>
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Bills">Bills</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Health">Health</option>
                        <option value="Other">Other</option>
                      </>
                    ) : (
                      <>
                        <option value="Salary">Salary</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Investment">Investment</option>
                        <option value="Gift">Gift</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <input 
                    required
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-slate-900 transition-all"
                    placeholder="e.g., Grocery shopping"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                  <input 
                    required
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-slate-700 transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className={cn(
                    "w-full py-5 rounded-xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-70 text-white",
                    type === 'INCOME' ? "bg-emerald-600 hover:bg-emerald-700 shadow-[0_15px_30px_-5px_rgba(16,185,129,0.4)]" : "bg-rose-600 hover:bg-rose-700 shadow-[0_15px_30px_-5px_rgba(239,68,68,0.4)]"
                  )}
                >
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Add Transaction"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {isViewOpen && activeEntry && (
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
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:max-w-lg bg-white rounded-xl shadow-2xl z-[110] overflow-hidden border border-blue-100"
            >
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full -mr-36 -mt-36 blur-3xl opacity-60" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-blue-50 to-cyan-50 rounded-full -ml-28 -mb-28 blur-2xl opacity-50" />
              
              {/* Header */}
              <div className={`relative p-8 pb-20 ${activeEntry.type === 'INCOME' ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Transaction Details</h2>
                  </div>
                  <button onClick={() => setIsViewOpen(false)} className="p-2.5 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="relative -mt-12 px-8 pb-8 space-y-6">
                {/* Amount Card - Featured */}
                <div className={`rounded-xl p-8 shadow-lg border text-center ${activeEntry.type === 'INCOME' ? 'bg-gradient-to-br from-emerald-500 to-green-500 border-emerald-400' : 'bg-gradient-to-br from-blue-500 to-cyan-500 border-blue-400'}`}>
                  <p className="text-xs font-black text-white/80 uppercase tracking-widest mb-2">Amount</p>
                  <p className="text-5xl font-black text-white">${activeEntry.amount.toLocaleString()}</p>
                  <div className="mt-3 inline-flex px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                    <p className="text-sm font-black text-white">{activeEntry.type}</p>
                  </div>
                </div>

                {/* Description Card */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                  <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">Description</p>
                  <p className="text-lg font-bold text-slate-900">{activeEntry.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Category Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg mb-3">
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Category</p>
                    <p className="text-base font-black text-slate-900">{activeEntry.category}</p>
                  </div>

                  {/* Date Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg mb-3">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Date</p>
                    <p className="text-base font-black text-slate-900">{new Date(activeEntry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditOpen && activeEntry && (
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
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:max-w-md bg-white rounded-xl shadow-2xl z-[110] p-10 border border-slate-100 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Edit Transaction</h2>
                <button onClick={() => setIsEditOpen(false)} className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6 relative z-10">
                <div className="flex p-1.5 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setEditType('EXPENSE')}
                    className={cn(
                      "flex-1 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all",
                      editType === 'EXPENSE' ? "bg-white text-rose-600 shadow-sm" : "text-slate-400"
                    )}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType('INCOME')}
                    className={cn(
                      "flex-1 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all",
                      editType === 'INCOME' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"
                    )}
                  >
                    Income
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      required
                      type="number"
                      step="0.01"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none font-black text-slate-900 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <select 
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-slate-700 transition-all appearance-none"
                  >
                    {editType === 'EXPENSE' ? (
                      <>
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Bills">Bills</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Health">Health</option>
                        <option value="Other">Other</option>
                      </>
                    ) : (
                      <>
                        <option value="Salary">Salary</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Investment">Investment</option>
                        <option value="Gift">Gift</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <input 
                    required
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-slate-900 transition-all"
                    placeholder="e.g., Grocery shopping"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                  <input 
                    required
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-slate-700 transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={updating}
                  className={cn(
                    "w-full py-5 rounded-xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-70 text-white",
                    editType === 'INCOME' ? "bg-emerald-600 hover:bg-emerald-700 shadow-[0_15px_30px_-5px_rgba(16,185,129,0.4)]" : "bg-rose-600 hover:bg-rose-700 shadow-[0_15px_30px_-5px_rgba(239,68,68,0.4)]"
                  )}
                >
                  {updating ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save Changes"}
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
                <h2 className="text-2xl font-black text-slate-900">Delete Transaction</h2>
                <button onClick={() => setIsDeleteOpen(false)} className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <p className="text-slate-600 font-medium">
                Are you sure you want to delete <span className="font-black text-slate-900">{deleteTarget.description}</span>?
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

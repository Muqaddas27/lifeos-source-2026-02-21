import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  StickyNote, 
  Trash2, 
  Eye,
  Pencil,
  X, 
  Loader2,
  ChevronRight,
  FileText
} from "lucide-react";
import { api } from "../lib/api";
import { Note } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import TagInput from "../components/TagInput";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [search, setSearch] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  
  // Form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const data = await api.notes.getAll();
      setNotes(data);
    } catch (err) {
      toast.error("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.notes.update(editingId, { title, content });
        toast.success("Note updated");
      } else {
        await api.notes.create({ title, content });
        toast.success("Note created");
      }
      setIsModalOpen(false);
      resetForm();
      fetchNotes();
    } catch (err) {
      toast.error("Failed to save note");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await api.notes.delete(id);
      fetchNotes();
      toast.success("Note deleted");
    } catch (err) {
      toast.error("Failed to delete note");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setIsPreview(false);
  };

  const openEdit = (note: Note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setIsPreview(false);
    setIsModalOpen(true);
  };

  const openView = (note: Note) => {
    setActiveNote(note);
    setIsViewOpen(true);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent tracking-tight">Notes</h1>
          <p className="text-slate-500 mt-2 font-medium">Capture your thoughts and ideas with Markdown support.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-3.5 rounded-lg font-bold hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-300/50 flex items-center gap-2 group hover:scale-105"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          New Note
        </button>
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-violet-400 w-5 h-5 group-focus-within:text-violet-600 transition-colors" />
        <input 
          type="text"
          placeholder="Search your notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-14 pr-6 py-3.5 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-xl shadow-md focus:ring-4 focus:ring-violet-500/10 focus:border-violet-200 outline-none transition-all font-medium"
        />
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredNotes.map((note) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={note.id}
              onClick={() => openEdit(note)}
              className="bg-white p-8 rounded-xl border border-violet-100/60 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-[320px]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-500 text-white rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <StickyNote className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); openView(note); }}
                    className="p-2 text-white bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl shadow-md shadow-violet-200/60 hover:from-violet-600 hover:to-purple-600 transition-all"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(note); }}
                    className="p-2 text-white bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-md shadow-amber-200/60 hover:from-amber-600 hover:to-orange-600 transition-all"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                    className="p-2 text-white bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl shadow-md shadow-rose-200/60 hover:from-rose-600 hover:to-pink-600 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-3 line-clamp-2 tracking-tight group-hover:scale-105 transition-transform">
                {note.title}
              </h3>
              <div className="flex-1 overflow-hidden">
                <p className="text-slate-500 text-sm font-medium line-clamp-4 leading-relaxed">
                  {note.content}
                </p>
              </div>
              <div className="mt-4">
                <TagInput entityType="NOTE" entityId={note.id} />
              </div>
              <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {new Date(note.updated_at).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1 bg-gradient-to-r from-violet-50 to-purple-50 text-violet-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity border border-violet-100">
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!loading && filteredNotes.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 text-center py-24 bg-gradient-to-br from-violet-50/50 to-purple-50/50 rounded-xl border border-dashed border-violet-200">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-lg mb-6 shadow-lg">
              <StickyNote className="w-10 h-10 text-violet-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900">No notes found</h3>
            <p className="text-slate-400 font-medium mt-2">Start writing down your ideas today!</p>
          </div>
        )}
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {isViewOpen && activeNote && (
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
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl w-full bg-white rounded-xl shadow-2xl z-[110] overflow-hidden border border-violet-100"
            >
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full -mr-48 -mt-48 blur-3xl opacity-60" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-50 to-purple-50 rounded-full -ml-32 -mb-32 blur-2xl opacity-50" />
              
              {/* Header */}
              <div className="relative bg-gradient-to-r from-violet-500 to-purple-500 p-8 pb-20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                      <StickyNote className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Note Details</h2>
                  </div>
                  <button onClick={() => setIsViewOpen(false)} className="p-2.5 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="relative -mt-12 px-8 pb-8 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Title Card */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-violet-100">
                  <p className="text-xs font-black text-violet-600 uppercase tracking-widest mb-3">Title</p>
                  <p className="text-2xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{activeNote.title}</p>
                  <div className="flex items-center gap-2 mt-4">
                    <div className="px-3 py-1 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-100">
                      <p className="text-xs font-black text-violet-600">Created: {new Date(activeNote.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                {/* Content Card */}
                <div className="bg-gradient-to-br from-violet-50/50 to-purple-50/50 rounded-xl p-8 border border-violet-100 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs font-black text-violet-600 uppercase tracking-widest">Content</p>
                  </div>
                  <div className="prose prose-slate max-w-none bg-white rounded-lg p-6 shadow-inner border border-violet-100">
                    <ReactMarkdown>{activeNote.content || "*No content*"}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Editor Modal */}
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
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl w-full bg-white rounded-xl shadow-2xl z-[110] p-10 border border-slate-100 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-6">
                  <h2 className="text-3xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                    {editingId ? "Edit Note" : "New Note"}
                  </h2>
                  <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button 
                      onClick={() => setIsPreview(false)}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                        !isPreview ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => setIsPreview(true)}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                        isPreview ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      Preview
                    </button>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                  <input 
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-violet-500/5 outline-none font-black text-2xl text-slate-900 transition-all"
                    placeholder="Note title..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Content</label>
                  {isPreview ? (
                    <div className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-lg h-[300px] overflow-y-auto prose prose-slate prose-violet max-w-none">
                      <ReactMarkdown>{content || "*No content to preview*"}</ReactMarkdown>
                    </div>
                  ) : (
                    <textarea 
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-violet-500/5 outline-none h-[300px] resize-none font-medium text-slate-600 transition-all leading-relaxed"
                      placeholder="Start writing your thoughts in Markdown..."
                    />
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-5 rounded-xl font-black text-lg text-slate-400 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] bg-gradient-to-r from-violet-600 to-purple-600 text-white py-5 rounded-xl font-black text-lg hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-300/50 flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (editingId ? "Save Changes" : "Create Note")}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

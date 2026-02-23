import React, { useState, useEffect } from "react";
import { Tag as TagIcon, Plus, X } from "lucide-react";
import { api } from "../lib/api";
import { Tag } from "../types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TagInputProps {
  entityType: 'TASK' | 'NOTE';
  entityId: number;
}

export default function TagInput({ entityType, entityId }: TagInputProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  useEffect(() => {
    fetchTags();
  }, [entityId]);

  const fetchTags = async () => {
    try {
      const [entityTags, userTags] = await Promise.all([
        api.tags.getRelations(entityType, entityId),
        api.tags.getAll()
      ]);
      setTags(entityTags);
      setAllTags(userTags);
    } catch (e) {
      console.error("Failed to fetch tags");
    }
  };

  const handleAddTag = async (tag: Tag) => {
    if (tags.some(t => t.id === tag.id)) return;
    try {
      await api.tags.addRelation({ tag_id: tag.id, entity_type: entityType, entity_id: entityId });
      setTags([...tags, tag]);
    } catch (e) {
      console.error("Failed to add tag relation");
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const colors = ["bg-rose-100 text-rose-600", "bg-indigo-100 text-indigo-600", "bg-emerald-100 text-emerald-600", "bg-amber-100 text-amber-600", "bg-violet-100 text-violet-600"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newTag = await api.tags.create({ name: newTagName, color: randomColor });
      await handleAddTag(newTag);
      setAllTags([...allTags, newTag]);
      setNewTagName("");
      setIsAdding(false);
    } catch (e) {
      console.error("Failed to create tag");
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    try {
      await api.tags.removeRelation(tagId, entityType, entityId);
      setTags(tags.filter(t => t.id !== tagId));
    } catch (e) {
      console.error("Failed to remove tag relation");
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center" onClick={(e) => e.stopPropagation()}>
      {tags.map(tag => (
        <span 
          key={tag.id} 
          className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5", tag.color)}
        >
          {tag.name}
          <button onClick={() => handleRemoveTag(tag.id)} className="hover:opacity-70">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      
      <div className="relative">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="w-6 h-6 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>

        {isAdding && (
          <div className="absolute left-0 top-8 w-48 bg-white rounded-lg shadow-xl border border-slate-100 z-50 p-3">
            <div className="space-y-2">
              <input
                autoFocus
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                placeholder="New tag..."
                className="w-full px-3 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10"
              />
              <div className="max-h-32 overflow-y-auto space-y-1">
                {allTags.filter(t => !tags.some(et => et.id === t.id)).map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => handleAddTag(tag)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-[10px] font-bold text-slate-600 uppercase tracking-widest"
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
